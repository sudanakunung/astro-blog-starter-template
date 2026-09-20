import type { APIRoute } from 'astro';
import { verifyPassword, createToken } from '../../../lib/auth/session';
import { initDatabase } from '../../../lib/db/initDb';

export const prerender = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const POST: APIRoute = async ({ request, locals }) => {
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

    const body = await request.json();
    const { email, password, store_id = 'jewellery' } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Email dan password wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Find customer
    const customer = await db
      .prepare('SELECT id, name, email, phone, password_hash FROM customers WHERE store_id = ? AND email = ?')
      .bind(store_id, email.toLowerCase().trim())
      .first<any>();

    if (!customer) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Email tidak terdaftar. Silakan daftar akun baru.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verify password
    const valid = await verifyPassword(password, customer.password_hash);
    if (!valid) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Password salah. Coba lagi.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create token
    const token = await createToken(
      { sub: customer.id, email: customer.email, name: customer.name, store_id },
      env
    );

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Login berhasil!',
        token,
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
