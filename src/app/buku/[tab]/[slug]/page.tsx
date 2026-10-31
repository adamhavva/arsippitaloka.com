import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookDetailView from "@/components/books/BookDetailView";
import RedirectTo from "@/components/books/RedirectTo";
import PageLoader from "@/components/PageLoader";

export const metadata = {
  title: "Detail Buku — Arsip Pitaloka",
};

/**
 * `/buku/<slug-tab>/<slug-buku>` — halaman detail buku.
 *
 * Kalau bukunya ada tapi berada di tab lain, URL-nya dialihkan ke tab yang
 * benar supaya tidak ada tautan mati.
 */
export default function BookDetailPage({
  params,
}: {
  params: Promise<{ tab: string; slug: string }>;
}) {
  return (
    <Suspense fallback={<PageLoader />}>
      <BookDetailContent params={params} />
    </Suspense>
  );
}

async function BookDetailContent({
  params,
}: {
  params: Promise<{ tab: string; slug: string }>;
}) {
  await connection();

  const { tab, slug } = await params;

  const book = await prisma.book.findFirst({
    where: { slug, tab: { slug: tab } },
    include: { category: true, tab: true },
  });

  if (!book) {
    // Bukunya ada, tapi di tab lain → arahkan ke URL yang benar.
    const elsewhere = await prisma.book.findUnique({
      where: { slug },
      select: { slug: true, tab: { select: { slug: true } } },
    });
    if (elsewhere) {
      return <RedirectTo to={`/buku/${elsewhere.tab.slug}/${elsewhere.slug}`} />;
    }
    notFound();
  }

  return <BookDetailView book={book} />;
}
