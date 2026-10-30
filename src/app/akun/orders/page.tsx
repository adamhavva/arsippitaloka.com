import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/library";
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

function rupiah(value: unknown): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
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
    include: { items: { select: { id: true, title: true, qty: true, priceUsd: true } } },
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">
          Riwayat Order
        </h1>
        <p className="text-sm text-neutral-500">
          {total} order tercatat.
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
          {orders.map((order) => (
            <section
              key={order.id}
              className="rounded-xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-black">
                    Order #{order.id.slice(-8)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {order.createdAt.toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
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
                    {order.status}
                  </span>
                  <span className="font-semibold text-black">
                    {rupiah(order.total)}
                  </span>
                </div>
              </div>

              <ul className="mt-4 space-y-1 border-t border-neutral-100 pt-3 text-sm text-neutral-700">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.title} × {item.qty}
                    </span>
                    <span className="text-neutral-500">
                      ${(Number(item.priceUsd) * item.qty).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3">
                <Link
                  href="/akun"
                  className="text-sm font-medium text-maroon hover:underline"
                >
                  Lihat di Pustaka Saya →
                </Link>
              </div>
            </section>
          ))}
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
