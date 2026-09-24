import type { APIRoute } from 'astro';

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
 * POST /api/upload
 * Endpoint proxy dari Astro Worker ke MinIO Uploader Service di VPS
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Content-Type harus multipart/form-data' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') || formData.get('image');

    if (!file || typeof file === 'string') {
      return new Response(
        JSON.stringify({ ok: false, error: 'File gambar wajib disertakan (field "file" atau "image")' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Forward ke MinIO uploader service
    const minioFormData = new FormData();
    minioFormData.append('file', file);

    const minioEndpoint = 'https://minio.navanusa.com/api/upload';
    const minioRes = await fetch(minioEndpoint, {
      method: 'POST',
      body: minioFormData,
    });

    const data: any = await minioRes.json();
    return new Response(JSON.stringify(data), {
      status: minioRes.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error in /api/upload:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message || 'Gagal mengunggah gambar ke MinIO' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};
