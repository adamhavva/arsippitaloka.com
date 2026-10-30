import { getMidtransConfig, verifyMidtransSignature } from "@/lib/midtrans";
import { applyTransactionStatus } from "@/lib/payment-order";

/**
 * POST /api/webhook/midtrans — notifikasi status pembayaran dari Midtrans.
 *
 * Signature diverifikasi dulu (sha512 order_id+status_code+gross_amount+serverKey),
 * baru order diubah. Ini yang dipakai di produksi; di sandbox lokal biasanya
 * tidak ada internet masuk, jadi status dicek lewat polling /api/payment/status.
 */
export async function POST(request: Request) {
  const config = await getMidtransConfig();
  if (!config.serverKey) {
    return Response.json({ error: "Midtrans belum dikonfigurasi." }, { status: 503 });
  }

  let payload: {
    order_id?: string;
    status_code?: string;
    gross_amount?: string;
    transaction_status?: string;
    signature?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const signature = request.headers.get("x-signature") ?? payload.signature ?? null;

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
  );

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 404 });
  }

  return Response.json({ ok: true, status: result.orderStatus });
}
