# Wails Desktop App - Astro & Cloudflare D1 Sync

Aplikasi desktop berbasis **Wails (Go + HTML/JS/CSS)** untuk mengelola katalog produk dan melakukan sinkronisasi dua langkah (two-step sync) ke storefront **Astro** yang di-deploy di **Cloudflare Pages & D1 Database**.

---

## ⚡ Arsitektur Sinkronisasi 2 Langkah

Tiap kali produk ditambahkan atau diubah di aplikasi desktop ini, dua proses dijalankan secara berurutan:

```
[ Wails Desktop App (Go) ]
        │
        ├── 1. POST /api/products (Bearer Token) ────► [ Cloudflare D1 Database ]
        │                                             (Stok & Harga Real-Time)
        │
        └── 2. POST Deploy Hook URL ────────────────► [ Cloudflare Pages Build ]
                                                      (Static HTML Storefront di-generate ulang)
```

1. **Langkah 1 (Data D1)**: Data produk dikirim ke Worker / Astro API `/api/products` dengan authorization `Bearer INTERNAL_API_TOKEN`. Data di-upsert ke tabel `products` di Cloudflare D1 sehingga cek stok & checkout selalu real-time.
2. **Langkah 2 (Static Rebuild)**: Trigger Deploy Hook Cloudflare Pages via HTTP POST untuk men-generate ulang halaman statis Astro (`/products/[slug]`), memastikan nama, deskripsi, foto, dan harga di storefront statis selalu sinkron.

---

## 🚀 Cara Menjalankan

### 1. Prasyarat
- **Go**: `go version >= 1.22` (Sudah terpasang di sistem Anda)
- **Wails CLI**: `v2.11.0` (Sudah terpasang di sistem Anda)

### 2. Mode Pengembangan (Live Dev)
Buka terminal dan jalankan:
```bash
cd wails-app
wails dev
```

### 3. Build Executable (.exe)
Untuk membuat file binary siap pakai untuk Windows:
```bash
cd wails-app
wails build
```
File executable hasil build akan berada di `wails-app/build/bin/store-manager-sync.exe`.

---

## ⚙️ Pengaturan di Aplikasi (Settings)

Saat aplikasi terbuka, klik tombol **Settings** di navbar atas dan masukkan parameter berikut:

1. **Store ID**: ID unik toko multi-tenant (contoh: `navanusa`).
2. **Worker API URL**:
   - Lokal: `http://localhost:4321`
   - Produksi: `https://your-domain.pages.dev` atau URL Worker Anda.
3. **Internal API Token**:
   - Token rahasia yang Anda simpan di Cloudflare via `wrangler secret put INTERNAL_API_TOKEN`.
4. **Cloudflare Pages Deploy Hook URL**:
   - Dapatkan dari dashboard Cloudflare:
     `Cloudflare Dashboard` &rarr; `Pages Project` &rarr; `Settings` &rarr; `Builds & deployments` &rarr; `Deploy hooks` &rarr; `Create hook`.

---

## 📂 Struktur Folder `wails-app`

```
wails-app/
├── app.go                  # Struct App & method yang dipanggil oleh frontend JS
├── main.go                 # Entry point Wails desktop window & asset server
├── go.mod / go.sum         # Dependensi Go
├── wails.json              # Konfigurasi build Wails v2
├── pkg/
│   ├── models/             # Model data Product, StoreConfig, dan SyncResult
│   ├── services/           # Logika HTTP Sync 2 Langkah (Worker D1 & Deploy Hook)
│   └── storage/            # Penyimpanan konfigurasi lokal user (config.json)
└── frontend/
    └── dist/               # UI Dashboard (HTML, CSS, JS)
        ├── index.html
        ├── style.css
        └── main.js
```
