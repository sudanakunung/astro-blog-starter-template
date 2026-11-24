/**
 * Service untuk integrasi Mayar.id Payment Gateway
 */

export interface CreateMayarPaymentParams {
  apiKey: string;
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  redirectUrl?: string;
}

export interface CreateMayarPaymentResult {
  success: boolean;
  paymentUrl?: string;
  qrCodeUrl?: string;
  transactionId?: string;
  error?: string;
}

/**
 * Membuat Single Payment Request & Dynamic QRIS ke Mayar API secara paralel
 */
export async function createMayarPayment(params: CreateMayarPaymentParams): Promise<CreateMayarPaymentResult> {
  const { apiKey, orderId, amount, customerName, customerEmail, customerPhone, description, redirectUrl } = params;

  if (!apiKey || apiKey.trim() === '') {
    return { success: false, error: 'API Key Mayar tidak tersedia' };
  }

  const trimmedKey = apiKey.trim();
  const roundedAmount = Math.round(amount);
  const expiredDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const payload = {
    name: customerName,
    email: customerEmail || 'customer@jewellery.navanusa.com',
    mobile: customerPhone || '08123456789',
    amount: roundedAmount,
    description: description || `Pembayaran Pesanan #${orderId}`,
    redirectUrl: redirectUrl || 'https://navanusa.com/checkout/success',
    expiredAt: expiredDate,
  };

  // Helper fetch dengan timeout agar tidak menggantung jika endpoint lambat
  async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 15000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  const headers = {
    Authorization: `Bearer ${trimmedKey}`,
    'Content-Type': 'application/json',
  };

  // Jalankan pembuatan Payment Link (/hl/v1/payment/create) dan Dynamic QRIS (/hl/v1/qrcode/create) secara paralel
  const [paymentResult, qrResult] = await Promise.allSettled([
    fetchWithTimeout('https://api.mayar.id/hl/v1/payment/create', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    }).then(async (res) => ({ ok: res.ok, status: res.status, data: (await res.json().catch(() => ({}))) as any })),

    fetchWithTimeout('https://api.mayar.id/hl/v1/qrcode/create', {
      method: 'POST',
      headers,
      body: JSON.stringify({ amount: roundedAmount }),
    }).then(async (res) => ({ ok: res.ok, status: res.status, data: (await res.json().catch(() => ({}))) as any })),
  ]);

  let paymentUrl: string | undefined;
  let transactionId: string | undefined;
  let qrCodeUrl: string | undefined;
  let errorMsg: string | undefined;

  if (paymentResult.status === 'fulfilled') {
    const { ok, status, data } = paymentResult.value;
    if (ok && (data?.statusCode === 200 || data?.statusCode === 201 || data?.data)) {
      const paymentData = data.data || data;
      paymentUrl = paymentData.link || paymentData.url || paymentData.paymentUrl;
      transactionId = paymentData.transactionId || paymentData.transaction_id || paymentData.id;
    } else {
      errorMsg = data?.messages || data?.message || `HTTP ${status}`;
    }
  } else {
    errorMsg = paymentResult.reason?.message;
  }

  if (qrResult.status === 'fulfilled') {
    const { ok, data } = qrResult.value;
    if (ok && data?.data?.url) {
      qrCodeUrl = data.data.url;
    }
  }

  if (paymentUrl || qrCodeUrl) {
    return {
      success: true,
      paymentUrl,
      qrCodeUrl,
      transactionId,
    };
  }

  return {
    success: false,
    error: `Gagal membuat pembayaran Mayar: ${errorMsg || 'Tidak ada respons dari Mayar'}`,
  };
}
