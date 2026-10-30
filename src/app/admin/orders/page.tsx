import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import Pagination from "@/components/Pagination";
import { clampPage, parsePage, parsePerPage } from "@/lib/pagination";

export const metadata = {
  title: "Order — Admin",
};

const STATUSES = ["PENDING", "PAID", "SHIPPED", "COMPLETED", "CANCELLED"] as const;

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

export default function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; per?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <AdminOrdersPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminOrdersPageContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string; per?: string }>;
}) {
  await connection();

  const admin = await requireAdmin();
  if (!admin) return null;

  const sp = await searchParams;
  const status =
    sp.status && STATUSES.includes(sp.status as never) ? sp.status : undefined;
  const q = sp.q?.trim();

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(q
      ? {
          user: {
            OR: [
              { email: { contains: q, mode: "insensitive" as const } },
              { name: { contains: q, mode: "insensitive" as const } },
            ],
          },
        }
      : {}),
  };

  const perPage = parsePerPage(sp.per);
  const total = await prisma.order.count({ where });
  const page = clampPage(parsePage(sp.page), total, perPage);

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { items: true } },
    },
  });

  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">Order</h1>
        <p className="text-sm text-neutral-500">
          {total} order. Ubah status manual di halaman detail.
        </p>
      </header>

      <form method="get" className="flex flex-wrap items-center gap-3">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Semua status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cari nama atau email pembeli"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white"
        >
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Pembeli</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Bayar</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-neutral-500"
                >
                  Belum ada order.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-neutral-100 last:border-0"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium text-maroon hover:underline"
                    >
                      #{order.id.slice(-8)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-neutral-800">{order.user.name}</p>
                    <p className="text-xs text-neutral-500">{order.user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {dateFmt.format(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {order._count.items}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-800">
                    {rupiah(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_STYLE[order.status] ??
                        "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {order.paymentMethod ?? order.paymentProvider ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/admin/orders"
        page={page}
        perPage={perPage}
        total={total}
        label="order"
        params={{ status, q }}
      />
    </div>
  );
}
