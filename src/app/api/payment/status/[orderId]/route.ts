import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchTransactionStatus, getMidtransConfig } from "@/lib/midtrans";
import { applyTransactionStatus } from "@/lib/payment-order";

/**
 * GET /api/payment/status/[orderId] — cek status pembayaran ke Midtrans.
 *
 * Dipakai pembeli setelah kembali dari halaman Snap (sandbox lokal tidak
 * punya webhook publik). Order hanya bisa dicek oleh pemiliknya atau admin.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, status: true, total: true, paymentProvider: true },
  });

  if (!order) {
    return Response.json({ error: "Order tidak ditemukan." }, { status: 404 });
  }

  if (order.userId !== userId && session?.user?.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Order non-Midtrans (gratis / manual) → tidak perlu dicek ke gateway.
  if (order.paymentProvider !== "midtrans") {
    return Response.json({ status: order.status, transactionStatus: null });
  }

  const config = await getMidtransConfig();
  const remote = await fetchTransactionStatus(config, order.id);

  if (!remote) {
    return Response.json({
      status: order.status,
      transactionStatus: null,
      error: "Gagal menghubungi Midtrans.",
    });
  }

  const applied = await applyTransactionStatus(
    order.id,
    remote.transaction_status,
    remote.gross_amount,
  );

  return Response.json({
    status: applied.ok ? applied.orderStatus : order.status,
    transactionStatus: remote.transaction_status ?? null,
    fraudStatus: remote.fraud_status ?? null,
  });
}
