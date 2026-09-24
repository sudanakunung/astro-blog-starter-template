const Minio = require('minio');
require('dotenv').config();

const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
const port = parseInt(process.env.MINIO_PORT || '9000', 10);
const useSSL = process.env.MINIO_USE_SSL === 'true';
const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';
const bucketName = process.env.MINIO_BUCKET || 'ecommerce-images';
const publicUrlBase = process.env.MINIO_PUBLIC_URL || `http://${endpoint}:${port}/${bucketName}`;

// Inisialisasi MinIO Client
const minioClient = new Minio.Client({
  endPoint: endpoint,
  port: port,
  useSSL: useSSL,
  accessKey: accessKey,
  secretKey: secretKey,
});

/**
 * Pastikan bucket ada dan memiliki policy 'Public Read'
 * agar file gambar dapat dibuka langsung oleh browser tanpa autentikasi
 */
async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      console.log(`[MinIO] Bucket '${bucketName}' belum ada, sedang membuat...`);
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`[MinIO] Bucket '${bucketName}' berhasil dibuat.`);
    }

    // Set Policy Public Read (hanya GetObject yang dibuka ke publik)
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };

    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    console.log(`[MinIO] Policy Public Read berhasil diatur pada bucket '${bucketName}'.`);
    return { success: true };
  } catch (error) {
    console.warn(`[MinIO Warning] Gagal menginisialisasi bucket:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Cek status koneksi ke MinIO
 */
async function checkHealth() {
  try {
    await minioClient.listBuckets();
    return { connected: true };
  } catch (err) {
    return { connected: false, error: err.message };
  }
}

/**
 * Upload buffer gambar ke MinIO
 */
async function uploadImage(fileBuffer, objectName, mimeType) {
  const metaData = {
    'Content-Type': mimeType,
    'Cache-Control': 'max-age=31536000',
  };

  await minioClient.putObject(bucketName, objectName, fileBuffer, fileBuffer.length, metaData);

  const fileUrl = `${publicUrlBase.replace(/\/$/, '')}/${encodeURIComponent(objectName)}`;
  return {
    name: objectName,
    url: fileUrl,
    size: fileBuffer.length,
    mimeType: mimeType,
  };
}

/**
 * Mengambil daftar seluruh file di bucket
 */
async function listImages() {
  return new Promise((resolve, reject) => {
    const objects = [];
    const stream = minioClient.listObjects(bucketName, '', true);

    stream.on('data', (obj) => {
      objects.push({
        name: obj.name,
        size: obj.size,
        lastModified: obj.lastModified,
        url: `${publicUrlBase.replace(/\/$/, '')}/${encodeURIComponent(obj.name)}`,
      });
    });

    stream.on('error', (err) => reject(err));
    stream.on('end', () => {
      // Urutkan dari file terbaru ke terlama
      objects.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      resolve(objects);
    });
  });
}

/**
 * Menghapus file gambar dari MinIO
 */
async function deleteImage(objectName) {
  await minioClient.removeObject(bucketName, objectName);
  return { success: true, name: objectName };
}

module.exports = {
  minioClient,
  bucketName,
  publicUrlBase,
  ensureBucket,
  checkHealth,
  uploadImage,
  listImages,
  deleteImage,
};
