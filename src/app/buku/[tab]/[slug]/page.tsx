import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BookDetailView from "@/components/books/BookDetailView";
import RedirectTo from "@/components/books/RedirectTo";
import PageLoader from "@/components/PageLoader";
import { BOOK_TAB_SLUG } from "@/lib/site-tabs";

export const metadata = {
  title: "Detail Buku — Arsip Pitaloka",
};

/**
 * `/buku/<slug-tab>/<slug-buku>` — halaman detail buku.
 *
 * Semua buku adalah e-book; `tab` di URL hanya kosmetik. Kalau tab-nya bukan
 * "e-book", dialihkan ke URL kanonik supaya tidak ada tautan mati.
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

  const book = await prisma.book.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!book) notFound();

  // URL kanonik buku selalu di bawah tab e-book.
  if (tab !== BOOK_TAB_SLUG) {
    return <RedirectTo to={`/buku/${BOOK_TAB_SLUG}/${book.slug}`} />;
  }

  return <BookDetailView book={book} />;
}
