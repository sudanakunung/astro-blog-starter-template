import type { APIRoute } from 'astro';

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

export const DELETE: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Banner ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const env = locals.runtime?.env as any;
    const internalToken = env?.INTERNAL_API_TOKEN || process.env.INTERNAL_API_TOKEN || import.meta.env.INTERNAL_API_TOKEN;

    const authHeader = request.headers.get('Authorization');
    if (internalToken && authHeader !== `Bearer ${internalToken}`) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Unauthorized: Invalid bearer token' }),
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

    const url = new URL(request.url);
    const storeId = url.searchParams.get('store_id') || 'jewellery';

    await db
      .prepare('DELETE FROM banners WHERE id = ? AND store_id = ?')
      .bind(id, storeId)
      .run();

    return new Response(
      JSON.stringify({ ok: true, message: 'Banner deleted successfully', id }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  } catch (error: any) {
    console.error('API /api/banners/[id] DELETE Error:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
