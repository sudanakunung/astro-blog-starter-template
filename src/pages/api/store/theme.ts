import type { APIRoute } from 'astro';
import { initDatabase } from '../../../lib/db/initDb';

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

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const db = env?.DB as D1Database;
    const url = new URL(request.url);
    const storeId = url.searchParams.get('store_id') || locals.store?.id || 'jewellery';

    if (!db) {
      return new Response(
        JSON.stringify({ ok: true, theme: 'nordic', source: 'default (no db)' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await initDatabase(db);

    const store = await db
      .prepare('SELECT id, theme FROM stores WHERE id = ?')
      .bind(storeId)
      .first<{ id: string; theme?: string }>();

    return new Response(
      JSON.stringify({
        ok: true,
        store_id: storeId,
        theme: store?.theme || 'nordic',
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('API /api/store/theme GET Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const db = env?.DB as D1Database;
    const body = await request.json();
    const { store_id = 'jewellery', theme = 'nordic' } = body;

    // Normalisasi nama tema
    const normalizedTheme =
      theme === 'kaufmann' || theme === 'theme3'
        ? 'kaufmann'
        : theme === 'impulse' || theme === 'theme2'
        ? 'impulse'
        : 'nordic';

    if (!db) {
      return new Response(
        JSON.stringify({
          ok: true,
          theme: normalizedTheme,
          store_id,
          message: `Tema berhasil diatur ke ${normalizedTheme} (simulasi mode lokal)`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await initDatabase(db);

    // Coba UPDATE dulu
    const updateResult = await db
      .prepare('UPDATE stores SET theme = ?, updated_at = unixepoch() WHERE id = ?')
      .bind(normalizedTheme, store_id)
      .run();

    // Jika store belum ada sama sekali di DB, INSERT
    if (!updateResult.meta.changes || updateResult.meta.changes === 0) {
      await db
        .prepare(`
          INSERT INTO stores (id, name, title, theme, status, created_at, updated_at)
          VALUES (?, 'Navanusa Jewellery', 'Navanusa Jewellery - Nordic Minimalist Shop', ?, 'active', unixepoch(), unixepoch())
          ON CONFLICT(id) DO UPDATE SET theme = excluded.theme, updated_at = unixepoch()
        `)
        .bind(store_id, normalizedTheme)
        .run();
    }

    const themeLabel =
      normalizedTheme === 'kaufmann'
        ? 'Theme 3 (Susanne Kaufmann Skincare)'
        : normalizedTheme === 'impulse'
        ? 'Theme 2 (Impulse Editorial)'
        : 'Theme 1 (Nordic Minimalist)';

    return new Response(
      JSON.stringify({
        ok: true,
        store_id,
        theme: normalizedTheme,
        message: `Template berhasil diubah ke ${themeLabel}`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('API /api/store/theme POST Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
