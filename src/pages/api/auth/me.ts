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

    // Extract and verify token
    const token = extractToken(request);
    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Token tidak ditemukan. Silakan login.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const payload = await verifyToken(token, env);
    if (!payload) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Token tidak valid atau sudah kedaluwarsa.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get customer profile
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

    // Get customer addresses
    const { results: addresses } = await db
      .prepare(
        `SELECT id, label, recipient_name, phone, address, province, city, district, postal_code, is_default 
         FROM customer_addresses 
         WHERE customer_id = ? 
         ORDER BY is_default DESC, created_at DESC`
      )
      .bind(customer.id)
      .all<any>();

    return new Response(
      JSON.stringify({
        ok: true,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
        addresses: addresses || [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Auth /me error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
