-- ============================================================
-- Skema database D1 untuk platform multi-tenant
-- Semua tabel punya store_id untuk memisahkan data antar toko
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- 1. STORES
-- Data tenant/toko. Satu baris = satu pelanggan Anda.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,              -- store_id unik, misal 'navanusa', dipakai di semua request
  name TEXT NOT NULL,               -- nama toko
  domain TEXT UNIQUE,               -- domain custom pelanggan, misal 'tokoabc.com'
  mayar_api_key TEXT,               -- API key Mayar milik toko ini (idealnya dienkripsi di layer aplikasi)
  mayar_webhook_secret TEXT,        -- secret untuk verifikasi webhook Mayar
  biteship_api_key TEXT,            -- API key Biteship milik toko ini
  status TEXT NOT NULL DEFAULT 'active',  -- active | suspended | trial
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ------------------------------------------------------------
-- 2. PRODUCTS
-- Katalog produk, terikat ke satu store.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,              -- uuid produk
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,               -- untuk URL halaman produk statis di Astro
  description TEXT,
  price INTEGER NOT NULL,           -- simpan dalam rupiah bulat (bukan desimal) untuk hindari masalah float
  stock INTEGER NOT NULL DEFAULT 0, -- stok tersedia saat ini (sudah dikurangi reservasi aktif)
  image_url TEXT,
  weight_gram INTEGER,              -- dibutuhkan untuk hitung ongkir di Biteship
  is_active INTEGER NOT NULL DEFAULT 1,  -- 1 = tampil di storefront, 0 = disembunyikan
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_store ON products(store_id);

-- ------------------------------------------------------------
-- 3. ORDERS
-- Order dari buyer. Ditulis oleh Worker saat checkout,
-- diupdate saat webhook Mayar/Biteship masuk.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,              -- uuid order
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,   -- simpan sebagai JSON string (jalan, kota, kode pos, dll)
  status TEXT NOT NULL DEFAULT 'pending',
    -- pending -> menunggu bayar
    -- paid -> sudah dibayar (dari webhook Mayar)
    -- shipped -> resi sudah dibuat (dari webhook/API Biteship)
    -- completed -> selesai
    -- cancelled -> batal / reservasi expired
  total_amount INTEGER NOT NULL,
  shipping_cost INTEGER NOT NULL DEFAULT 0,
  mayar_transaction_id TEXT,        -- id transaksi dari Mayar, untuk pencocokan webhook
  biteship_order_id TEXT,           -- id order dari Biteship
  tracking_number TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_orders_store ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_mayar_tx ON orders(mayar_transaction_id);

-- ------------------------------------------------------------
-- 4. ORDER_ITEMS
-- Detail produk per order. Harga & nama di-snapshot di sini
-- supaya riwayat order tidak berubah walau produk diedit/dihapus.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,       -- snapshot nama produk saat order dibuat
  price INTEGER NOT NULL,           -- snapshot harga saat order dibuat
  qty INTEGER NOT NULL,
  subtotal INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ------------------------------------------------------------
-- 5. STOCK_RESERVATIONS
-- Kunci sementara stok saat buyer checkout tapi belum bayar,
-- supaya dua buyer tidak bisa beli unit terakhir yang sama.
-- Reservasi yang expired dilepas oleh cron/scheduled Worker.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stock_reservations (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',  -- active | released | committed
  expires_at INTEGER NOT NULL,      -- unix timestamp, misal now + 30 menit
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_reservations_product ON stock_reservations(product_id);
CREATE INDEX IF NOT EXISTS idx_reservations_expiry ON stock_reservations(status, expires_at);

-- ------------------------------------------------------------
-- 6. BANNERS (Hero Carousel)
-- Banner slide untuk carousel di halaman depan (hero section)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,              -- uuid banner
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL DEFAULT '#',
  link_text TEXT NOT NULL DEFAULT 'view product',
  order_num INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,  -- 1 = tampil, 0 = sembunyikan
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_banners_store ON banners(store_id);
CREATE INDEX IF NOT EXISTS idx_banners_order ON banners(store_id, order_num);

-- ------------------------------------------------------------
-- 7. CUSTOMERS
-- Akun pelanggan untuk login & checkout.
-- Password disimpan sebagai SHA-256 hash + salt.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,       -- format: salt:hash (SHA-256)
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE (store_id, email)
);

CREATE INDEX IF NOT EXISTS idx_customers_store ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(store_id, email);

-- ------------------------------------------------------------
-- 8. CUSTOMER_ADDRESSES
-- Buku alamat pelanggan. Minimal 1 alamat untuk bisa checkout.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_addresses (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Rumah',       -- "Rumah", "Kantor", dll.
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,                     -- Jalan, RT/RW, patokan, dll.
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  district TEXT,
  postal_code TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,     -- 1 = alamat utama
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id);
