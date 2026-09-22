export async function initDatabase(db: D1Database): Promise<{ success: boolean; message: string }> {
  const statements = [
    // 1. STORES
    `CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT,
      domain TEXT UNIQUE,
      mayar_api_key TEXT,
      mayar_webhook_secret TEXT,
      biteship_api_key TEXT,
      origin_postal_code TEXT DEFAULT '80361',
      status TEXT NOT NULL DEFAULT 'active',
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    // 2. PRODUCTS
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      category TEXT,
      price INTEGER NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      weight_gram INTEGER,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id)`,
    // 3. ORDERS
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      customer_id TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      shipping_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      total_amount INTEGER NOT NULL,
      shipping_cost INTEGER NOT NULL DEFAULT 0,
      shipping_courier TEXT,
      shipping_service TEXT,
      mayar_transaction_id TEXT,
      biteship_order_id TEXT,
      tracking_number TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id)`,
    // 4. ORDER_ITEMS
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
    // 5. STOCK_RESERVATIONS
    `CREATE TABLE IF NOT EXISTS stock_reservations (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      qty INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    // 6. BANNERS
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
    `CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(store_id, order_num)`,
    // 7. CUSTOMERS
    `CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS idx_customers_store ON customers(store_id)`,
    // 8. CUSTOMER_ADDRESSES
    `CREATE TABLE IF NOT EXISTS customer_addresses (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT 'Rumah',
      recipient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT,
      postal_code TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id)`
  ];

  for (const sql of statements) {
    try {
      await db.prepare(sql).run();
    } catch (err: any) {
      console.warn(`[initDatabase] Migration warning:`, err?.message);
    }
  }

  // Add origin_postal_code column to stores if missing (safe ALTER)
  try {
    await db.prepare(`ALTER TABLE stores ADD COLUMN origin_postal_code TEXT DEFAULT '80361'`).run();
  } catch (e) {
    // Column already exists — safe to ignore
  }

  // Add title column to stores if missing (safe ALTER)
  try {
    await db.prepare(`ALTER TABLE stores ADD COLUMN title TEXT`).run();
  } catch (e) {
    // Column already exists — safe to ignore
  }

  // Add customer_id column to orders if missing
  try {
    await db.prepare(`ALTER TABLE products ADD COLUMN category TEXT`).run();
  } catch (e) {}
  try {
    await db.prepare(`ALTER TABLE orders ADD COLUMN customer_id TEXT`).run();
  } catch (e) {}
  try {
    await db.prepare(`ALTER TABLE orders ADD COLUMN shipping_courier TEXT`).run();
  } catch (e) {}
  try {
    await db.prepare(`ALTER TABLE orders ADD COLUMN shipping_service TEXT`).run();
  } catch (e) {}

  // Unique index on customers(store_id, email) — safe create
  try {
    await db.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email ON customers(store_id, email)`).run();
  } catch (e) {}

  // Ensure default store 'jewellery' exists
  try {
    await db.prepare(`
      INSERT OR IGNORE INTO stores (id, name, title, status, origin_postal_code, created_at, updated_at) 
      VALUES ('jewellery', 'Navanusa Jewellery', 'Navanusa Jewellery - Nordic Minimalist Shop', 'active', '80361', unixepoch(), unixepoch())
    `).run();
  } catch (e) {}

  return { success: true, message: 'All tables initialized' };
}
