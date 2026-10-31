/**
 * Hitungan video untuk facet katalog (Kategori & Tab Konten).
 *
 * Facet katalog menghitung BUKU, padahal video (TikTok/YouTube/Instagram)
 * juga punya tempat di katalog:
 * - `SocialMedia` → kategori "Social Media", tab = tab konten terkait
 *   (atau tab bukunya, atau tab default sesuai platform).
 * - `TiktokPost`  → kategori "#ViralForJustice", tab "TikTok".
 *
 * Afiliasi ke buku (`bookId`) tidak memengaruhi hitungan kategori — ia cuma
 * membuat video muncul sebagai "Video terkait" di halaman buku/kategori.
 */

import { prisma } from "@/lib/prisma";

/** Kategori khusus: katalog media sosial (semua video). */
export const SOCIAL_MEDIA_CATEGORY_SLUG = "social-media";

/** Kategori khusus: curate TikTok untuk section #ViralForJustice. */
export const VIRAL_FOR_JUSTICE_CATEGORY_SLUG = "viral-for-justice";

/** Tab default per platform, dipakai kalau video tidak ditautkan ke tab/buku. */
const PLATFORM_TAB: Record<string, string> = {
  youtube: "youtube",
  tiktok: "tiktok",
  instagram: "instagram",
};

export type CatalogVideoCounts = {
  /** Jumlah video per slug tab konten. */
  byTab: Map<string, number>;
  /** Jumlah video per slug kategori. */
  byCategory: Map<string, number>;
};

function bump(map: Map<string, number>, key: string | null | undefined) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + 1);
}

/**
 * Hitung video yang tayang per tab & per kategori.
 *
 * Hanya baris `published = true` yang dihitung.
 */
export async function getCatalogVideoCounts(): Promise<CatalogVideoCounts> {
  const [socials, tiktokPosts] = await Promise.all([
    prisma.socialMedia.findMany({
      where: { published: true },
      select: {
        platform: true,
        article: { select: { type: true } },
        book: { select: { category: { select: { slug: true } } } },
      },
    }),
    prisma.tiktokPost.findMany({
      where: { published: true },
      select: { id: true },
    }),
  ]);

  const byTab = new Map<string, number>();
  const byCategory = new Map<string, number>();

  for (const post of socials) {
    // Kanal video: tab platform (YouTube/TikTok), atau kanal artikel kalau
    // videonya menempel ke artikel, atau kanal buku lewat kategorinya.
    const tabSlug =
      PLATFORM_TAB[post.platform] ??
      post.article?.type ??
      post.book?.category?.slug ??
      null;

    bump(byTab, tabSlug);
    // Semua video media sosial masuk kategori "Social Media".
    bump(byCategory, SOCIAL_MEDIA_CATEGORY_SLUG);
    // Video yang menempel ke artikel juga ikut dihitung di kanal artikelnya.
    if (post.article?.type) bump(byTab, post.article.type);
  }

  for (const _post of tiktokPosts) {
    // Postingan TikTok (tabel TiktokPost) dipakai di section #ViralForJustice.
    bump(byTab, "tiktok");
    bump(byCategory, VIRAL_FOR_JUSTICE_CATEGORY_SLUG);
  }

  return { byTab, byCategory };
}
