import type { APIRoute } from 'astro';

import { initDatabase } from '../../../lib/db/initDb';

export const prerender = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const db = env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Database binding (D1) not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await initDatabase(db);

    const url = new URL(request.url);
    const storeId = url.searchParams.get('store_id') || locals.store?.id || 'jewellery';
    const all = url.searchParams.get('all') === 'true';

    let query = 'SELECT * FROM banners WHERE store_id = ?';
    if (!all) {
      query += ' AND is_active = 1';
    }
    query += ' ORDER BY order_num ASC, created_at DESC';

    const { results } = await db.prepare(query).bind(storeId).all();

    return new Response(JSON.stringify(results || []), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('API /api/banners GET Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const internalToken = env?.INTERNAL_API_TOKEN || process.env.INTERNAL_API_TOKEN || import.meta.env.INTERNAL_API_TOKEN;

    // 1. Verifikasi Token Keamanan Internal (jika dikonfigurasi)
    const authHeader = request.headers.get('Authorization');
    if (internalToken && authHeader !== `Bearer ${internalToken}`) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized: Invalid or missing bearer token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const db = env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Database binding (D1) not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await initDatabase(db);

    // 2. Baca payload
    const body = await request.json();
    const {
      id,
      store_id,
      title,
      image_url,
      link_url = '#',
      link_text = 'view product',
      order_num = 0,
      is_active = 1,
    } = body;

    if (!id || !store_id || !title || !image_url) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Missing required fields: id, store_id, title, image_url',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 3. Upsert ke D1 Database
    await db
      .prepare(
        `INSERT INTO banners (id, store_id, title, image_url, link_url, link_text, order_num, is_active, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
         ON CONFLICT(id) DO UPDATE SET
           store_id = excluded.store_id,
           title = excluded.title,
           image_url = excluded.image_url,
           link_url = excluded.link_url,
           link_text = excluded.link_text,
           order_num = excluded.order_num,
           is_active = excluded.is_active,
           updated_at = unixepoch()`
      )
      .bind(
        id,
        store_id,
        title,
        image_url,
        link_url,
        link_text,
        Math.round(Number(order_num)),
        is_active ? 1 : 0
      )
      .run();

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Banner saved successfully',
        id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('API /api/banners POST Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
