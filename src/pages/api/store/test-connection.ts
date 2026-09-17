import type { APIRoute } from 'astro';

export const prerender = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { service, api_key } = await request.json();

    if (!api_key || api_key.trim() === '') {
      return new Response(
        JSON.stringify({ ok: false, error: 'API Key tidak boleh kosong' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const trimmedKey = api_key.trim();

    if (service === 'mayar') {
      // Test Mayar API Key by fetching user balance or profile
      try {
        const res = await fetch('https://api.mayar.id/hl/v1/user/profile', {
          headers: {
            Authorization: `Bearer ${trimmedKey}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 200 || res.status === 201 || (data as any)?.statusCode === 200) {
          return new Response(
            JSON.stringify({
              ok: true,
              message: 'Koneksi ke Mayar Payment Gateway Berhasil!',
              details: (data as any)?.data?.name ? `Akun: ${(data as any).data.name}` : undefined,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } else {
          return new Response(
            JSON.stringify({
              ok: false,
              error: `Mayar API error (Status ${res.status}): ${(data as any)?.messages || 'API Key tidak valid'}`,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      } catch (err: any) {
        return new Response(
          JSON.stringify({ ok: false, error: `Gagal menghubungi server Mayar: ${err.message}` }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    } else if (service === 'biteship') {
      // Test Biteship API Key by requesting courier list
      try {
        const res = await fetch('https://api.biteship.com/v1/couriers', {
          headers: {
            Authorization: trimmedKey.startsWith('biteship_') ? trimmedKey : trimmedKey,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json().catch(() => ({}));

        if (res.status === 200 && (data as any)?.success !== false) {
          return new Response(
            JSON.stringify({
              ok: true,
              message: 'Koneksi ke Biteship Logistics API Berhasil!',
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        } else {
          return new Response(
            JSON.stringify({
              ok: false,
              error: `Biteship error (Status ${res.status}): ${(data as any)?.error || 'API Key Biteship tidak valid'}`,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          );
        }
      } catch (err: any) {
        return new Response(
          JSON.stringify({ ok: false, error: `Gagal menghubungi server Biteship: ${err.message}` }),
          { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ ok: false, error: 'Service tidak dikenal (gunakan "mayar" atau "biteship")' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  } catch (error: any) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
