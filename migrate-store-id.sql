-- Migration: Rename store_id dari 'navanusa' → 'jewellery'
-- Jalankan: wrangler d1 execute navanusa --remote --file=migrate-store-id.sql

PRAGMA foreign_keys = OFF;

-- 0. Hapus store 'jewellery' yang kosong (jika sudah ada dari initDb)
DELETE FROM stores WHERE id = 'jewellery';

-- 1. Update child tables dulu (yang punya FK ke stores.id)
UPDATE products     SET store_id = 'jewellery' WHERE store_id = 'navanusa';
UPDATE orders       SET store_id = 'jewellery' WHERE store_id = 'navanusa';
UPDATE banners      SET store_id = 'jewellery' WHERE store_id = 'navanusa';
UPDATE customers    SET store_id = 'jewellery' WHERE store_id = 'navanusa';

-- 2. Update tabel stores terakhir (primary key)
UPDATE stores SET id = 'jewellery', name = 'Navanusa Jewellery' WHERE id = 'navanusa';

PRAGMA foreign_keys = ON;
