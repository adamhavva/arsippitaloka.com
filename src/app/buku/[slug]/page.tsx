import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import CatalogView from "@/components/books/CatalogView";
import BookDetailView from "@/components/books/BookDetailView";

export const metadata = {
  title: "Katalog Buku — Arsip Pitaloka",
};

/**
 * `/buku/<slug>` — dipakai dua hal:
 * - slug yang cocok dengan **tab** → katalog buku tab tersebut
 *   (mis. `/buku/berita-terkini`)
 * - slug yang cocok dengan **buku** → halaman detail buku
 *
 * Tab menang kalau slug-nya sama dengan slug buku.
 */
export default function BookOrTabPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <BookOrTabContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function BookOrTabContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  await connection();

  const { slug } = await params;
  const sp = await searchParams;

  const tab = await prisma.contentTab.findUnique({ where: { slug } });
  if (tab) {
    return (
      <CatalogView
        tabSlug={slug}
        page={sp.page}
        per={sp.per}
      />
    );
  }

  return <BookDetailView slug={slug} />;
}
