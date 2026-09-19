import type { APIRoute } from 'astro';
import { verifyToken, extractToken } from '../../../lib/auth/session';
import { initDatabase } from '../../../lib/db/initDb';

export const prerender = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

// GET — List customer addresses
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
        JSON.stringify({ ok: false, error: 'Token tidak valid.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { results } = await db
      .prepare(
        `SELECT id, label, recipient_name, phone, address, province, city, district, postal_code, is_default 
         FROM customer_addresses 
         WHERE customer_id = ? 
         ORDER BY is_default DESC, created_at DESC`
      )
      .bind(payload.sub)
      .all<any>();

    return new Response(
      JSON.stringify({ ok: true, addresses: results || [] }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

// POST — Add or update address
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
        JSON.stringify({ ok: false, error: 'Token tidak valid.' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const body = await request.json();
    const {
      id,
      label = 'Rumah',
      recipient_name,
      phone,
      address,
      province,
      city,
      district = '',
      postal_code,
      is_default = 0,
    } = body;

    if (!recipient_name || !phone || !address || !province || !city || !postal_code) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Semua field alamat wajib diisi (nama penerima, telp, alamat, provinsi, kota, kode pos).' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const addressId = id || `addr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    // If setting as default, un-default others first
    if (is_default) {
      await db
        .prepare('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?')
        .bind(payload.sub)
        .run();
    }

    await db
      .prepare(
        `INSERT INTO customer_addresses (id, customer_id, label, recipient_name, phone, address, province, city, district, postal_code, is_default, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
         ON CONFLICT(id) DO UPDATE SET
           label = excluded.label,
           recipient_name = excluded.recipient_name,
           phone = excluded.phone,
           address = excluded.address,
           province = excluded.province,
           city = excluded.city,
           district = excluded.district,
           postal_code = excluded.postal_code,
           is_default = excluded.is_default`
      )
      .bind(addressId, payload.sub, label, recipient_name, phone, address, province, city, district, postal_code, is_default ? 1 : 0)
      .run();

    return new Response(
      JSON.stringify({ ok: true, message: 'Alamat berhasil disimpan.', id: addressId }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
