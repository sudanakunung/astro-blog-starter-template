import type { D1Product } from '../../types/d1';

export function inferProductCategory(item: { name: string; description?: string | null; category?: string | null }): string {
  if (item.category && item.category.trim()) {
    return item.category.trim();
  }

  const text = `${item.name} ${item.description || ''}`.toLowerCase();

  if (text.includes('kalung') || text.includes('necklace') || text.includes('pendant') || text.includes('liontin')) {
    return 'Kalung';
  }
  if (text.includes('cincin') || text.includes('ring') || text.includes('solitaire') || text.includes('wedding')) {
    return 'Cincin';
  }
  if (text.includes('gelang') || text.includes('bracelet') || text.includes('bangle')) {
    return 'Gelang';
  }
  if (text.includes('anting') || text.includes('earring') || text.includes('stud') || text.includes('hoop')) {
    return 'Anting';
  }
  if (
    text.includes('pillow') ||
    text.includes('bantal') ||
    text.includes('clock') ||
    text.includes('jam') ||
    text.includes('lamp') ||
    text.includes('lampu') ||
    text.includes('pot') ||
    text.includes('mug') ||
    text.includes('cangkir') ||
    text.includes('art') ||
    text.includes('lukisan')
  ) {
    return 'Dekorasi & Rumah';
  }
  if (text.includes('book') || text.includes('buku') || text.includes('notebook') || text.includes('typewriter')) {
    return 'Buku & Alat Tulis';
  }

  return 'Aksesoris';
}

export const fallbackSampleProducts: D1Product[] = [
  {
    id: 'prod-1',
    store_id: 'jewellery',
    name: 'Kalung Liontin Berlian Aurora',
    slug: 'kalung-liontin-berlian-aurora',
    description: 'Kalung emas putih 18K dengan liontin berlian murni berkilau anggun.',
    category: 'Kalung',
    price: 3250000,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    weight_gram: 100,
    is_active: 1,
    created_at: 1710000001,
    updated_at: 1710000001,
  },
  {
    id: 'prod-2',
    store_id: 'jewellery',
    name: 'Cincin Solitaire Emas Rose Gold',
    slug: 'cincin-solitaire-emas-rose-gold',
    description: 'Cincin tunangan elegan dengan balutan emas mawar 18 karat dan permata zirkon.',
    category: 'Cincin',
    price: 2450000,
    stock: 8,
    image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    weight_gram: 80,
    is_active: 1,
    created_at: 1710000002,
    updated_at: 1710000002,
  },
  {
    id: 'prod-3',
    store_id: 'jewellery',
    name: 'Gelang Rantai Emas Minimalist Bangle',
    slug: 'gelang-rantai-emas-minimalist-bangle',
    description: 'Gelang rantai modern dengan aksen mutiara air tawar dan finishing glossy.',
    category: 'Gelang',
    price: 1850000,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1611591475819-79b8b730ab09?auto=format&fit=crop&w=600&q=80',
    weight_gram: 120,
    is_active: 1,
    created_at: 1710000003,
    updated_at: 1710000003,
  },
  {
    id: 'prod-4',
    store_id: 'jewellery',
    name: 'Anting Mutiara South Sea Drop',
    slug: 'anting-mutiara-south-sea-drop',
    description: 'Anting gantung mutiara laut selatan dengan kait emas putih murni.',
    category: 'Anting',
    price: 1650000,
    stock: 10,
    image_url: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
    weight_gram: 90,
    is_active: 1,
    created_at: 1710000004,
    updated_at: 1710000004,
  },
  {
    id: 'prod-5',
    store_id: 'jewellery',
    name: 'Kalung Choker Rantai Emas Klasik',
    slug: 'kalung-choker-rantai-emas-klasik',
    description: 'Choker rantai emas kuning minimalis yang cocok untuk layering sehari-hari.',
    category: 'Kalung',
    price: 2100000,
    stock: 14,
    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
    weight_gram: 110,
    is_active: 1,
    created_at: 1710000005,
    updated_at: 1710000005,
  },
  {
    id: 'prod-6',
    store_id: 'jewellery',
    name: 'Cincin Band Eternity Berlian',
    slug: 'cincin-band-eternity-berlian',
    description: 'Cincin eternity bertabur deretan berlian melingkar sempurna tanda cinta abadi.',
    category: 'Cincin',
    price: 3890000,
    stock: 6,
    image_url: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?auto=format&fit=crop&w=600&q=80',
    weight_gram: 85,
    is_active: 1,
    created_at: 1710000006,
    updated_at: 1710000006,
  },
  {
    id: 'prod-7',
    store_id: 'jewellery',
    name: 'Gelang Tennis Permata Kilau Mewah',
    slug: 'gelang-tennis-permata-kilau-mewah',
    description: 'Gelang tennis klasik dengan deretan zirkon AAA dan pengait ganda aman.',
    category: 'Gelang',
    price: 2750000,
    stock: 9,
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    weight_gram: 130,
    is_active: 1,
    created_at: 1710000007,
    updated_at: 1710000007,
  },
  {
    id: 'prod-8',
    store_id: 'jewellery',
    name: 'Anting Stud Bunga Kristal Swarovski',
    slug: 'anting-stud-bunga-kristal-swarovski',
    description: 'Anting tusuk model bunga kecil berkilau lembut untuk tampilan feminim.',
    category: 'Anting',
    price: 890000,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=600&q=80',
    weight_gram: 70,
    is_active: 1,
    created_at: 1710000008,
    updated_at: 1710000008,
  },
  {
    id: 'prod-9',
    store_id: 'jewellery',
    name: 'Minimalist Wall Clock',
    slug: 'minimalist-wall-clock',
    description: 'Jam dinding gaya Nordik minimalis dari kayu alami.',
    category: 'Dekorasi & Rumah',
    price: 299000,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1508423134147-addf71308178?auto=format&fit=crop&w=400&h=400&q=80',
    weight_gram: 800,
    is_active: 1,
    created_at: 1710000009,
    updated_at: 1710000009,
  },
  {
    id: 'prod-10',
    store_id: 'jewellery',
    name: 'Modern Desk Lamp',
    slug: 'modern-desk-lamp',
    description: 'Lampu meja estetik dengan nuansa cahaya hangat nordic.',
    category: 'Dekorasi & Rumah',
    price: 349000,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=400&h=400&q=80',
    weight_gram: 1200,
    is_active: 1,
    created_at: 1710000010,
    updated_at: 1710000010,
  },
  {
    id: 'prod-11',
    store_id: 'jewellery',
    name: 'Stripy Zig Zag Jigsaw Pillow',
    slug: 'stripy-zig-zag-pillow',
    description: 'Bantal santai bermotif zigzag katun organik.',
    category: 'Dekorasi & Rumah',
    price: 149000,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1555982105-d25af4182e4e?auto=format&fit=crop&w=400&h=400&q=80',
    weight_gram: 500,
    is_active: 1,
    created_at: 1710000011,
    updated_at: 1710000011,
  },
  {
    id: 'prod-12',
    store_id: 'jewellery',
    name: 'Nordic Ceramic Mug',
    slug: 'nordic-ceramic-mug',
    description: 'Cangkir keramik handmade dengan tekstur matte abu-abu lembut.',
    category: 'Dekorasi & Rumah',
    price: 89000,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&h=400&q=80',
    weight_gram: 350,
    is_active: 1,
    created_at: 1710000012,
    updated_at: 1710000012,
  },
];

