import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookCard from "@/components/books/BookCard";
import Pagination from "@/components/Pagination";
import { clampPage, parsePage, parsePerPage } from "@/lib/pagination";

/**
 * Tampilan katalog buku yang dipakai bersama oleh:
 * - `/buku`                     → semua buku
 * - `/buku/<slug-tab>`          → katalog per tab
 * - `/buku/kategori/<slug>`     → katalog per kategori
 *
 * Filter memakai path (bukan query string) supaya URL-nya bersih:
 * `/buku/berita-terkini`. Paginasi tetap memakai query `?page=` & `?per=`
 * (aturan pagination proyek).
 */
export default async function CatalogView({
  tabSlug = "",
  categorySlug = "",
  page: pageParam,
  per: perParam,
}: {
  tabSlug?: string;
  categorySlug?: string;
  page?: string;
  per?: string;
}) {
  const perPage = parsePerPage(perParam);
  const page = parsePage(pageParam);

  const [tabs, categories] = await Promise.all([
    prisma.contentTab.findMany({ orderBy: { order: "asc" } }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
  ]);

  const where = {
    archived: false,
    ...(tabSlug ? { tab: { slug: tabSlug } } : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
  };

  const total = await prisma.book.count({ where });
  const currentPage = clampPage(page, total, perPage);
  const books = await prisma.book.findMany({
    where,
    orderBy: { order: "asc" },
    skip: (currentPage - 1) * perPage,
    take: perPage,
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
    },
  });

  const activeTab = tabs.find((tab) => tab.slug === tabSlug);
  const activeCategory = categories.find((cat) => cat.slug === categorySlug);

  // Path aktif dipakai sebagai basis link paginasi.
  const basePath = activeCategory
    ? `/buku/kategori/${activeCategory.slug}`
    : activeTab
      ? `/buku/${activeTab.slug}`
      : "/buku";

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-10 md:px-10">
      <header>
        <p className="text-sm font-medium text-maroon">Katalog</p>
        <h1 className="font-heading mt-1 text-2xl font-bold text-black md:text-3xl">
          {activeCategory ? activeCategory.name : activeTab ? activeTab.label : "Semua Buku"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {total} buku ditemukan
          {activeTab ? ` pada tab ${activeTab.label}` : ""}
          {activeCategory ? ` · kategori ${activeCategory.name}` : ""}.
        </p>
      </header>

      <nav className="mt-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs uppercase tracking-wide text-neutral-400">
            Tab
          </span>
          <Link
            href="/buku"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              tabSlug
                ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                : "bg-maroon-dark text-white"
            }`}
          >
            Semua
          </Link>
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/buku/${tab.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                tabSlug === tab.slug
                  ? "bg-maroon-dark text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="w-16 text-xs uppercase tracking-wide text-neutral-400">
            Kategori
          </span>
          <Link
            href="/buku"
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              categorySlug
                ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                : "bg-maroon-dark text-white"
            }`}
          >
            Semua
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/buku/kategori/${category.slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                categorySlug === category.slug
                  ? "bg-maroon-dark text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </nav>

      {books.length === 0 ? (
        <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-10 text-center">
          <p className="font-medium text-black">Belum ada buku di filter ini</p>
          <p className="mt-1 text-sm text-neutral-500">
            Coba pilih tab atau kategori lain.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={{
                ...book,
                rating: String(book.rating),
                priceUsd: String(book.priceUsd),
              }}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Pagination
          basePath={basePath}
          page={currentPage}
          perPage={perPage}
          total={total}
          label="buku"
        />
      </div>
    </div>
  );
}
