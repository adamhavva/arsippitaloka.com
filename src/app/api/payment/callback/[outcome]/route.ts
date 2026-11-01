import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTransactionStatus, getMidtransConfig } from "@/lib/midtrans";
import { applyTransactionStatus } from "@/lib/payment-order";

/**
 * GET /api/payment/callback/[outcome] — callback browser dari Midtrans Snap.
 *
 * Midtrans mengarahkan pembeli kembali ke URL `callbacks.finish` /
 * `callbacks.cancel` / `callbacks.error` dan menambahkan query param
 * (`order_id`, `transaction_status`, `status_code`, `gross_amount`).
 *
 * Query param itu **tidak boleh dipercaya** — pembeli bisa forging. Jadi
 * status diverifikasi ulang ke API Midtrans (pakai server key) dan hanya
 * status dari Midtrans yang dipakai untuk menandai order lunas. Kalau
 * Midtrans tidak bisa dihubungi, order dibiarkan PENDING dan webhook
 *(notifikasi server-to-server) yang menutupi pembayarannya.
 *
 * - `finish` → `/akun/orders/<id>?pembayaran=berhasil|menunggu|gagal`
 * - `cancel` / `error` → `/keranjang?order=<id>&pembayaran=batal`
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ outcome: string }> },
) {
  const { outcome } = await params;
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order_id")?.trim() ?? "";

  const base = url.origin;

  // Callback batal/gagal: tidak ada yang perlu diubah di order (status
  // masih PENDING sampai Midtrans menutup transaksi), tinggal arahkan balik.
  if (outcome === "cancel" || outcome === "error") {
    const target = new URL("/keranjang", base);
    if (orderId) target.searchParams.set("order", orderId);
    target.searchParams.set("pembayaran", "batal");
    return NextResponse.redirect(target);
  }

  if (!orderId) {
    return NextResponse.redirect(new URL("/keranjang", base));
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, status: true, paymentProvider: true },
  });

  if (!order) {
    return NextResponse.redirect(new URL("/keranjang", base));
  }

  const target = new URL(`/akun/orders/${order.id}`, base);

  // Order gratis / manual tidak pernah lewat gateway.
  if (order.paymentProvider !== "midtrans") {
    target.searchParams.set("pembayaran", "berhasil");
    return NextResponse.redirect(target);
  }

  const config = getMidtransConfig();
  const remote = await fetchTransactionStatus(config, order.id);

  if (!remote) {
    // Midtrans tidak bisa dihubungi → jangan tandai lunas, biarkan webhook
    // yang memutuskan. Halaman order tetap menampilkan status sebenarnya.
    target.searchParams.set("pembayaran", "menunggu");
    return NextResponse.redirect(target);
  }

  const applied = await applyTransactionStatus(
    order.id,
    remote.transaction_status,
    remote.gross_amount,
    remote.fraud_status,
  );

  if (!applied.ok) {
    target.searchParams.set("pembayaran", "gagal");
    return NextResponse.redirect(target);
  }

  target.searchParams.set(
    "pembayaran",
    applied.paid ? "berhasil" : applied.orderStatus === "CANCELLED" ? "gagal" : "menunggu",
  );
  return NextResponse.redirect(target);
}
