import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CatalogView from "@/components/books/CatalogView";
import RedirectTo from "@/components/books/RedirectTo";

export const metadata = {
  title: "Katalog Buku — Arsip Pitaloka",
};

/**
 * `/buku/<slug-tab>` — katalog buku per tab (mis. `/buku/berita-terkini`).
 *
 * URL lama `/buku/<slug-buku>` (sebelum detail buku dipindah ke
 * `/buku/<slug-tab>/<slug-buku>`) otomatis dialihkan ke path yang benar.
 */
export default function TabCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ tab: string }>;
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <TabCatalogContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function TabCatalogContent({
  params,
  searchParams,
}: {
  params: Promise<{ tab: string }>;
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  await connection();

  const { tab } = await params;
  const sp = await searchParams;

  const contentTab = await prisma.contentTab.findUnique({ where: { slug: tab } });

  if (!contentTab) {
    // Mungkin ini slug buku (URL lama) → arahkan ke path lengkap.
    const book = await prisma.book.findUnique({
      where: { slug: tab },
      select: { slug: true, tab: { select: { slug: true } } },
    });
    if (book) {
      return <RedirectTo to={`/buku/${book.tab.slug}/${book.slug}`} />;
    }
    notFound();
  }

  return (
    <CatalogView
      tabSlug={tab}
      page={sp.page}
      per={sp.per}
    />
  );
}
