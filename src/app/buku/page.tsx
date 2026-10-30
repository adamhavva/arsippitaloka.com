import { Suspense } from "react";
import { connection } from "next/server";
import CatalogView from "@/components/books/CatalogView";
import BooksLanding from "@/components/books/BooksLanding";
import Footer from "@/components/home/Footer";

export const metadata = {
  title: "Katalog Buku — Arsip Pitaloka",
};

type CatalogSearchParams = Record<string, string | string[] | undefined>;

/**
 * `/buku` — katalog semua buku.
 *
 * Tab & kategori memakai path (`/buku/<tab>`, `/buku/kategori/<slug>`);
 * pencarian, urutan, dan filter lain memakai query string (`?q=`, `?sort=`,
 * `?bahasa=`, `?hargaMin=`, `?hargaMax=`, `?rating=`, `?gratis=1`).
 */
export default function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <>
      <BooksLanding />
      <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
      <Footer />
    </>
  );
}

async function CatalogContent({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  await connection();
  const sp = await searchParams;

  return (
    <CatalogView
      page={typeof sp.page === "string" ? sp.page : undefined}
      per={typeof sp.per === "string" ? sp.per : undefined}
      showHeading={false}
      searchParams={sp}
    />
  );
}
