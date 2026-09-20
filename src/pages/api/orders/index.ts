import type { APIRoute } from 'astro';
import { createOrder } from '../../../lib/db/orderRepo';
import { initDatabase } from '../../../lib/db/initDb';
import { decryptSecret } from '../../../lib/utils/crypto';
import { createMayarPayment } from '../../../lib/services/mayar';

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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const db = env?.DB as D1Database;
    const body = await request.json();

    const {
      store_id = locals.store?.id || 'navanusa',
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      shipping_address,
      shipping_cost = 0,
      shipping_courier,
      shipping_service,
      total_amount,
      items = [],
    } = body;

    if (!customer_name || !customer_phone || !items.length) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Nama lengkap, nomor WhatsApp, dan produk di keranjang wajib diisi.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const calculatedShipping = Number(shipping_cost) || 0;
    const calculatedTotal = Number(total_amount) || items.reduce((sum: number, it: any) => sum + (it.price * it.qty), 0) + calculatedShipping;

    const addressString = typeof shipping_address === 'object' 
      ? JSON.stringify(shipping_address) 
      : String(shipping_address || '');

    let paymentUrl: string | undefined;
    let mayarTransactionId: string | undefined;

    if (db) {
      await initDatabase(db);

      // Buat invoice / payment request ke Mayar (user pilih metode di halaman Mayar)
      try {
        const storeRow = await db
          .prepare('SELECT mayar_api_key FROM stores WHERE id = ?')
          .bind(store_id)
          .first<{ mayar_api_key?: string }>();

        if (storeRow?.mayar_api_key) {
          const encryptionKey = env?.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
          let decryptedKey = storeRow.mayar_api_key;
          try {
            const decrypted = await decryptSecret(storeRow.mayar_api_key, encryptionKey);
            if (decrypted) decryptedKey = decrypted;
          } catch {
            // Gunakan as-is jika tidak dienkripsi
          }

          if (decryptedKey) {
            const originUrl = new URL(request.url).origin;
            // Setelah bayar di Mayar, user diarahkan kembali ke halaman sukses kita
            const redirectUrl = `${originUrl}/checkout/success?order_id=${orderId}&total=${calculatedTotal}&name=${encodeURIComponent(customer_name)}&phone=${encodeURIComponent(customer_phone)}`;

            const mayarRes = await createMayarPayment({
              apiKey: decryptedKey,
              orderId,
              amount: calculatedTotal,
              customerName: customer_name,
              customerEmail: customer_email,
              customerPhone: customer_phone,
              description: `Pesanan #${orderId} di Navanusa`,
              redirectUrl,
            });

            if (mayarRes.success && mayarRes.paymentUrl) {
              paymentUrl = mayarRes.paymentUrl;
              mayarTransactionId = mayarRes.transactionId;
            } else if (mayarRes.error) {
              console.warn('Mayar payment creation warning:', mayarRes.error);
            }
          }
        }
      } catch (mayarErr: any) {
        console.error('Error generating Mayar payment link:', mayarErr.message);
      }

      const orderParams = {
        id: orderId,
        store_id,
        customer_id: customer_id || undefined,
        customer_name,
        customer_phone,
        customer_email: customer_email || undefined,
        shipping_address: addressString,
        total_amount: calculatedTotal,
        shipping_cost: calculatedShipping,
        shipping_courier: shipping_courier || undefined,
        shipping_service: shipping_service || undefined,
        mayar_transaction_id: mayarTransactionId,
        items: items.map((it: any) => ({
          product_id: it.id || it.product_id,
          product_name: it.name || it.product_name,
          price: Number(it.price) || 0,
          qty: Number(it.qty) || 1,
          subtotal: (Number(it.price) || 0) * (Number(it.qty) || 1),
        })),
      };

      const result = await createOrder(db, orderParams);
      if (!result.success) {
        return new Response(
          JSON.stringify({ ok: false, error: result.error || 'Gagal menyimpan pesanan' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        order_id: orderId,
        total_amount: calculatedTotal,
        shipping_cost: calculatedShipping,
        payment_url: paymentUrl,
        mayar_transaction_id: mayarTransactionId,
        status: 'pending',
        message: 'Pesanan berhasil dibuat!',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('API /api/orders POST Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
