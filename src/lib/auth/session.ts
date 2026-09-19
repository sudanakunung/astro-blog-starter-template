/**
 * Session & Auth utilities using Web Crypto API.
 * Compatible with Cloudflare Workers (no Node.js dependencies).
 */

const TOKEN_SECRET_FALLBACK = 'nordic-store-secret-key-2024-do-not-use-in-production';

function getSecret(env?: any): string {
  return env?.JWT_SECRET || env?.ENCRYPTION_KEY || TOKEN_SECRET_FALLBACK;
}

// ─── Password Hashing (SHA-256 + Salt) ───────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const data = new TextEncoder().encode(saltHex + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 2) return false;
  
  const [saltHex, expectedHash] = parts;
  const data = new TextEncoder().encode(saltHex + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex === expectedHash;
}

// ─── Token (HMAC-SHA256 based JWT-like) ──────────────────────

interface TokenPayload {
  sub: string;       // customer_id
  email: string;
  name: string;
  store_id: string;
  iat: number;       // issued at (unix seconds)
  exp: number;       // expiry (unix seconds)
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let padded = str.replace(/-/g, '+').replace(/_/g, '/');
  while (padded.length % 4) padded += '=';
  return atob(padded);
}

async function hmacSign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(sig)));
}

async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(message, secret);
  return expected === signature;
}

export async function createToken(
  payload: { sub: string; email: string; name: string; store_id: string },
  env?: any,
  expiresInSeconds: number = 7 * 24 * 60 * 60 // 7 days default
): Promise<string> {
  const secret = getSecret(env);
  const now = Math.floor(Date.now() / 1000);

  const tokenPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(tokenPayload));
  const signature = await hmacSign(`${header}.${body}`, secret);

  return `${header}.${body}.${signature}`;
}

export async function verifyToken(token: string, env?: any): Promise<TokenPayload | null> {
  try {
    const secret = getSecret(env);
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const valid = await hmacVerify(`${header}.${body}`, signature, secret);
    if (!valid) return null;

    const payload: TokenPayload = JSON.parse(base64UrlDecode(body));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return null; // expired

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract bearer token from Authorization header or query param
 */
export function extractToken(request: Request): string | null {
  const auth = request.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  const url = new URL(request.url);
  return url.searchParams.get('token');
}
