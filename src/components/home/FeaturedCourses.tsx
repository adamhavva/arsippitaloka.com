import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-settings";
import CoursesBrowser from "@/components/home/CoursesBrowser";
import type { BookCardData } from "@/components/books/BookCard";

export default async function FeaturedCourses() {
  "use cache";
  const [tabs, books, settings] = await Promise.all([
    prisma.contentTab.findMany({ orderBy: { order: "asc" } }),
    prisma.book.findMany({
      where: { archived: false },
      orderBy: { order: "asc" },
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
    getSettings(),
  ]);

  // Buku dikelompokkan per tab supaya tabnya bisa diklik.
  const booksByTab: Record<string, BookCardData[]> = {};
  for (const tab of tabs) booksByTab[tab.slug] = [];
  for (const book of books) {
    const list = booksByTab[book.tab.slug] ?? [];
    list.push({
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
    });
    booksByTab[book.tab.slug] = list;
  }

  return (
    <CoursesBrowser
      tabs={tabs.map((tab) => ({ id: tab.id, label: tab.label, slug: tab.slug }))}
      booksByTab={booksByTab}
      eyebrow={settings["home.courses.eyebrow"]}
      title={settings["home.courses.title"]}
      buttonLabel={settings["home.courses.button"]}
    />
  );
}
