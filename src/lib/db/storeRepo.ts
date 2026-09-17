import type { Store } from '../../types/d1';

export async function getStoreByDomainOrId(db: D1Database, hostOrId: string): Promise<Store | null> {
  try {
    // 1. Cek berdasarkan custom domain
    const byDomain = await db
      .prepare("SELECT * FROM stores WHERE domain = ? AND status = 'active' LIMIT 1")
      .bind(hostOrId)
      .first<Store>();

    if (byDomain) return byDomain;

    // 2. Fallback cek berdasarkan store id (misal subdomain atau slug)
    const cleanId = hostOrId.split('.')[0];
    const byId = await db
      .prepare("SELECT * FROM stores WHERE id = ? AND status = 'active' LIMIT 1")
      .bind(cleanId)
      .first<Store>();

    return byId ?? null;
  } catch (error) {
    console.error('Error fetching store from D1:', error);
    return null;
  }
}
