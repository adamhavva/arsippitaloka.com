"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { ActionState } from "@/lib/admin/action-state";

const STATUSES = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"];

/**
 * Ubah status order.
 * Idempoten: kalau order sudah PAID/COMPLETED, status tidak bisa
 * dikembalikan ke PENDING supaya pembeli tidak kehilangan hak akses file.
 */
export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  if (!STATUSES.includes(status)) {
    return { ok: false, message: "Status tidak dikenal" };
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, paidAt: true },
  });
  if (!order) return { ok: false, message: "Order tidak ditemukan" };

  const sudahBayar = order.status === "PAID" || order.status === "COMPLETED";
  if (sudahBayar && (status === "PENDING" || status === "CANCELLED")) {
    return {
      ok: false,
      message: "Order yang sudah dibayar tidak bisa dikembalikan ke PENDING/CANCELLED",
    };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as "PENDING",
      paidAt: status === "PAID" && !order.paidAt ? new Date() : order.paidAt,
    },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/akun");
  revalidatePath("/akun/orders");

  return { ok: true, message: `Status order diubah ke ${status}` };
}
