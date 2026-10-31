import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CatalogView from "@/components/books/CatalogView";
import SocialMediaCatalog from "@/components/social/SocialMediaCatalog";
import TikTokCatalog from "@/components/social/TikTokCatalog";
import PageLoader from "@/components/PageLoader";

export const metadata = {
  title: "Katalog Buku — Arsip Pitaloka",
};

/**
 * Kategori "social-media" tidak menampilkan katalog buku, melainkan grid
 * video media sosial dengan engagement + relasi (dikelola di /admin/social
 * dan /admin/profile). Slug-nya dikunci di sini supaya tidak diambil dari URL
 * sembarangan.
 */
const SOCIAL_MEDIA_CATEGORY_SLUG = "social-media";

/**
 * Kategori "#ViralForJustice" menampilkan curate video TikTok
 * (tabel `TiktokPost`) — sama dengan section #ViralForJustice di beranda.
 */
const VIRAL_FOR_JUSTICE_CATEGORY_SLUG = "viral-for-justice";

/** `/buku/kategori/<slug>` — katalog buku per kategori. */
export default function CategoryCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  return (
    <Suspense fallback={<PageLoader />}>
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

  if (slug === SOCIAL_MEDIA_CATEGORY_SLUG) {
    return (
      <SocialMediaCatalog
        basePath={`/buku/kategori/${slug}`}
        page={sp.page}
        per={sp.per}
      />
    );
  }

  if (slug === VIRAL_FOR_JUSTICE_CATEGORY_SLUG) {
    return (
      <TikTokCatalog
        basePath={`/buku/kategori/${slug}`}
        page={sp.page}
        per={sp.per}
      />
    );
  }

  return (
    <CatalogView
      categorySlug={slug}
      page={sp.page}
      per={sp.per}
      searchParams={sp}
    />
  );
}
