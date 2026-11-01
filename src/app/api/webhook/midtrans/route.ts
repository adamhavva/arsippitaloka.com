import { getMidtransConfig, verifyMidtransSignature } from "@/lib/midtrans";
import { applyTransactionStatus } from "@/lib/payment-order";

/**
 * POST /api/webhook/midtrans — notifikasi status pembayaran dari Midtrans.
 *
 * Ini jalur **server-to-server**: Midtrans memanggil URL ini sendiri setelah
 * status transaksi berubah, jadi pembayaran tetap tercatat walau pembeli
 * menutup browser / tidak kembali ke halaman callback.
 *
 * - Signature diverifikasi dulu: sha512(order_id + status_code +
 *   gross_amount + serverKey). Signature salah → 403.
 * - Body diterima dalam format JSON maupun form-encoded (Midtrans bisa
 *   mengirim salah satu tergantung pengaturan akun).
 * - Order yang tidak dikenal dibalas 200 (supaya Midtrans tidak mengulang
 *   notifikasi tanpa henti) tapi statusnya tetap `not_found`.
 */
export async function POST(request: Request) {
  const config = getMidtransConfig();
  if (!config.serverKey) {
    return Response.json({ error: "Midtrans belum dikonfigurasi." }, { status: 503 });
  }

  let payload: {
    order_id?: string;
    status_code?: string;
    gross_amount?: string;
    transaction_status?: string;
    fraud_status?: string;
    signature_key?: string;
    signature?: string;
  };

  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const form = await request.formData();
      payload = {
        order_id: String(form.get("order_id") ?? ""),
        status_code: String(form.get("status_code") ?? ""),
        gross_amount: String(form.get("gross_amount") ?? ""),
        transaction_status: String(form.get("transaction_status") ?? ""),
        fraud_status: String(form.get("fraud_status") ?? ""),
        signature_key: String(form.get("signature_key") ?? ""),
        signature: String(form.get("signature") ?? ""),
      };
    } else {
      payload = await request.json();
    }
  } catch {
    return Response.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  // Notifikasi resmi Midtrans menaruh signature di body sebagai
  // `signature_key` (header `x-signature` dipakai kalau header kustom diset).
  const signature =
    request.headers.get("x-signature") ??
    payload.signature_key ??
    payload.signature ??
    null;

  if (!verifyMidtransSignature(payload, signature, config.serverKey)) {
    return Response.json({ error: "Signature tidak valid." }, { status: 403 });
  }

  if (!payload.order_id) {
    return Response.json({ error: "order_id tidak ada." }, { status: 400 });
  }

  const result = await applyTransactionStatus(
    payload.order_id,
    payload.transaction_status,
    payload.gross_amount,
    payload.fraud_status,
  );

  if (!result.ok) {
    // Order tidak ada / nominal tidak cocok → balas 200 supaya Midtrans tidak
    // mengirim notifikasi yang sama berulang kali.
    return Response.json({ ok: false, error: result.error }, { status: 200 });
  }

  return Response.json({ ok: true, status: result.orderStatus, paid: result.paid });
}

/**
 * GET /api/webhook/midtrans — health check.
 *
 * Dipakai untuk memastikan URL webhook benar-benar bisa dipanggil dari luar
 * (mis. lewat tunnel ngrok) sebelum didaftarkan ke Midtrans.
 */
export async function GET() {
  const config = getMidtransConfig();
  return Response.json({
    ok: true,
    endpoint: "midtrans-webhook",
    configured: Boolean(config.serverKey),
    mode: config.mode,
    enabled: config.enabled,
  });
}
