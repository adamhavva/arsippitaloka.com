import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import SubscriberRowActions from "@/components/admin/SubscriberRowActions";
import NewsletterAdminForms from "@/components/admin/NewsletterAdminForms";
import Pagination from "@/components/Pagination";
import { clampPage, parsePage, parsePerPage } from "@/lib/pagination";
import PageLoader from "@/components/PageLoader";
import { getNewsletterSettings } from "@/lib/newsletter";

export const metadata = {
  title: "Newsletter — Admin",
};

export default function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per?: string; q?: string }>;
}) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminNewsletterPageContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminNewsletterPageContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per?: string; q?: string }>;
}) {
  await connection();

  const admin = await requireAdmin();
  if (!admin) return null;

  const sp = await searchParams;
  const perPage = parsePerPage(sp.per);
  const q = sp.q?.trim();

  const where = q
    ? { email: { contains: q, mode: "insensitive" as const } }
    : {};

  const total = await prisma.newsletterSubscriber.count({ where });
  const page = clampPage(parsePage(sp.page), total, perPage);

  const [subscribers, campaigns, settings, activeCount] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        email: true,
        name: true,
        source: true,
        isActive: true,
        createdAt: true,
        unsubscribedAt: true,
      },
    }),
    prisma.newsletterCampaign.findMany({
      orderBy: { sentAt: "desc" },
      take: 10,
    }),
    getNewsletterSettings(),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
  ]);

  const dateFmt = new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">Newsletter</h1>
        <p className="text-sm text-neutral-500">
          {activeCount} pelanggan aktif dari {total} terdaftar. Email kabarnya
          otomatis terkirim saat buku, berita, artikel, atau dokumentasi baru
          tayang.{" "}
          {settings.enabled
            ? "Newsletter aktif."
            : "Newsletter sedang dinonaktifkan di pengaturan."}
        </p>
      </header>

      <NewsletterAdminForms />

      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cari email pelanggan"
          aria-label="Cari pelanggan newsletter"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white"
        >
          Cari
        </button>
        {q ? (
          <a href="/admin/newsletter" className="text-sm text-neutral-500 underline">
            Reset
          </a>
        ) : null}
      </form>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Nama</th>
              <th className="px-4 py-3 font-medium">Sumber</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Bergabung</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr
                key={subscriber.id}
                className="border-b border-neutral-100 last:border-0"
              >
                <td className="px-4 py-3 text-neutral-800">{subscriber.email}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {subscriber.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-neutral-600">{subscriber.source}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      subscriber.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {subscriber.isActive ? "aktif" : "berhenti"}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {dateFmt.format(subscriber.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <SubscriberRowActions
                    subscriberId={subscriber.id}
                    email={subscriber.email}
                    isActive={subscriber.isActive}
                  />
                </td>
              </tr>
            ))}
            {subscribers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-neutral-500"
                >
                  Belum ada pelanggan newsletter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/admin/newsletter"
        page={page}
        perPage={perPage}
        total={total}
        label="pelanggan"
        params={q ? { q } : undefined}
      />

      <section className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="font-heading text-lg font-bold text-black">
          Riwayat pengiriman
        </h2>
        {campaigns.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">
            Belum ada newsletter yang dikirim.
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm text-neutral-700">
            {campaigns.map((campaign) => (
              <li
                key={campaign.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-neutral-100 pb-2 last:border-0 last:pb-0"
              >
                <span className="font-medium">{campaign.subject}</span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                  {campaign.kind}
                </span>
                <span className="text-xs text-neutral-500">
                  {campaign.recipients} penerima ·{" "}
                  {dateFmt.format(campaign.sentAt)}
                </span>
                {campaign.url ? (
                  <a
                    href={campaign.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-maroon underline"
                  >
                    lihat
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
