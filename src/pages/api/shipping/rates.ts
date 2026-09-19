import type { APIRoute } from 'astro';
import { decryptSecret } from '../../../lib/utils/crypto';
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

/**
 * POST /api/shipping/rates
 * Body: {
 *   destination_postal_code: string,
 *   items: Array<{ name, value, weight, quantity }>
 * }
 * Returns: list of courier rates from Biteship API
 */
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
    const { destination_postal_code, items = [] } = body;

    if (!destination_postal_code) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Kode pos tujuan (destination_postal_code) wajib diisi.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!items.length) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Minimal 1 item diperlukan untuk menghitung ongkir.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get store config (biteship_api_key + origin_postal_code)
    const storeId = 'navanusa';
    const store = await db
      .prepare('SELECT biteship_api_key, origin_postal_code FROM stores WHERE id = ?')
      .bind(storeId)
      .first<any>();

    if (!store || !store.biteship_api_key) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'API Key Biteship belum diatur. Silakan konfigurasi di Admin Panel → Kunci API Mayar & Biteship.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Decrypt the Biteship API key
    const encryptionKey = env?.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
    let biteshipKey = store.biteship_api_key;
    try {
      const decrypted = await decryptSecret(store.biteship_api_key, encryptionKey);
      if (decrypted) biteshipKey = decrypted;
    } catch {
      // Use as-is if decryption fails (might be plain text in dev)
    }

    const originPostalCode = store.origin_postal_code || '80361';

    // Build Biteship request
    const biteshipBody = {
      origin_postal_code: parseInt(originPostalCode, 10),
      destination_postal_code: parseInt(destination_postal_code, 10),
      couriers: 'jne,sicepat,jnt,anteraja,tiki',
      items: items.map((item: any) => ({
        name: item.name || 'Product',
        value: Math.round(Number(item.value) || Number(item.price) || 0),
        weight: Math.round(Number(item.weight) || Number(item.weight_gram) || 500), // default 500g
        quantity: Math.round(Number(item.quantity) || Number(item.qty) || 1),
        length: 20,
        width: 15,
        height: 10,
      })),
    };

    // Call Biteship API
    const biteshipRes = await fetch('https://api.biteship.com/v1/rates/couriers', {
      method: 'POST',
      headers: {
        'Authorization': biteshipKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(biteshipBody),
    });

    const biteshipData = await biteshipRes.json().catch(() => ({})) as any;

    if (!biteshipRes.ok || biteshipData.success === false) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Biteship API error: ${biteshipData?.error || biteshipData?.message || 'Gagal mendapatkan tarif ongkir'}`,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Parse and format courier pricing
    const pricing = (biteshipData.pricing || []).map((courier: any) => ({
      courier_code: courier.courier_code,
      courier_name: courier.courier_name,
      courier_service_code: courier.courier_service_code,
      courier_service_name: courier.courier_service_name,
      type: courier.type, // instant, same_day, next_day, reguler, cargo, etc.
      description: courier.description,
      duration: courier.duration,
      shipment_duration_range: courier.shipment_duration_range,
      shipment_duration_unit: courier.shipment_duration_unit,
      price: courier.price,
      insurance_fee: courier.insurance_fee || 0,
    }));

    // Sort by price ascending
    pricing.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));

    return new Response(
      JSON.stringify({
        ok: true,
        origin_postal_code: originPostalCode,
        destination_postal_code,
        couriers: pricing,
        total_couriers: pricing.length,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('Shipping rates error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
