import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CatalogView from "@/components/books/CatalogView";

export const metadata = {
  title: "Katalog Buku — Arsip Pitaloka",
};

/** `/buku/kategori/<slug>` — katalog buku per kategori. */
export default function CategoryCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <CategoryCatalogContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function CategoryCatalogContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  await connection();

  const { slug } = await params;
  const sp = await searchParams;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  return (
    <CatalogView
      categorySlug={slug}
      page={sp.page}
      per={sp.per}
    />
  );
}
