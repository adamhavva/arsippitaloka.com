import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser, ACCESS_STATUSES } from "@/lib/library";
import Pagination from "@/components/Pagination";
import { clampPage, parsePage, parsePerPage } from "@/lib/pagination";

export const metadata = {
  title: "Riwayat Order — Arsip Pitaloka",
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

function rupiah(value: unknown): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <AccountOrdersPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AccountOrdersPageContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  await connection();

  const user = await requireUser();

  const sp = await searchParams;
  const perPage = parsePerPage(sp.per);
  const total = await prisma.order.count({ where: { userId: user.id } });
  const page = clampPage(parsePage(sp.page), total, perPage);

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
    include: {
      items: {
        select: {
          id: true,
          title: true,
          qty: true,
          priceUsd: true,
          book: {
            select: {
              id: true,
              slug: true,
              coverUrl: true,
              fileUrl: true,
              isFree: true,
              isDownloadable: true,
              archived: true,
            },
          },
        },
      },
    },
  });

  const totalItem = orders.reduce((sum, order) => sum + order.items.length, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">
          Riwayat Order
        </h1>
        <p className="text-sm text-neutral-500">
          {total} order tercatat · {totalItem} item pada halaman ini. Order
          berstatus lunas atau dikirim sudah memberi hak akses ke buku.
        </p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center">
          <p className="font-medium text-black">Belum ada order</p>
          <p className="mt-1 text-sm text-neutral-500">
            Order yang Anda buat akan tampil di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const akses = ACCESS_STATUSES.includes(
              order.status as (typeof ACCESS_STATUSES)[number],
            );

            return (
              <section
                key={order.id}
                className="rounded-xl border border-neutral-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-black">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {formatDate(order.createdAt)}
                      {" · "}
                      {order.items.length} item
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_STYLE[order.status] ??
                        "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <span className="font-semibold text-black">
                      {rupiah(order.total)}
                    </span>
                  </div>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-neutral-600 sm:grid-cols-4">
                  <div>
                    <dt className="text-neutral-400">Subtotal</dt>
                    <dd>{rupiah(order.subtotal)}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-400">Pajak</dt>
                    <dd>{rupiah(order.taxAmount)}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-400">Kurs USD → IDR</dt>
                    <dd>{String(order.usdToIdrRate)}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-400">Metode bayar</dt>
                    <dd>
                      {order.paymentMethod ?? "-"}
                      {order.paymentProvider
                        ? ` (${order.paymentProvider})`
                        : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-400">Dibuat</dt>
                    <dd>{formatDate(order.createdAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-400">Dibayar</dt>
                    <dd>{formatDate(order.paidAt)}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-400">Pengiriman</dt>
                    <dd>
                      {order.deliveryMethod === "DELIVERY"
                        ? "Dikirim ke alamat"
                        : "Unduh digital"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-400">Referensi bayar</dt>
                    <dd className="truncate">{order.paymentRef ?? "-"}</dd>
                  </div>
                </dl>

                <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-3 text-sm text-neutral-700">
                  {order.items.map((item) => {
                    // Akses mengikuti status order; buku yang diarsipkan tetap
                    // bisa dibaca kalau sudah pernah dibeli.
                    const bolehAkses = akses && Boolean(item.book.fileUrl);

                    return (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span>
                          {item.title} × {item.qty}
                          {bolehAkses && item.book.fileUrl ? (
                            <a
                              href={`/api/read/${item.book.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-2 text-xs font-medium text-maroon hover:underline"
                            >
                              Baca
                            </a>
                          ) : null}
                          {!bolehAkses ? (
                            <span className="ml-2 text-xs text-neutral-400">
                              akses belum aktif
                            </span>
                          ) : null}
                        </span>
                        <span className="text-neutral-500">
                          ${(Number(item.priceUsd) * item.qty).toFixed(2)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <Link
                    href="/akun"
                    className="font-medium text-maroon hover:underline"
                  >
                    Lihat di Pustaka Saya →
                  </Link>
                  {order.deliveryAddress ? (
                    <span className="text-xs text-neutral-500">
                      Dikirim ke: {order.deliveryAddress}
                    </span>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Pagination
        basePath="/akun/orders"
        page={page}
        perPage={perPage}
        total={total}
        label="order"
      />
    </div>
  );
}
