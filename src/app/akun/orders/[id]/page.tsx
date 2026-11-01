import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, ACCESS_STATUSES } from "@/lib/library";
import PaymentStatusChecker from "@/components/books/PaymentStatusChecker";
import PageLoader from "@/components/PageLoader";

export const metadata = {
  title: "Detail Order — Arsip Pitaloka",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-green-100 text-green-700",
  SHIPPED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-neutral-200 text-neutral-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu pembayaran",
  PAID: "Lunas",
  SHIPPED: "Dikirim",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
};

/** Banner hasil callback Midtrans (query ?pembayaran=…). */
function pembayaranBanner(
  pembayaran: string | undefined,
  orderStatus: string,
): React.ReactNode {
  const lunas = orderStatus === "PAID" || orderStatus === "COMPLETED";

  if (lunas) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        Pembayaran berhasil diterima. Buku sudah masuk Pustaka Saya.
      </div>
    );
  }

  if (pembayaran === "gagal") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Pembayaran gagal atau dibatalkan. Silakan coba lagi dari halaman buku.
      </div>
    );
  }

  if (pembayaran === "menunggu") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Pembayaran belum terkonfirmasi. Status akan diperbarui otomatis begitu
        Midtrans mengonfirmasi pembayaran.
      </div>
    );
  }

  return null;
}

function rupiah(value: unknown): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AccountOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pembayaran?: string }>;
}) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AccountOrderDetailContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function AccountOrderDetailContent({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pembayaran?: string }>;
}) {
  await connection();

  const user = await requireUser();
  const { id } = await params;
  const { pembayaran } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          book: {
            select: {
              id: true,
              slug: true,
              coverUrl: true,
              fileUrl: true,
              isDownloadable: true,
              archived: true,
            },
          },
        },
      },
    },
  });

  if (!order || order.userId !== user.id) notFound();

  const akses = ACCESS_STATUSES.includes(
    order.status as (typeof ACCESS_STATUSES)[number],
  );

  return (
    <div className="space-y-6">
      <nav className="text-xs text-neutral-500">
        <Link href="/akun/orders" className="hover:underline">
          Riwayat Order
        </Link>
        {" · "}
        <span>Order #{order.id.slice(-8).toUpperCase()}</span>
      </nav>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-black">
          Order #{order.id.slice(-8).toUpperCase()}
        </h1>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              STATUS_STYLE[order.status] ?? "bg-neutral-100 text-neutral-600"
            }`}
          >
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
          <span className="font-semibold text-black">{rupiah(order.total)}</span>
        </div>
      </header>

      {pembayaranBanner(pembayaran, order.status)}

      {order.status === "PENDING" ? (
        <PaymentStatusChecker orderId={order.id} initialStatus={order.status} />
      ) : null}

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-heading text-base font-bold text-black">
          Ringkasan pembayaran
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-neutral-700 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-neutral-400">Subtotal</dt>
            <dd>{rupiah(order.subtotal)}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-400">Pajak</dt>
            <dd>{rupiah(order.taxAmount)}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-400">Total</dt>
            <dd className="font-semibold">{rupiah(order.total)}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-400">Metode bayar</dt>
            <dd>
              {order.paymentMethod ?? "-"}
              {order.paymentProvider ? ` (${order.paymentProvider})` : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-400">Referensi bayar</dt>
            <dd className="truncate">{order.paymentRef ?? "-"}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-400">Dibuat</dt>
            <dd>{formatDate(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-400">Dibayar</dt>
            <dd>{formatDate(order.paidAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-neutral-400">Pengiriman</dt>
            <dd>
              {order.deliveryMethod === "DELIVERY"
                ? "Dikirim ke alamat"
                : "Unduh digital"}
            </dd>
          </div>
        </dl>
        {order.deliveryAddress ? (
          <p className="mt-2 text-xs text-neutral-500">
            Dikirim ke: {order.deliveryAddress}
          </p>
        ) : null}
      </section>

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-heading text-base font-bold text-black">
          Item ({order.items.length})
        </h2>
        <ul className="mt-3 space-y-3 text-sm text-neutral-700">
          {order.items.map((item) => {
            const bolehAkses = akses && Boolean(item.book.fileUrl);

            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span>
                  {item.title} × {item.qty}
                  {bolehAkses ? (
                    <>
                      <a
                        href={`/api/read/${item.book.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-xs font-medium text-maroon hover:underline"
                      >
                        Baca
                      </a>
                      {item.book.isDownloadable ? (
                        <a
                          href={`/api/download/${item.book.id}`}
                          className="ml-2 text-xs font-medium text-maroon hover:underline"
                        >
                          Unduh
                        </a>
                      ) : null}
                    </>
                  ) : (
                    <span className="ml-2 text-xs text-neutral-400">
                      akses belum aktif
                    </span>
                  )}
                </span>
                <span className="text-neutral-500">
                  {rupiah(Number(item.priceUsd) * item.qty)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/akun" className="font-medium text-maroon hover:underline">
          Lihat di Pustaka Saya →
        </Link>
        <Link href="/buku" className="text-neutral-600 hover:underline">
          Kembali ke katalog
        </Link>
      </div>
    </div>
  );
}
