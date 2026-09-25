const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const mime = require('mime-types');
const crypto = require('crypto');
require('dotenv').config();

const {
  ensureBucket,
  checkHealth,
  uploadImage,
  listImages,
  deleteImage,
  bucketName,
} = require('./minio-client');

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS and JSON body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Konfigurasi Multer (Memory Storage agar langsung di-stream ke MinIO)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Maksimal 100 MB (Mendukung video)
  },
  fileFilter: (req, file, cb) => {
    // Validasi menerima file gambar atau video
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar (JPG, PNG, WebP, GIF) dan video (MP4, WebM, MOV) yang diperbolehkan!'), false);
    }
  },
});

/**
 * Helper untuk membuat nama file yang rapi dan unik
 */
function generateFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30);

  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const randomStr = crypto.randomBytes(3).toString('hex');
  return `${timestamp}-${baseName || 'img'}-${randomStr}${ext}`;
}

// ── API ROUTES ──────────────────────────────────────────────────

/**
 * Cek status MinIO & konfigurasi
 */
app.get('/api/health', async (req, res) => {
  const health = await checkHealth();
  res.json({
    ok: health.connected,
    bucket: bucketName,
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    error: health.error || null,
  });
});

/**
 * Upload Single / Multiple Images
 * Menerima form field: 'file' atau 'image'
 */
app.post('/api/upload', (req, res) => {
  const uploadSingle = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]);

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ ok: false, error: err.message });
    }

    const file = req.files?.file?.[0] || req.files?.image?.[0];
    if (!file) {
      return res.status(400).json({ ok: false, error: 'Tidak ada file yang diunggah. Kirim dengan field name "file" atau "image".' });
    }

    try {
      const fileName = generateFileName(file.originalname);
      const mimeType = file.mimetype || mime.lookup(fileName) || 'application/octet-stream';

      const result = await uploadImage(file.buffer, fileName, mimeType);

      return res.status(200).json({
        ok: true,
        message: 'Gambar berhasil diunggah ke MinIO!',
        data: {
          name: result.name,
          url: result.url,
          size: result.size,
          mimeType: result.mimeType,
        },
      });
    } catch (uploadErr) {
      console.error('[Upload Error]', uploadErr);
      return res.status(500).json({
        ok: false,
        error: `Gagal menyimpan ke MinIO: ${uploadErr.message}`,
      });
    }
  });
});

/**
 * Mengambil daftar gambar yang ada di MinIO
 */
app.get('/api/images', async (req, res) => {
  try {
    const images = await listImages();
    res.json({ ok: true, images });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * Menghapus gambar dari MinIO
 */
app.delete('/api/images/:name', async (req, res) => {
  const imageName = req.params.name;
  if (!imageName) {
    return res.status(400).json({ ok: false, error: 'Nama gambar wajib diisi' });
  }

  try {
    await deleteImage(imageName);
    res.json({ ok: true, message: `Gambar '${imageName}' berhasil dihapus` });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Start Server
app.listen(port, async () => {
  console.log(`\n🚀 [MinIO Uploader Service] berjalan di http://localhost:${port}`);
  console.log(`📁 Web UI Uploader siap diakses di http://localhost:${port}`);

  // Inisialisasi bucket otomatis
  await ensureBucket();
});
