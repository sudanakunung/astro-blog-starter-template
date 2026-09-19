import type { APIRoute } from 'astro';
import { verifyToken, extractToken } from '../../../lib/auth/session';

export const prerender = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Address ID diperlukan.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const env = locals.runtime?.env as any;
    const db = env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Database tidak tersedia' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

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

    // Only delete if belongs to customer
    await db
      .prepare('DELETE FROM customer_addresses WHERE id = ? AND customer_id = ?')
      .bind(id, payload.sub)
      .run();

    return new Response(
      JSON.stringify({ ok: true, message: 'Alamat berhasil dihapus.' }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
