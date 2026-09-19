import type { D1Banner } from '../../types/d1';
import type { CarouselSlide } from '../../types/store';
import { carouselSlides as defaultSlides } from '../../data/storeData';

/**
 * Mengambil daftar banner aktif dari Cloudflare D1.
 * Jika tabel belum ada atau kosong, fallback ke data bawaan di storeData.ts.
 */
export async function getActiveBanners(db?: D1Database, storeId: string = 'navanusa'): Promise<CarouselSlide[]> {
  if (!db) {
    return defaultSlides;
  }

  try {
    const { results } = await db
      .prepare(
        `SELECT id, store_id, title, image_url, link_url, link_text, order_num, is_active, created_at, updated_at
         FROM banners
         WHERE store_id = ? AND is_active = 1
         ORDER BY order_num ASC, created_at DESC`
      )
      .bind(storeId)
      .all<D1Banner>();

    if (results && results.length > 0) {
      return results.map((b) => ({
        id: b.id,
        title: b.title,
        image: b.image_url,
        link: b.link_url || '#',
        linkText: b.link_text || 'view product',
      }));
    }

    return defaultSlides;
  } catch (error) {
    console.warn('Banner table not found or error fetching banners from D1, using fallback slides:', error);
    return defaultSlides;
  }
}

/**
 * Mengambil semua banner (termasuk yang nonaktif) untuk Admin Panel.
 */
export async function getAllBanners(db: D1Database, storeId: string = 'navanusa'): Promise<D1Banner[]> {
  try {
    const { results } = await db
      .prepare(
        `SELECT id, store_id, title, image_url, link_url, link_text, order_num, is_active, created_at, updated_at
         FROM banners
         WHERE store_id = ?
         ORDER BY order_num ASC, created_at DESC`
      )
      .bind(storeId)
      .all<D1Banner>();

    return results ?? [];
  } catch (error) {
    console.error('Error fetching all banners from D1:', error);
    return [];
  }
}
