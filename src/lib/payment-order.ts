import { prisma } from "@/lib/prisma";
import { mapTransactionStatus } from "@/lib/midtrans";

/**
 * Terapkan status transaksi Midtrans ke order.
 *
 * Dipakai oleh webhook notifikasi dan oleh polling status pembayaran, jadi
 * keduanya memakai aturan yang sama (order hanya berubah ke PAID satu kali).
 */
export async function applyTransactionStatus(
  orderId: string,
  transactionStatus: string | undefined,
  grossAmount?: string,
): Promise<
  | { ok: true; orderStatus: string; paid: boolean }
  | { ok: false; error: string }
> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, status: true, total: true, paidAt: true },
  });

  if (!order) return { ok: false, error: "Order tidak ditemukan." };

  // Amount mismatch → jangan tandai lunas.
  if (grossAmount) {
    const expected = Number(order.total.toString());
    if (Number.isFinite(expected) && Math.round(expected) !== Math.round(Number(grossAmount))) {
      return { ok: false, error: "Nominal transaksi tidak cocok dengan order." };
    }
  }

  const mapped = mapTransactionStatus(transactionStatus);

  // Sudah lunas → tidak diubah lagi (mis. refund/void menyusul).
  if (order.status === "PAID" || order.status === "COMPLETED") {
    return { ok: true, orderStatus: order.status, paid: true };
  }

  if (mapped.paid) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        paidAt: order.paidAt ?? new Date(),
      },
    });
    return { ok: true, orderStatus: "PAID", paid: true };
  }

  if (mapped.status === "CANCELLED" && order.status === "PENDING") {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
    });
    return { ok: true, orderStatus: "CANCELLED", paid: false };
  }

  return { ok: true, orderStatus: order.status, paid: false };
}
