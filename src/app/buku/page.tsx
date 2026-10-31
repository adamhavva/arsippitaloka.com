import { Suspense } from "react";
import { connection } from "next/server";
import CatalogView from "@/components/books/CatalogView";
import PageLoader from "@/components/PageLoader";

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
      <section className="mx-auto w-full max-w-6xl px-6 pt-12 md:px-10">
        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-[#110f0d] md:text-5xl">
          E-Books Collections
        </h1>
      </section>
      <Suspense fallback={<PageLoader />}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
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
