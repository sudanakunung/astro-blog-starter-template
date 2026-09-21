import type { APIRoute } from 'astro';
import { initDatabase } from '../../../lib/db/initDb';
import { findOrderByBiteshipId, updateOrderShipping } from '../../../lib/db/orderRepo';
import type { Order } from '../../../types/d1';

export const prerender = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, X-Biteship-Token',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const HEAD: APIRoute = async () => {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
};

/**
 * GET /api/webhooks/biteship
 * Health check & verification endpoint (berguna saat test URL di dashboard Biteship)
 */
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      ok: true,
      success: true,
      status: 'ok',
      service: 'biteship-webhook',
      timestamp: new Date().toISOString(),
      message: 'ok',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
};

/**
 * POST /api/webhooks/biteship
 * Menangani event notifikasi dari Biteship:
 * - order.status (allocated, picking_up, picked, dropping_off, delivered, cancelled, dll.)
 * - order.waybill_id_updated (nomor resi terbit)
 * - test (verifikasi dashboard)
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const db = env?.DB as D1Database;

    // Safely parse body (menerima empty body tanpa throw error)
    let body: any = {};
    try {
      const rawText = await request.text();
      if (rawText && rawText.trim()) {
        body = JSON.parse(rawText);
      }
    } catch {
      body = {};
    }

    // 1. Identifikasi event dan data payload Biteship
    const event = body.event || body.type || '';
    const orderId = body.order_id || body.id || body.courier?.order_id || '';
    const waybillId =
      body.courier_tracking_id ||
      body.waybill_id ||
      body.tracking_id ||
      body.courier?.waybill_id ||
      body.courier?.tracking_id ||
      '';
    const biteshipStatus = (body.status || body.courier?.status || '').toLowerCase();
    const courierCompany = body.courier?.company || body.courier_name || '';

    // 2. Handle test / installation ping event dari dashboard Biteship (termasuk empty body)
    if (event === 'test' || event === 'order.test' || (!orderId && !waybillId)) {
      return new Response(
        JSON.stringify({
          ok: true,
          success: true,
          status: 'ok',
          message: 'ok',
          received_event: event || 'ping',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!db) {
      console.warn('[Biteship Webhook] Database D1 tidak tersedia. Mengembalikan 200 agar webhook tidak gagal.');
      return new Response(
        JSON.stringify({
          ok: true,
          warning: 'Database D1 tidak tersedia, event diterima.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    await initDatabase(db);

    // 3. Cari order yang cocok di database berdasarkan biteship_order_id atau ID order internal
    const existingOrder = await findOrderByBiteshipId(db, orderId);

    if (!existingOrder) {
      console.warn(`[Biteship Webhook] Order tidak ditemukan untuk order_id: ${orderId}`);
      // Tetap kembalikan 200 agar Biteship tidak melakukan retry berulang kali
      return new Response(
        JSON.stringify({
          ok: true,
          warning: `Order dengan ID ${orderId} tidak ditemukan di database.`,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // 4. Pemetaan status Biteship ke status pesanan di sistem toko kita
    // Status Biteship:
    // - allocated / courier_assigned
    // - picking_up (kurir menjemput barang)
    // - picked / dropping_off / in_transit (barang sudah dibawa kurir / sedang diantar)
    // - delivered (barang sampai di tujuan)
    // - cancelled / rejected / courier_not_found (batal / ditolak)
    let newOrderStatus: Order['status'] | undefined = undefined;

    if (biteshipStatus === 'delivered') {
      newOrderStatus = 'completed';
    } else if (
      biteshipStatus === 'picked' ||
      biteshipStatus === 'dropping_off' ||
      biteshipStatus === 'in_transit'
    ) {
      newOrderStatus = 'shipped';
    } else if (biteshipStatus === 'cancelled' || biteshipStatus === 'rejected') {
      newOrderStatus = 'cancelled';
    } else if (waybillId && (existingOrder.status === 'pending' || existingOrder.status === 'paid')) {
      // Jika resi sudah keluar, minimal status menjadi shipped
      newOrderStatus = 'shipped';
    }

    // 5. Update data pengiriman dan status order di D1
    await updateOrderShipping(db, existingOrder.id, {
      status: newOrderStatus,
      biteshipOrderId: orderId || existingOrder.biteship_order_id || undefined,
      trackingNumber: waybillId || existingOrder.tracking_number || undefined,
      shippingCourier: courierCompany || undefined,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Status pengiriman Biteship berhasil diperbarui.',
        order_id: existingOrder.id,
        biteship_order_id: orderId,
        tracking_number: waybillId || existingOrder.tracking_number,
        order_status: newOrderStatus || existingOrder.status,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('API /api/webhooks/biteship POST Error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error.message || 'Internal Server Error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};
