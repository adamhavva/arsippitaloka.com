import { Suspense } from "react";
import { connection } from "next/server";
import CatalogView from "@/components/books/CatalogView";
import BooksLanding from "@/components/books/BooksLanding";
import Footer from "@/components/home/Footer";

export const metadata = {
  title: "Katalog Buku — Arsip Pitaloka",
};

/** `/buku` — katalog semua buku. Filter tab/kategori memakai path. */
export default function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per?: string }>;
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
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  await connection();
  const sp = await searchParams;

  return <CatalogView page={sp.page} per={sp.per} showHeading={false} />;
}
