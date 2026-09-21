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
 * Menangani 3 event utama dari Biteship:
 * 1. order.status (update status pengiriman: confirmed, allocated, picking_up, picked, dropping_off, delivered, cancelled)
 * 2. order.price (update tarif/ongkir jika berat aktual paket berbeda dari estimasi awal)
 * 3. order.waybill_id (update nomor resi / AWB saat diterbitkan atau diperbarui)
 * Serta ping verifikasi dashboard Biteship ('test' / 'order.test')
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

    // 1. Ekstraksi data event dan payload Biteship
    const event = body.event || body.type || '';
    const orderId = body.order_id || body.id || body.courier?.order_id || '';
    
    // Prioritaskan courier_waybill_id (nomor resi AWB aktual dari kurir seperti SKS-XXXXX / abc-1234)
    const waybillId =
      body.courier_waybill_id ||
      body.waybill_id ||
      body.courier?.waybill_id ||
      body.courier_tracking_id ||
      body.tracking_id ||
      body.courier?.tracking_id ||
      '';

    const biteshipStatus = (body.status || body.courier?.status || '').toLowerCase();
    const courierCompany = body.courier_company || body.courier?.company || body.courier_name || '';
    const courierType = body.courier_type || body.courier?.type || '';
    
    // Biaya pengiriman aktual (khusus event order.price)
    const shipmentFee =
      typeof body.shippment_fee === 'number'
        ? body.shippment_fee
        : typeof body.price === 'number' && event === 'order.price'
        ? body.price
        : undefined;

    // 2. Handle test / ping verification dari dashboard Biteship
    if (event === 'test' || event === 'order.test' || (!orderId && !waybillId)) {
      return new Response(
        JSON.stringify({
          ok: true,
          success: true,
          status: 'ok',
          message: 'Webhook Biteship aktif dan terverifikasi.',
          received_event: event || 'ping',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (!db) {
      console.warn('[Biteship Webhook] Database D1 tidak tersedia. Mengembalikan 200.');
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
      // Kembalikan 200 agar Biteship tidak melakukan retry berulang kali
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

    // 4. Pemetaan status Biteship ke status pesanan internal
    // Status Biteship:
    // - confirmed / allocated / courier_assigned
    // - picking_up (kurir menjemput barang)
    // - picked / dropping_off / in_transit (barang dibawa kurir / sedang diantar)
    // - delivered (barang sampai di tujuan)
    // - cancelled / rejected / courier_not_found (batal)
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
    } else if (
      (event === 'order.waybill_id' || waybillId) &&
      (existingOrder.status === 'pending' || existingOrder.status === 'paid')
    ) {
      // Jika resi sudah keluar, minimal status menjadi shipped
      newOrderStatus = 'shipped';
    }

    // 5. Update data pesanan di D1 database
    await updateOrderShipping(db, existingOrder.id, {
      status: newOrderStatus,
      biteshipOrderId: orderId || existingOrder.biteship_order_id || undefined,
      trackingNumber: waybillId || existingOrder.tracking_number || undefined,
      shippingCourier: courierCompany || undefined,
      shippingService: courierType || undefined,
      shippingCost: shipmentFee,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Webhook Biteship event '${event}' berhasil diproses.`,
        order_id: existingOrder.id,
        biteship_order_id: orderId,
        event,
        tracking_number: waybillId || existingOrder.tracking_number,
        order_status: newOrderStatus || existingOrder.status,
        shipping_courier: courierCompany || undefined,
        shipping_service: courierType || undefined,
        shipping_cost: shipmentFee ?? existingOrder.shipping_cost,
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
