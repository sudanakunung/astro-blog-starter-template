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
  transactionId?: string;
  error?: string;
}

/**
 * Membuat Single Payment Request ke Mayar API
 */
export async function createMayarPayment(params: CreateMayarPaymentParams): Promise<CreateMayarPaymentResult> {
  const { apiKey, orderId, amount, customerName, customerEmail, customerPhone, description, redirectUrl } = params;

  if (!apiKey || apiKey.trim() === '') {
    return { success: false, error: 'API Key Mayar tidak tersedia' };
  }

  const trimmedKey = apiKey.trim();
  const payload = {
    name: customerName,
    email: customerEmail || 'customer@jewellery.navanusa.com',
    mobile: customerPhone || '08123456789',
    amount: Math.round(amount),
    description: description || `Pembayaran Pesanan #${orderId}`,
    redirectUrl: redirectUrl || undefined,
  };

  // 1. Coba endpoint v2 terlebih dahulu
  try {
    const res = await fetch('https://api.mayar.id/hl/v2/payment/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (res.ok && (data?.statusCode === 200 || data?.statusCode === 201 || data?.data)) {
      const paymentData = data.data || data;
      const paymentUrl = paymentData.link || paymentData.url || paymentData.paymentUrl;
      const transactionId = paymentData.id || paymentData.transactionId;

      if (paymentUrl) {
        return {
          success: true,
          paymentUrl,
          transactionId,
        };
      }
    }

    // Jika v2 mengembalikan error selain 404, catat error tersebut
    if (res.status !== 404 && data?.messages) {
      console.warn('Mayar v2 payment create returned error:', data.messages);
    }
  } catch (err: any) {
    console.warn('Gagal memanggil Mayar API v2:', err.message);
  }

  // 2. Fallback ke endpoint v1 jika diperlukan
  try {
    const resV1 = await fetch('https://api.mayar.id/hl/v1/payment/create', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const dataV1 = (await resV1.json().catch(() => ({}))) as any;

    if (resV1.ok && (dataV1?.statusCode === 200 || dataV1?.statusCode === 201 || dataV1?.data)) {
      const paymentData = dataV1.data || dataV1;
      const paymentUrl = paymentData.link || paymentData.url || paymentData.paymentUrl;
      const transactionId = paymentData.id || paymentData.transactionId;

      if (paymentUrl) {
        return {
          success: true,
          paymentUrl,
          transactionId,
        };
      }
    }

    const errorMessage = dataV1?.messages || dataV1?.message || `HTTP ${resV1.status}`;
    return {
      success: false,
      error: `Gagal membuat pembayaran Mayar: ${errorMessage}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Koneksi ke Mayar API gagal: ${err.message}`,
    };
  }
}
