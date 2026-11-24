/**
 * Script sederhana untuk mengetes API Key Mayar.id dengan Node.js
 * 
 * Cara menjalankan:
 * 1. Ganti MAYAR_API_KEY di bawah dengan API Key Mayar Anda
 * 2. Jalankan perintah di terminal:
 *    node test-mayar.js
 */

// Paksa Node.js menggunakan IPv4 terlebih dahulu agar tidak timeout di jaringan ISP yang IPv6-nya bermasalah
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

// GANTI DENGAN API KEY MAYAR ANDA
const MAYAR_API_KEY = process.env.MAYAR_API_KEY || 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZDY1OTUxNC03Y2JhLTQ4MzktYjIxYy0yYzgwODY1YzMzODMiLCJhY2NvdW50SWQiOiI0MTBjOTQ1OS05ZDY1LTQyNWYtOGNlMi1iNmYxNjY0NzhhM2UiLCJjcmVhdGVkQXQiOiIxNzk1NDkwMjYyNjQ3Iiwicm9sZSI6ImRldmVsb3BlciIsInNjb3BlIjp7InJlYWQiOnRydWUsIndyaXRlIjp0cnVlfSwic3ViIjoic3VkYW5ha3VueXVuZ0BnbWFpbC5jb20iLCJuYW1lIjoiaSBnZWRlIHN1ZGFuYSIsImxpbmsiOiJuYXZhbnVzYSIsImlzU2VsZkRvbWFpbiI6bnVsbCwiaWF0IjoxNzk1NDkwMjYyfQ.mmER1GsYub4NS1vmzqUlTpeRBTjYtGZehZ2MfJ1J2w07eemOeo6gB-iwf7e5KtgIdWRfV-nO-ScyG1OuvhFW-GFM8ORRHwP_Opu2GtAzRn_O_X9jgu2yeobqYZkWFNatupQKUNftBh7gZJ8kIerBKD4TWApUiJlB1TgMdq6VnwbD06vfFkiXrgicYTBLfOBz_t53Ck-GmEUg3cYEdE31kfys1WD4ILGEK8ip9jVxx4de0cMR6grvnHCQh6DaoXr2dt_FwPoXRMzSPg9Q6Tipypq7AybLf6lSYmHez6K3anH5zdoMM6tk1T0TmBCWz9ZTCzhwk6mbuOdtIDGmZ97wBw';

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 10000 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function testMayar() {
  console.log('====================================');
  console.log('  Testing Koneksi & Payment Mayar   ');
  console.log('====================================\n');

  if (!MAYAR_API_KEY || MAYAR_API_KEY === 'MASUKKAN_API_KEY_MAYAR_DISINI') {
    console.error('⚠️  PERINGATAN: Harap isi MAYAR_API_KEY di file test-mayar.js terlebih dahulu.\n');
    return;
  }

  // 1. Test Endpoint Balance (Cek Token Valid)
  console.log('1. Memeriksa validitas API Key (/hl/v1/balance)...');
  try {
    const profileRes = await fetchWithTimeout('https://api.mayar.id/hl/v1/balance', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${MAYAR_API_KEY.trim()}`,
      },
      timeout: 15000,
    });

    const profileData = await profileRes.json().catch(() => ({}));
    if (profileRes.ok) {
      console.log('✅ API Key Valid! Terhubung ke Mayar.');
      console.log('   Data Balance:', JSON.stringify(profileData, null, 2));
    } else {
      console.warn('ℹ️  Status respons:', profileRes.status, profileData);
    }
  } catch (err) {
    console.error('❌ Gagal cek balance (Timeout/Koneksi):', err.message);
  }

  console.log('\n------------------------------------\n');

  // 2. Test Create Single Payment Request (/hl/v1/payment/create)
  console.log('2. Membuat Single Payment Request Rp 10.000 (/hl/v1/payment/create)...');
  const expiredDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const dummyPayload = {
    name: 'Customer Tester',
    email: 'tester@example.com',
    mobile: '081234567890',
    amount: 10000,
    description: 'Uji Coba Transaksi Mayar (Node.js Test)',
    redirectUrl: 'https://localhost:4321/checkout/success',
    expiredAt: expiredDate,
  };

  try {
    const paymentRes = await fetchWithTimeout('https://api.mayar.id/hl/v1/payment/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MAYAR_API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dummyPayload),
      timeout: 15000,
    });

    const paymentData = await paymentRes.json().catch(() => ({}));

    if (paymentRes.ok && (paymentData?.data?.link || paymentData?.data?.url)) {
      const paymentUrl = paymentData?.data?.link || paymentData?.data?.url;
      console.log('✅ BERHASIL membuat link pembayaran Mayar!');
      console.log('👉 Payment URL (Buka di browser):', paymentUrl);
      console.log('   Detail respons:', JSON.stringify(paymentData, null, 2));
    } else {
      console.error('❌ Gagal membuat link pembayaran:', paymentRes.status, JSON.stringify(paymentData, null, 2));
    }
  } catch (err) {
    console.error('❌ Terjadi kesalahan fetch /hl/v1/payment/create:', err.message);
  }

  console.log('\n------------------------------------\n');

  // 3. Test Generate Dynamic QRIS Langsung (/hl/v1/qrcode/create)
  console.log('3. Membuat Dynamic QRIS langsung Rp 10.000 (/hl/v1/qrcode/create)...');
  try {
    const qrRes = await fetchWithTimeout('https://api.mayar.id/hl/v1/qrcode/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MAYAR_API_KEY.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: 10000 }),
      timeout: 15000,
    });

    const qrData = await qrRes.json().catch(() => ({}));
    if (qrRes.ok && qrData?.data?.url) {
      console.log('✅ BERHASIL membuat gambar QRIS dinamis!');
      console.log('👉 Gambar QRIS URL (Buka di browser):', qrData.data.url);
      console.log('   Detail respons:', JSON.stringify(qrData, null, 2));
    } else {
      console.warn('ℹ️  Respons /hl/v1/qrcode/create:', qrRes.status, JSON.stringify(qrData, null, 2));
    }
  } catch (err) {
    console.error('❌ Terjadi kesalahan fetch /hl/v1/qrcode/create:', err.message);
  }

  console.log('\n====================================');
}

testMayar();
