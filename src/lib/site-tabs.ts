/**
 * Tab/kanal konten site — DAFTAR STATIS (bukan tabel database).
 *
 Dulu tabel `ContentTab` dipakai untuk mengelompokkan buku. Sekarang isi
 * kanal sudah dipisah sesuai jenisnya:
 *
 * - **E-Book** → `Book` (produk: ada harga, keranjang, checkout).
 * - **Berita Terkini / Blog / UMKM** → `Article` (artikel bebas baca, tanpa
 *   harga & tanpa keranjang).
 * - **YouTube / TikTok** → video (`SocialMedia` / `TiktokPost`).
 * - **Dokumentasi** → `Documentation`.
 *
 * Jadi daftar kanal ini tidak perlu disimpan di database — hanya urutan,
 * label, dan jenis kontennya.
 */

export type SiteTabKind = "books" | "articles" | "social" | "docs";

export type SiteTab = {
  slug: string;
  label: string;
  kind: SiteTabKind;
  /** Untuk kanal artikel: tipe artikel yang ditampilkan. */
  articleType?: "berita-terkini" | "blog" | "umkm";
  /** Untuk kanal video: platform yang ditampilkan. */
  platform?: "youtube" | "tiktok";
  /** Ikon lucide (dipakai di sidebar admin & navigasi). */
  icon: string;
};

/** Slug tab resmi untuk buku (e-book). */
export const BOOK_TAB_SLUG = "e-book";

export const SITE_TABS: SiteTab[] = [
  { slug: BOOK_TAB_SLUG, label: "E-Book", kind: "books", icon: "BookOpen" },
  {
    slug: "berita-terkini",
    label: "Berita Terkini",
    kind: "articles",
    articleType: "berita-terkini",
    icon: "Newspaper",
  },
  {
    slug: "youtube",
    label: "YouTube",
    kind: "social",
    platform: "youtube",
    icon: "Video",
  },
  {
    slug: "tiktok",
    label: "TikTok",
    kind: "social",
    platform: "tiktok",
    icon: "Music2",
  },
  {
    slug: "blog",
    label: "Blog",
    kind: "articles",
    articleType: "blog",
    icon: "PenLine",
  },
  {
    slug: "umkm",
    label: "UMKM",
    kind: "articles",
    articleType: "umkm",
    icon: "Store",
  },
  {
    slug: "dokumentasi",
    label: "Dokumentasi",
    kind: "docs",
    icon: "FileText",
  },
];

/** Semua tab. */
export function getSiteTabs(): SiteTab[] {
  return SITE_TABS;
}

/** Cari tab berdasarkan slug. */
export function getSiteTab(slug: string | null | undefined): SiteTab | undefined {
  if (!slug) return undefined;
  return SITE_TABS.find((tab) => tab.slug === slug);
}

/** Label tab (fallback ke slug). */
export function siteTabLabel(slug: string | null | undefined): string {
  return getSiteTab(slug)?.label ?? slug ?? "";
}

/** Tipe artikel untuk sebuah tab kanal (undefined kalau bukan kanal artikel). */
export function siteTabArticleType(
  slug: string | null | undefined,
): "berita-terkini" | "blog" | "umkm" | undefined {
  return getSiteTab(slug)?.articleType;
}