export async function getActiveProducts(db?: D1Database | null, storeId = 'jewellery'): Promise<D1Product[]> {
  if (!db) {
    return fallbackSampleProducts;
  }

  try {
    let results: D1Product[] | null = null;
    try {
      const resp = await db
        .prepare(
          `SELECT id, store_id, name, slug, description, category, price, stock, image_url, weight_gram, is_active, created_at, updated_at 
           FROM products 
           WHERE store_id = ? AND is_active = 1 
           ORDER BY created_at DESC`
        )
        .bind(storeId)
        .all<D1Product>();
      results = resp.results;
    } catch (colErr: any) {
      if (colErr?.message?.includes('no such column: category')) {
        try {
          await db.prepare(`ALTER TABLE products ADD COLUMN category TEXT`).run();
        } catch (e) {}
        const resp = await db
          .prepare(
            `SELECT id, store_id, name, slug, description, price, stock, image_url, weight_gram, is_active, created_at, updated_at 
             FROM products 
             WHERE store_id = ? AND is_active = 1 
             ORDER BY created_at DESC`
          )
          .bind(storeId)
          .all<D1Product>();
        results = resp.results;
      } else {
        throw colErr;
      }
    }

    if (results && results.length > 0) {
      return results.map((p) => ({
        ...p,
        category: inferProductCategory(p),
      }));
    }

    return fallbackSampleProducts;
  } catch (error) {
    console.error('Error fetching products from D1:', error);
    return fallbackSampleProducts;
  }
}

export async function getProductBySlug(db: D1Database | undefined | null, storeId = 'jewellery', slug: string): Promise<D1Product | null> {
  if (!db) {
    const found = fallbackSampleProducts.find((p) => p.slug === slug);
    return found ? { ...found, category: inferProductCategory(found) } : null;
  }

  try {
    let product: D1Product | null = null;
    try {
      product = await db
        .prepare(
          `SELECT id, store_id, name, slug, description, category, price, stock, image_url, weight_gram, is_active, created_at, updated_at 
           FROM products 
           WHERE store_id = ? AND slug = ? AND is_active = 1 
           LIMIT 1`
        )
        .bind(storeId, slug)
        .first<D1Product>();
    } catch (colErr: any) {
      if (colErr?.message?.includes('no such column: category')) {
        try {
          await db.prepare(`ALTER TABLE products ADD COLUMN category TEXT`).run();
        } catch (e) {}
        product = await db
          .prepare(
            `SELECT id, store_id, name, slug, description, price, stock, image_url, weight_gram, is_active, created_at, updated_at 
             FROM products 
             WHERE store_id = ? AND slug = ? AND is_active = 1 
             LIMIT 1`
          )
          .bind(storeId, slug)
          .first<D1Product>();
      } else {
        throw colErr;
      }
    }

    if (product) {
      return {
        ...product,
        category: inferProductCategory(product),
      };
    }

    const fallbackFound = fallbackSampleProducts.find((p) => p.slug === slug);
    return fallbackFound ? { ...fallbackFound, category: inferProductCategory(fallbackFound) } : null;
  } catch (error) {
    console.error('Error fetching product by slug from D1:', error);
    const fallbackFound = fallbackSampleProducts.find((p) => p.slug === slug);
    return fallbackFound ? { ...fallbackFound, category: inferProductCategory(fallbackFound) } : null;
  }
}

