import type { APIRoute } from 'astro';
import { encryptSecret, decryptSecret, maskKey } from '../../../lib/utils/crypto';
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

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const internalToken = env?.INTERNAL_API_TOKEN || process.env.INTERNAL_API_TOKEN || import.meta.env.INTERNAL_API_TOKEN;

    // 1. Verifikasi Token Internal
    const authHeader = request.headers.get('Authorization');
    if (internalToken && authHeader !== `Bearer ${internalToken}`) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized: Invalid or missing bearer token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const db = env?.DB as D1Database;
    if (!db) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Database binding (D1) not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await initDatabase(db);

    const body = await request.json();
    const {
      store_id = 'navanusa',
      name = '',
      mayar_api_key = '',
      mayar_webhook_secret = '',
      biteship_api_key = '',
      origin_postal_code = '',
    } = body;

    if (!store_id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Store ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const encryptionKey = env?.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;

    // 2. Ambil data store yang ada jika ada field yang tidak diisi (supaya tidak menimpa key lama jika tidak diubah)
    const existingStore = await db
      .prepare('SELECT mayar_api_key, mayar_webhook_secret, biteship_api_key, origin_postal_code, name FROM stores WHERE id = ?')
      .bind(store_id)
      .first<any>();

    let encryptedMayarKey = existingStore?.mayar_api_key || '';
    if (mayar_api_key && mayar_api_key.trim() !== '') {
      encryptedMayarKey = await encryptSecret(mayar_api_key, encryptionKey);
    }

    let encryptedWebhookSecret = existingStore?.mayar_webhook_secret || '';
    if (mayar_webhook_secret && mayar_webhook_secret.trim() !== '') {
      encryptedWebhookSecret = await encryptSecret(mayar_webhook_secret, encryptionKey);
    }

    let encryptedBiteshipKey = existingStore?.biteship_api_key || '';
    if (biteship_api_key && biteship_api_key.trim() !== '') {
      encryptedBiteshipKey = await encryptSecret(biteship_api_key, encryptionKey);
    }

    const postalCode = origin_postal_code && origin_postal_code.trim() !== ''
      ? origin_postal_code.trim()
      : (existingStore?.origin_postal_code || '80361');

    const storeName = name || existingStore?.name || 'Store ' + store_id;

    // 3. Upsert (First-time setup / update aman)
    await db
      .prepare(
        `INSERT INTO stores (id, name, mayar_api_key, mayar_webhook_secret, biteship_api_key, origin_postal_code, status, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', unixepoch())
         ON CONFLICT(id) DO UPDATE SET
           name = excluded.name,
           mayar_api_key = excluded.mayar_api_key,
           mayar_webhook_secret = excluded.mayar_webhook_secret,
           biteship_api_key = excluded.biteship_api_key,
           origin_postal_code = excluded.origin_postal_code,
           updated_at = unixepoch()`
      )
      .bind(
        store_id,
        storeName,
        encryptedMayarKey,
        encryptedWebhookSecret,
        encryptedBiteshipKey,
        postalCode
      )
      .run();

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Pengaturan toko & kredensial terenkripsi berhasil disimpan ke D1',
        store_id,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('API /api/store/settings POST Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const env = locals.runtime?.env as any;
    const db = env?.DB as D1Database;
    if (!db) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Database binding (D1) not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    await initDatabase(db);

    const url = new URL(request.url);
    const storeId = url.searchParams.get('store_id') || locals.store?.id || 'navanusa';
    const encryptionKey = env?.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;

    const store = await db
      .prepare('SELECT id, name, domain, mayar_api_key, mayar_webhook_secret, biteship_api_key, origin_postal_code, status FROM stores WHERE id = ?')
      .bind(storeId)
      .first<any>();

    if (!store) {
      return new Response(
        JSON.stringify({
          ok: true,
          store_id: storeId,
          name: '',
          origin_postal_code: '80361',
          has_mayar_key: false,
          mayar_key_preview: '',
          has_mayar_webhook: false,
          has_biteship_key: false,
          biteship_key_preview: '',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Buat safe preview (tanpa membocorkan key asli ke frontend)
    let mayarPreview = '';
    if (store.mayar_api_key) {
      try {
        const decrypted = await decryptSecret(store.mayar_api_key, encryptionKey);
        mayarPreview = maskKey(decrypted);
      } catch {
        mayarPreview = '••••••••••••';
      }
    }

    let biteshipPreview = '';
    if (store.biteship_api_key) {
      try {
        const decrypted = await decryptSecret(store.biteship_api_key, encryptionKey);
        biteshipPreview = maskKey(decrypted);
      } catch {
        biteshipPreview = '••••••••••••';
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        store_id: store.id,
        name: store.name,
        domain: store.domain,
        origin_postal_code: store.origin_postal_code || '80361',
        status: store.status,
        has_mayar_key: Boolean(store.mayar_api_key && store.mayar_api_key !== ''),
        mayar_key_preview: mayarPreview,
        has_mayar_webhook: Boolean(store.mayar_webhook_secret && store.mayar_webhook_secret !== ''),
        has_biteship_key: Boolean(store.biteship_api_key && store.biteship_api_key !== ''),
        biteship_key_preview: biteshipPreview,
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
    console.error('API /api/store/settings GET Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
