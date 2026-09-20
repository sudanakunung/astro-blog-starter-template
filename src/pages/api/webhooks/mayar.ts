import type { APIRoute } from 'astro';
import { initDatabase } from '../../../lib/db/initDb';
import { decryptSecret } from '../../../lib/utils/crypto';
import { updateOrderStatus, findOrderByIdOrTransaction } from '../../../lib/db/orderRepo';

export const prerender = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

// GET handler untuk endpoint verification / health-check dari Mayar dashboard
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      ok: true,
      service: 'mayar-webhook',
      status: 'active',
      timestamp: new Date().toISOString(),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
  );
};

// POST handler untuk menerima notifikasi event pembayaran dari Mayar
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const db = env?.DB as D1Database;

    // Parse body terlebih dahulu (sebelum cek DB) agar bisa handle event 'testing'
    const body = await request.json().catch(() => ({}));
    const event = body.event || body.type || '';
    const eventData = body.data || body;

    // Mayar mengirim 'testing' event saat admin klik "Test URL" dari dashboard.
    // Selalu kembalikan 200 agar tidak dicatat sebagai FAILED.
    if (event === 'testing') {
      return new Response(
        JSON.stringify({ ok: true, message: 'Webhook endpoint aktif dan siap menerima event.' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!db) {
      // Return 200 agar Mayar tidak retry terus — log di sisi kita sudah cukup
      console.error('[Mayar Webhook] Database D1 tidak tersedia');
      return new Response(
        JSON.stringify({ ok: true, warning: 'Database not configured, event acknowledged but not processed.' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await initDatabase(db);

    const url = new URL(request.url);
    const storeId = url.searchParams.get('store_id') || locals.store?.id || 'jewellery';

    // 1. Ambil Webhook Secret Toko dari D1
    const store = await db
      .prepare('SELECT id, mayar_webhook_secret FROM stores WHERE id = ?')
      .bind(storeId)
      .first<{ id: string; mayar_webhook_secret?: string }>();

    const encryptionKey = env?.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
    let expectedSecret = store?.mayar_webhook_secret || '';

    if (expectedSecret && encryptionKey) {
      try {
        const decrypted = await decryptSecret(expectedSecret, encryptionKey);
        if (decrypted) expectedSecret = decrypted;
      } catch {
        // Gunakan as-is jika tidak terenkripsi
      }
    }

    // 2. Verifikasi Token Webhook Secret (jika toko telah mengatur webhook secret)
    if (expectedSecret && expectedSecret.trim() !== '') {
      const incomingSecret =
        url.searchParams.get('secret') ||
        url.searchParams.get('token') ||
        request.headers.get('x-mayar-secret') ||
        request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');

      if (!incomingSecret || incomingSecret.trim() !== expectedSecret.trim()) {
        console.warn('Mayar webhook signature/secret mismatch');
        return new Response(
          JSON.stringify({ ok: false, error: 'Invalid or missing webhook secret' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    // 3. Data sudah diparsing di atas
    const transactionId = eventData.id || eventData.transactionId || eventData.invoiceId || '';
    const paymentStatus = (eventData.status || '').toLowerCase();
    const description = eventData.description || '';
    const extraData = eventData.extraData || {};

    // 4. Cari Order ID yang sesuai
    let orderId = extraData.orderId || eventData.orderId || eventData.order_id;

    // Jika orderId belum ketemu, ekstrak pattern ORD-XXXX-XXXX dari description
    if (!orderId && description) {
      const match = description.match(/ORD-[A-Za-z0-9]+-[A-Za-z0-9]+/);
      if (match) {
        orderId = match[0];
      }
    }

    // Cari order di database
    let existingOrder = null;
    if (orderId) {
      existingOrder = await findOrderByIdOrTransaction(db, orderId);
    }
    if (!existingOrder && transactionId) {
      existingOrder = await findOrderByIdOrTransaction(db, transactionId);
    }

    if (!existingOrder) {
      console.warn('Mayar webhook: Pesanan tidak ditemukan untuk event:', { event, transactionId, orderId });
      // Tetap kirim 200 agar Mayar tidak retry terus menerus jika pesanan bukan dari sistem ini
      return new Response(
        JSON.stringify({
          ok: true,
          warning: 'Order not found in database',
          transaction_id: transactionId,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 5. Update Status Pesanan jika pembayaran berhasil
    const isSuccessEvent =
      event === 'payment.received' ||
      event === 'invoice.paid' ||
      event === 'payment.success' ||
      paymentStatus === 'paid' ||
      paymentStatus === 'success' ||
      paymentStatus === 'settlement';

    if (isSuccessEvent) {
      await updateOrderStatus(db, existingOrder.id, 'paid', transactionId || existingOrder.mayar_transaction_id || undefined);
      console.log(`[Mayar Webhook] Order #${existingOrder.id} status diupdate menjadi PAID`);

      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Order marked as paid successfully',
          order_id: existingOrder.id,
          status: 'paid',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Event received: ${event}`,
        order_id: existingOrder.id,
        current_status: existingOrder.status,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Mayar Webhook Handler Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Webhook Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
