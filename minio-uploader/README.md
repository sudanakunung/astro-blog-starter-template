# MinIO Image Uploader Service

Aplikasi layanan upload gambar mandiri berbasis **MinIO (S3-Compatible Object Storage)**.
Dibuat untuk memudahkan upload gambar produk & banner, menghasilkan URL publik langsung yang siap disalin ke formulir Admin Toko / Wails Desktop App.

---

## 🚀 Fitur Unggulan

1. **Drag & Drop & Clipboard Paste**: Bisa seret file gambar langsung atau cukup `Ctrl+V` / `Cmd+V` screenshot langsung dari clipboard.
2. **Auto Public Read Policy**: Bucket otomatis disetting *Public Read* sehingga gambar bisa langsung dibuka oleh browser/website tanpa error 403.
3. **Galeri File MinIO**: Melihat daftar gambar yang tersimpan, salin URL dengan 1 klik, atau hapus file yang sudah tidak terpakai.
4. **REST API Siap Pakai**: Endpoint `POST /api/upload` untuk diintegrasikan langsung ke aplikasi frontend/Astro/Go.
5. **Docker Compose**: Menjalankan MinIO lokal hanya dengan 1 perintah.

---

## 🛠️ Langkah Menjalankan

### Langkah 1: Jalankan Server MinIO

Jika Anda memiliki Docker di komputer Anda:
```bash
cd minio-uploader
docker compose up -d
```
* **MinIO API**: `http://localhost:9000`
* **MinIO Console (Dashboard Web)**: `http://localhost:9001`
  * Username: `minioadmin`
  * Password: `minioadmin`

> *Catatan: Jika Anda menjalankan MinIO di server VPS atau hosting lain, sesuaikan host dan kredensial di file `.env`.*

---

### Langkah 2: Install Dependensi & Jalankan Uploader

Buka terminal di dalam folder `minio-uploader`:

```bash
cd minio-uploader
npm install
npm start
```

Aplikasi uploader akan aktif di:
👉 **http://localhost:4000**

---

## 📋 Cara Penggunaan untuk Toko / Admin

1. Buka browser ke **http://localhost:4000**.
2. Seret foto produk atau banner toko ke kotak upload.
3. Klik tombol **"Salin URL"** (contoh: `http://localhost:9000/ecommerce-images/20260924-cincin-emas-a1b2c3.jpg`).
4. Buka halaman Admin Website (`/admin`) atau aplikasi desktop Wails.
5. Tempelkan URL tersebut ke input **"URL Foto Produk"** atau **"URL Banner"**.
6. Simpan produk! Gambar akan langsung tampil di etalase toko.

---

## 🔌 Dokumentasi REST API

### 1. Upload Gambar
* **Method**: `POST`
* **URL**: `http://localhost:4000/api/upload`
* **Body**: `multipart/form-data`
  * Field: `file` (atau `image`)
* **Response Sukses (200)**:
```json
{
  "ok": true,
  "message": "Gambar berhasil diunggah ke MinIO!",
  "data": {
    "name": "20260924-kalung-emas-f489ad.jpg",
    "url": "http://localhost:9000/ecommerce-images/20260924-kalung-emas-f489ad.jpg",
    "size": 154230,
    "mimeType": "image/jpeg"
  }
}
```

### 2. Ambil Daftar Gambar
* **Method**: `GET`
* **URL**: `http://localhost:4000/api/images`

### 3. Hapus Gambar
* **Method**: `DELETE`
* **URL**: `http://localhost:4000/api/images/:nama_file`
