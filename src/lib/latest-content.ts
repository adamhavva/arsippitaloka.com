import { prisma } from "@/lib/prisma";
import { siteTabLabel, BOOK_TAB_SLUG } from "@/lib/site-tabs";
import { platformLabel } from "@/lib/social";
import { tiktokVideoUrl } from "@/lib/tiktok";

/**
 * "Konten terbaru" lintas jenis untuk sidebar halaman detail.
 *
 * Menggabungkan konten yang baru di-upload dari semua jenis (artikel,
 * dokumentasi, video, buku), diurutkan dari yang terbaru, dan membuang item
 * yang sedang dibuka. Dipakai di dalam boundary dinamis (route detail sudah
 * `await connection()`), jadi tidak memakai `"use cache"`.
 */

export type LatestKind = "artikel" | "dokumentasi" | "buku" | "video";

export type LatestItem = {
  key: string;
  kind: LatestKind;
  /** Label jenis untuk badge, mis. "Berita Terkini", "E-Book", "TikTok". */
  typeLabel: string;
  title: string;
  href: string;
  /** Link eksternal (dibuka di tab baru), mis. ke tiktok.com. */
  external?: boolean;
  image: string | null;
  date: Date;
};

export async function getLatestContent(opts?: {
  excludeKind?: LatestKind;
  excludeId?: string;
  limit?: number;
}): Promise<LatestItem[]> {
  const limit = opts?.limit ?? 10;

  const [articles, docs, books, socials, tiktoks] = await Promise.all([
    prisma.article.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        coverUrl: true,
        type: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.documentation.findMany({
      where: { published: true },
      orderBy: { eventDate: "desc" },
      take: limit,
      select: { id: true, slug: true, title: true, photoUrl: true, eventDate: true },
    }),
    prisma.book.findMany({
      where: { archived: false },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, slug: true, title: true, coverUrl: true, createdAt: true },
    }),
    prisma.socialMedia.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        platform: true,
        coverUrl: true,
        createdAt: true,
      },
    }),
    prisma.tiktokPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: { id: true, videoId: true, title: true, createdAt: true },
    }),
  ]);

  const items: LatestItem[] = [
    ...articles.map((a): LatestItem => ({
      key: `artikel:${a.id}`,
      kind: "artikel",
      typeLabel: siteTabLabel(a.type),
      title: a.title,
      href: `/artikel/${a.slug}`,
      image: a.coverUrl,
      date: a.publishedAt ?? a.createdAt,
    })),
    ...docs.map((d): LatestItem => ({
      key: `dokumentasi:${d.id}`,
      kind: "dokumentasi",
      typeLabel: "Dokumentasi",
      title: d.title,
      href: `/dokumentasi/${d.slug}`,
      image: d.photoUrl,
      date: d.eventDate,
    })),
    ...books.map((b): LatestItem => ({
      key: `buku:${b.id}`,
      kind: "buku",
      typeLabel: "E-Book",
      title: b.title,
      href: `/buku/${BOOK_TAB_SLUG}/${b.slug}`,
      image: b.coverUrl,
      date: b.createdAt,
    })),
    ...socials.map((s): LatestItem => ({
      key: `video:${s.id}`,
      kind: "video",
      typeLabel: platformLabel(s.platform),
      title: s.title,
      href: `/sosmed/${s.id}`,
      image: s.coverUrl,
      date: s.createdAt,
    })),
    ...tiktoks.map((t): LatestItem => ({
      key: `video:tiktok:${t.id}`,
      kind: "video",
      typeLabel: "TikTok",
      title: t.title,
      href: tiktokVideoUrl(t.videoId),
      external: true,
      image: null,
      date: t.createdAt,
    })),
  ];

  const excludeKey = opts?.excludeId
    ? `${opts.excludeKind}:${opts.excludeId}`
    : null;

  return items
    .filter((item) => item.key !== excludeKey)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}
