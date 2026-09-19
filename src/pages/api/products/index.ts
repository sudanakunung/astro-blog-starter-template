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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const internalToken = env?.INTERNAL_API_TOKEN || process.env.INTERNAL_API_TOKEN || import.meta.env.INTERNAL_API_TOKEN;

    // 1. Verifikasi Token Keamanan Internal
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

    // 2. Baca Body Payload Produk dari Client
    const body = await request.json();
    const {
      id,
      store_id,
      name,
      slug,
      description = '',
      price = 0,
      stock = 0,
      image_url = '',
      weight_gram = 0,
      is_active = 1,
    } = body;

    if (!id || !store_id || !name || !slug) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Missing required fields: id, store_id, name, slug',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // 3. Upsert ke D1 Database
    await db
      .prepare(
        `INSERT INTO products (id, store_id, name, slug, description, price, stock, image_url, weight_gram, is_active, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())
         ON CONFLICT(id) DO UPDATE SET
           store_id = excluded.store_id,
           name = excluded.name,
           slug = excluded.slug,
           description = excluded.description,
           price = excluded.price,
           stock = excluded.stock,
           image_url = excluded.image_url,
           weight_gram = excluded.weight_gram,
           is_active = excluded.is_active,
           updated_at = unixepoch()`
      )
      .bind(
        id,
        store_id,
        name,
        slug,
        description,
        Math.round(Number(price)),
        Math.round(Number(stock)),
        image_url,
        Math.round(Number(weight_gram)),
        is_active ? 1 : 0
      )
      .run();

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Product synced to D1 successfully',
        id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('API /api/products POST Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
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
    const storeId = url.searchParams.get('store_id') || locals.store?.id || 'navanusa';
    const all = url.searchParams.get('all') === 'true';

    let query = 'SELECT * FROM products WHERE store_id = ?';
    if (!all) {
      query += ' AND is_active = 1';
    }
    query += ' ORDER BY updated_at DESC';

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
    console.error('API /api/products GET Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
