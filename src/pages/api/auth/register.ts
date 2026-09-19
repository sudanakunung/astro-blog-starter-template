import type { APIRoute } from 'astro';
import { hashPassword, createToken } from '../../../lib/auth/session';
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
    const { name, email, phone, password, confirm_password, store_id = 'navanusa' } = body;

    // Validation
    if (!name || !email || !password) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Nama, email, dan password wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (password.length < 6) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Password minimal 6 karakter.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (confirm_password && password !== confirm_password) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Konfirmasi password tidak cocok.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check existing email
    const existing = await db
      .prepare('SELECT id FROM customers WHERE store_id = ? AND email = ?')
      .bind(store_id, email.toLowerCase().trim())
      .first();

    if (existing) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Email sudah terdaftar. Silakan login.' }),
        { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Create customer
    const customerId = `cust_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
    const passwordHash = await hashPassword(password);

    await db
      .prepare(
        `INSERT INTO customers (id, store_id, name, email, phone, password_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())`
      )
      .bind(customerId, store_id, name.trim(), email.toLowerCase().trim(), phone?.trim() || null, passwordHash)
      .run();

    // Create token
    const token = await createToken(
      { sub: customerId, email: email.toLowerCase().trim(), name: name.trim(), store_id },
      env
    );

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Akun berhasil dibuat! Anda otomatis login.',
        token,
        customer: {
          id: customerId,
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone?.trim() || null,
        },
      }),
      { status: 201, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
