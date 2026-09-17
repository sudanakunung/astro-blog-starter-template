import type { APIRoute } from 'astro';

export const prerender = false;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
};

export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ ok: false, error: 'Product ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const env = locals.runtime?.env as any;
    const db = env?.DB;
    if (!db) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Database binding (D1) not available' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const product = await db
      .prepare('SELECT id, stock, is_active FROM products WHERE id = ? LIMIT 1')
      .bind(id)
      .first<{ id: string; stock: number; is_active: number }>();

    if (!product) {
      return new Response(JSON.stringify({ ok: false, error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        id: product.id,
        stock: product.stock,
        is_active: product.is_active === 1,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
