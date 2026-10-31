import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-settings";
import CoursesBrowser, { type TabItem } from "@/components/home/CoursesBrowser";

/** Berapa banyak item per tab yang diambil dari DB (pagination sisanya di client). */
const PER_TAB_LIMIT = 48;

export default async function FeaturedCourses() {
  "use cache";
  cacheTag("content");

  const [tabs, books, socials, docs, settings] = await Promise.all([
    prisma.contentTab.findMany({ orderBy: { order: "asc" } }),
    prisma.book.findMany({
      where: { archived: false },
      orderBy: { order: "asc" },
      take: PER_TAB_LIMIT * 4,
      select: {
        id: true,
        slug: true,
        title: true,
        author: true,
        coverUrl: true,
        language: true,
        pages: true,
        readCount: true,
        rating: true,
        priceUsd: true,
        isNew: true,
        isFree: true,
        tab: { select: { slug: true } },
      },
    }),
    prisma.socialMedia.findMany({
      where: { published: true, platform: { in: ["youtube", "tiktok"] } },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: PER_TAB_LIMIT * 2,
      select: {
        id: true,
        title: true,
        platform: true,
        videoId: true,
        embedUrl: true,
        coverUrl: true,
        caption: true,
        author: true,
      },
    }),
    prisma.documentation.findMany({
      where: { published: true },
      orderBy: { eventDate: "desc" },
      take: PER_TAB_LIMIT,
      select: {
        id: true,
        title: true,
        photoUrl: true,
        eventDate: true,
      },
    }),
    getSettings(),
  ]);

  // Setiap tab diisi sesuai jenis sumber datanya. Union bertag `TabItem`
  // dikirim ke client; nilai non-plain (Decimal, Date) diserialisasi dulu.
  const itemsByTab: Record<string, TabItem[]> = {};
  for (const tab of tabs) itemsByTab[tab.slug] = [];

  for (const tab of tabs) {
    const list = itemsByTab[tab.slug];
    if (tab.slug === "youtube" || tab.slug === "tiktok") {
      for (const s of socials) {
        if (s.platform !== tab.slug) continue;
        list.push({
          kind: "social",
          social: {
            id: s.id,
            title: s.title,
            platform: s.platform,
            videoId: s.videoId,
            embedUrl: s.embedUrl,
            coverUrl: s.coverUrl,
            caption: s.caption,
            author: s.author,
          },
        });
      }
    } else if (tab.slug === "dokumentasi") {
      for (const d of docs) {
        list.push({
          kind: "doc",
          doc: {
            id: d.id,
            title: d.title,
            photoUrl: d.photoUrl,
            eventDate: d.eventDate.toISOString(),
          },
        });
      }
    } else {
      for (const book of books) {
        if (book.tab?.slug !== tab.slug) continue;
        list.push({
          kind: "book",
          book: {
            id: book.id,
            slug: book.slug,
            title: book.title,
            author: book.author,
            coverUrl: book.coverUrl,
            language: book.language,
            pages: book.pages,
            readCount: book.readCount,
            rating: String(book.rating),
            priceUsd: String(book.priceUsd),
            isNew: book.isNew,
            isFree: book.isFree,
            tabSlug: book.tab.slug,
          },
        });
      }
    }
  }

  return (
    <CoursesBrowser
      tabs={tabs.map((tab) => ({ id: tab.id, label: tab.label, slug: tab.slug }))}
      itemsByTab={itemsByTab}
      eyebrow={settings["home.courses.eyebrow"]}
      title={settings["home.courses.title"]}
      buttonLabel={settings["home.courses.button"]}
    />
  );
}
