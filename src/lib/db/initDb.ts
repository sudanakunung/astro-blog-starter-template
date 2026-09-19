export async function initDatabase(db: D1Database): Promise<{ success: boolean; message: string }> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      domain TEXT UNIQUE,
      mayar_api_key TEXT,
      mayar_webhook_secret TEXT,
      biteship_api_key TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      weight_gram INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id)`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      shipping_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total_amount INTEGER NOT NULL,
      shipping_cost INTEGER NOT NULL DEFAULT 0,
      mayar_transaction_id TEXT,
      biteship_order_id TEXT,
      tracking_number TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id)`,
    `CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      price INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      subtotal INTEGER NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`,
    `CREATE TABLE IF NOT EXISTS stock_reservations (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      title TEXT NOT NULL,
      image_url TEXT NOT NULL,
      link_url TEXT NOT NULL DEFAULT '#',
      link_text TEXT NOT NULL DEFAULT 'view product',
      order_num INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS idx_banners_store ON banners(store_id)`,
    `CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(store_id, order_num)`
  ];

  for (const sql of statements) {
    try {
      await db.prepare(sql).run();
    } catch (err: any) {
      console.warn(`[initDatabase] Table migration warning:`, err?.message);
    }
  }

  // Pastikan default store 'navanusa' ada
  try {
    await db.prepare(`
      INSERT OR IGNORE INTO stores (id, name, status, created_at, updated_at) 
      VALUES ('navanusa', 'Navanusa Store', 'active', unixepoch(), unixepoch())
    `).run();
  } catch (e) {}

  return { success: true, message: 'All tables initialized' };
}
