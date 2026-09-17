import type { D1Product } from '../../types/d1';

export async function getActiveProducts(db: D1Database, storeId: string): Promise<D1Product[]> {
  try {
    const { results } = await db
      .prepare(
        `SELECT id, store_id, name, slug, description, price, stock, image_url, weight_gram, is_active, created_at, updated_at 
         FROM products 
         WHERE store_id = ? AND is_active = 1 
         ORDER BY created_at DESC`
      )
      .bind(storeId)
      .all<D1Product>();

    return results ?? [];
  } catch (error) {
    console.error('Error fetching products from D1:', error);
    return [];
  }
}

export async function getProductBySlug(db: D1Database, storeId: string, slug: string): Promise<D1Product | null> {
  try {
    const product = await db
      .prepare(
        `SELECT id, store_id, name, slug, description, price, stock, image_url, weight_gram, is_active, created_at, updated_at 
         FROM products 
         WHERE store_id = ? AND slug = ? AND is_active = 1 
         LIMIT 1`
      )
      .bind(storeId, slug)
      .first<D1Product>();

    return product ?? null;
  } catch (error) {
    console.error('Error fetching product by slug from D1:', error);
    return null;
  }
}
