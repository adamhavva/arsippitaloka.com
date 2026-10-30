import { Suspense } from "react";
import { connection } from "next/server";
import CatalogView from "@/components/books/CatalogView";

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
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <CatalogContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CatalogContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  await connection();
  const sp = await searchParams;

  return <CatalogView page={sp.page} per={sp.per} />;
}
