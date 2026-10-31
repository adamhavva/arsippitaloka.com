import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CatalogView from "@/components/books/CatalogView";
import ArticleCatalog from "@/components/articles/ArticleCatalog";
import SocialMediaCatalog from "@/components/social/SocialMediaCatalog";
import TikTokCatalog from "@/components/social/TikTokCatalog";
import RedirectTo from "@/components/books/RedirectTo";
import PageLoader from "@/components/PageLoader";
import { getSiteTab, BOOK_TAB_SLUG } from "@/lib/site-tabs";

export const metadata = {
  title: "Katalog — Arsip Pitaloka",
};

/**
 * `/buku/<slug-tab>` — kanal konten per tab.
 *
 * Tab bersifat statis (`src/lib/site-tabs.ts`) dan isinya beragam:
 * - e-book            → katalog buku (produk)
 * - berita/blog/umkm  → daftar artikel (bebas baca, tanpa harga)
 * - youtube/tiktok    → katalog video
 * - dokumentasi       → dialihkan ke News & Views
 */
export default function TabCatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ tab: string }>;
  searchParams: Promise<{ page?: string; per?: string }>;
}) {
  return (
    <Suspense fallback={<PageLoader />}>
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
  const def = getSiteTab(tab);

  if (!def) {
    // Mungkin ini slug buku (URL lama) → arahkan ke path lengkap.
    const book = await prisma.book.findUnique({
      where: { slug: tab },
      select: { slug: true },
    });
    if (book) {
      return <RedirectTo to={`/buku/${BOOK_TAB_SLUG}/${book.slug}`} />;
    }
    notFound();
  }

  if (def.kind === "docs") {
    return <RedirectTo to="/news-and-views" />;
  }

  if (def.kind === "articles") {
    return (
      <ArticleCatalog
        type={def.articleType!}
        heading={def.label}
        basePath={`/buku/${tab}`}
        page={sp.page}
        per={sp.per}
      />
    );
  }

  if (def.kind === "social") {
    return def.platform === "tiktok" ? (
      <TikTokCatalog basePath={`/buku/${tab}`} page={sp.page} per={sp.per} />
    ) : (
      <SocialMediaCatalog
        basePath={`/buku/${tab}`}
        page={sp.page}
        per={sp.per}
        platform={def.platform}
      />
    );
  }

  return (
    <CatalogView tabSlug={tab} page={sp.page} per={sp.per} searchParams={sp} />
  );
}
