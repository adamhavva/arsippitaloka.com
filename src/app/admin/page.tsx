import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import PageLoader from "@/components/PageLoader";

export const metadata = {
  title: "Dashboard — Arsip Pitaloka",
};

type Card = {
  label: string;
  value: number | string;
  detail?: string;
  href: string;
};

function rupiah(value: unknown): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminDashboardContent />
    </Suspense>
  );
}

async function AdminDashboardContent() {
  await connection();

  const admin = await requireAdmin();
  if (!admin) return null;

  const [
    bookTotal,
    bookArchived,
    bookDownloadable,
    categoryTotal,
    categoryHighlight,
    tiktokPublished,
    docPublished,
    userTotal,
    userAdmin,
    orderCounts,
    revenue,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.book.count({ where: { archived: true } }),
    prisma.book.count({ where: { isDownloadable: true } }),
    prisma.category.count(),
    prisma.category.count({ where: { highlight: true } }),
    prisma.tiktokPost.count({ where: { published: true } }),
    prisma.documentation.count({ where: { published: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "COMPLETED"] } },
      _sum: { total: true },
    }),
  ]);

  const cards: Card[] = [
    {
      label: "Buku",
      value: bookTotal,
      detail: `${bookArchived} diarsipkan · ${bookDownloadable} bisa diunduh`,
      href: "/admin/book",
    },
    {
      label: "Kategori",
      value: categoryTotal,
      detail: `${categoryHighlight} highlight`,
      href: "/admin/category",
    },
    {
      label: "Postingan TikTok",
      value: tiktokPublished,
      detail: "yang tayang",
      href: "/admin/tiktok",
    },
    {
      label: "Dokumentasi",
      value: docPublished,
      detail: "yang tayang",
      href: "/admin/documentation",
    },
    {
      label: "User",
      value: userTotal,
      detail: `${userAdmin} admin · ${userTotal - userAdmin} pembeli`,
      href: "/admin/users",
    },
    {
      label: "Order",
      value: orderCounts.reduce((sum, o) => sum + o._count._all, 0),
      detail: orderCounts
        .map((o) => `${o.status} ${o._count._all}`)
        .join(" · "),
      href: "/admin/orders",
    },
  ];

  return (
    <div className="space-y-6 px-2 sm:px-0">
      <header>
        <h1 className="font-heading text-xl font-bold text-black sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Ringkasan isi situs dan transaksi. Halo, {admin.name}.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-neutral-200 bg-white p-5 transition hover:border-maroon/40"
          >
            <p className="text-sm text-neutral-500">{card.label}</p>
            <p className="font-heading mt-1 text-3xl font-bold text-black">
              {card.value}
            </p>
            <p className="text-[10px] text-neutral-500 sm:text-xs">{card.detail}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 sm:p-5">
        <h2 className="font-heading text-base font-bold text-black sm:text-lg">Pendapatan</h2>
        <p className="font-heading mt-2 text-2xl font-bold text-maroon sm:text-3xl">
          {rupiah(revenue._sum.total)}
        </p>
        <p className="mt-1 text-[10px] text-neutral-500 sm:text-xs">
          Total order berstatus PAID dan COMPLETED.
        </p>
      </section>
    </div>
  );
}
