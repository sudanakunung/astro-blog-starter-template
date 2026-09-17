/**
 * Crypto Utilities using Web Crypto API (AES-GCM 256-bit)
 * Compatible with Cloudflare Workers, Node.js 18+, and standard browsers.
 */

const DEFAULT_DEV_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

async function getKey(rawKeyB64?: string): Promise<CryptoKey> {
  const keyStr = rawKeyB64 || DEFAULT_DEV_KEY;
  let keyBytes: Uint8Array;

  try {
    if (keyStr.length === 64 && /^[0-9a-fA-F]+$/.test(keyStr)) {
      // Hex string (32 bytes)
      keyBytes = new Uint8Array(keyStr.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
    } else {
      // Base64 string or arbitrary text
      const binary = atob(keyStr);
      keyBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        keyBytes[i] = binary.charCodeAt(i);
      }
    }
  } catch {
    // If not valid base64/hex, hash string to 256-bit using SHA-256
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(keyStr));
    keyBytes = new Uint8Array(hash);
  }

  // Ensure 32 bytes for AES-256
  if (keyBytes.length !== 32) {
    const hash = await crypto.subtle.digest('SHA-256', keyBytes);
    keyBytes = new Uint8Array(hash);
  }

  return await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
}

/**
 * Encrypts plaintext string to format: `<iv_b64>:<cipher_b64>`
 */
export async function encryptSecret(text: string, rawKeyB64?: string): Promise<string> {
  if (!text || text.trim() === '') return '';

  const key = await getKey(rawKeyB64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text.trim());

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  const ivB64 = btoa(String.fromCharCode(...iv));
  const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(cipherBuffer)));

  return `${ivB64}:${cipherB64}`;
}

/**
 * Decrypts string from format: `<iv_b64>:<cipher_b64>` back to plaintext
 */
export async function decryptSecret(encryptedPayload: string, rawKeyB64?: string): Promise<string> {
  if (!encryptedPayload || !encryptedPayload.includes(':')) return '';

  const [ivB64, cipherB64] = encryptedPayload.split(':');
  if (!ivB64 || !cipherB64) return '';

  const key = await getKey(rawKeyB64);

  const ivBytes = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const cipherBytes = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    cipherBytes
  );

  return new TextDecoder().decode(decryptedBuffer);
}

/**
 * Masks sensitive API key (e.g. `sk_live_1234567890abcdef` -> `••••••••cdef`)
 */
export function maskKey(keyString: string): string {
  if (!keyString) return '';
  const trimmed = keyString.trim();
  if (trimmed.length <= 4) return '••••';
  const lastFour = trimmed.slice(-4);
  return `••••••••${lastFour}`;
}
