import type { APIRoute } from 'astro';
import { verifyToken, extractToken } from '../../../lib/auth/session';
import { initDatabase } from '../../../lib/db/initDb';

export const prerender = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

/**
 * GET /api/orders/my
 * Mengembalikan semua order milik customer yang sedang login
 * beserta item-itemnya dan informasi tracking
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const db = env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Database tidak tersedia' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await initDatabase(db);

    const token = extractToken(request);
    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Silakan login terlebih dahulu.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const payload = await verifyToken(token, env);
    if (!payload) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Token tidak valid atau kedaluwarsa.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Ambil profil customer untuk mendapatkan email & phone
    const customer = await db
      .prepare('SELECT id, name, email, phone FROM customers WHERE id = ?')
      .bind(payload.sub)
      .first<any>();

    if (!customer) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Akun tidak ditemukan.' }),
        { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Query orders berdasarkan customer_id (untuk order setelah login),
    // atau email/phone (untuk order sebelum fitur login ada)
    const { results: orders } = await db
      .prepare(
        `SELECT 
           id, store_id, customer_name, customer_phone, customer_email,
           shipping_address, status, total_amount, shipping_cost,
           shipping_courier, shipping_service, tracking_number,
           biteship_order_id, mayar_transaction_id,
           created_at, updated_at
         FROM orders
         WHERE 
           customer_id = ?
           OR (customer_email IS NOT NULL AND customer_email = ?)
           OR customer_phone = ?
         ORDER BY created_at DESC
         LIMIT 50`
      )
      .bind(customer.id, customer.email || '', customer.phone)
      .all<any>();

    // Ambil item-item untuk setiap order
    const ordersWithItems = await Promise.all(
      (orders || []).map(async (order: any) => {
        const { results: items } = await db
          .prepare(
            `SELECT product_id, product_name, price, qty, subtotal
             FROM order_items WHERE order_id = ?`
          )
          .bind(order.id)
          .all<any>();

        // Parse shipping_address jika berupa JSON string
        let shippingAddress = order.shipping_address;
        try {
          if (typeof shippingAddress === 'string' && shippingAddress.startsWith('{')) {
            shippingAddress = JSON.parse(shippingAddress);
          }
        } catch {
          // Biarkan as-is jika bukan JSON
        }

        return {
          ...order,
          shipping_address: shippingAddress,
          items: items || [],
        };
      })
    );

    return new Response(
      JSON.stringify({ ok: true, orders: ordersWithItems }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('GET /api/orders/my Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
