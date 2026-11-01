import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSiteTabs } from "@/lib/site-tabs";
import {
  buildBookOrderBy,
  buildBookWhere,
  compactParams,
  parseFilters,
} from "@/lib/book-search";
import { clampPage, parsePage, parsePerPage } from "@/lib/pagination";
import Pagination from "@/components/Pagination";
import SortBar from "@/components/books/marketplace/SortBar";
import SearchBar from "@/components/search/SearchBar";
import SearchResults, {
  SearchEmptyState,
  type SearchResultItem,
} from "@/components/search/SearchResults";
import type { Prisma } from "../../../prisma/generated/prisma/client";

/** Panjang maksimum kata kunci yang diproses. */
const MAX_QUERY_LENGTH = 100;

/**
 * Isi halaman `/cari`. Dipanggil di dalam `<Suspense>`.
 *
 * `await connection()` menandai bagian ini sebagai dinamis — tanpa itu build
 * gagal dengan "uncached data during prerendering" karena `searchParams`
 * tidak bisa di-cache.
 */
export default async function CariContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await connection();

  const sp = await searchParams;
  const filters = parseFilters(sp);
  const query = filters.q.slice(0, MAX_QUERY_LENGTH);

  const perPage = parsePerPage(sp.per);
  const page = parsePage(sp.page);

  const where = buildBookWhere({ ...filters, q: query }) as Prisma.BookWhereInput;
  const orderBy = buildBookOrderBy(filters.sort) as Prisma.BookOrderByWithRelationInput[];

  const total = await prisma.book.count({ where });
  const currentPage = clampPage(page, total, perPage);

  const [books, categories, tabs] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy,
      skip: (currentPage - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        slug: true,
        title: true,
        author: true,
        coverUrl: true,
        priceUsd: true,
        isFree: true,
        isNew: true,
        readCount: true,
        rating: true,
        language: true,
        pages: true,
      },
    }),
    prisma.category.findMany({
      orderBy: { order: "asc" },
      select: { name: true, slug: true },
    }),
    Promise.resolve(getSiteTabs()),
  ]);

  // Parameter yang diteruskan ke link sort & paginasi supaya filter tidak hilang.
  const linkParams = compactParams({
    q: query,
    sort: filters.sort,
    bahasa: filters.bahasa,
    hargaMin: filters.hargaMin?.toString(),
    hargaMax: filters.hargaMax?.toString(),
    rating: filters.rating?.toString(),
    gratis: filters.gratis ? "1" : undefined,
  });

  const items: SearchResultItem[] = books.map((book) => ({
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl || null,
    tabSlug: "e-book",
    priceUsd: Number(book.priceUsd),
    isFree: book.isFree,
    rating: Number(book.rating),
    language: book.language,
    pages: book.pages,
    readCount: book.readCount,
    isNew: book.isNew,
  }));

  // Tanpa kata kunci → halaman ramah, bukan error.
  if (!query) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12 md:px-6 lg:py-16">
        <div className="text-center">
          <p className="text-xs font-medium text-maroon sm:text-sm">Pencarian</p>
          <h1 className="font-heading mt-1 text-2xl font-bold text-black sm:text-3xl md:text-4xl">
            Cari Buku
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-500 sm:max-w-lg">
            Cari berdasarkan judul, penulis, atau isi deskripsi buku di arsip
            Pitaloka.
          </p>

          <SearchBar
            size="md"
            autoFocus
            placeholder="Ketik judul atau nama penulis…"
            className="mx-auto mt-4 max-w-2xl sm:mt-6 text-left"
          />
        </div>

        {categories.length > 0 || tabs.length > 0 ? (
          <div className="mt-8 space-y-5 sm:mt-12 sm:space-y-6">
            {categories.length > 0 ? (
              <section>
                <h2 className="text-[11px] uppercase tracking-wide text-neutral-400 sm:text-xs">
                  Jelajahi kategori
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 sm:mt-3">
                  {categories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/buku/kategori/${category.slug}`}
                      className="flex min-h-9 items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 active:scale-95 sm:min-h-10 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {tabs.length > 0 ? (
              <section>
                <h2 className="text-[11px] uppercase tracking-wide text-neutral-400 sm:text-xs">
                  Jelajahi tab
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 sm:mt-3">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.slug}
                      href={`/buku/${tab.slug}`}
                      className="flex min-h-9 items-center rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 active:scale-95 sm:min-h-10 sm:px-4 sm:py-2 sm:text-sm"
                    >
                      {tab.label}
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <header>
        <p className="text-xs font-medium text-maroon sm:text-sm">Pencarian</p>
        <h1 className="font-heading mt-1 text-xl font-bold text-black sm:text-2xl md:text-3xl">
          Hasil pencarian untuk &quot;{query}&quot;
        </h1>
        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
          {total} buku ditemukan.
        </p>
      </header>

      <div className="mt-4 sm:mt-6">
        <SearchBar defaultValue={query} size="sm" />
      </div>

      <div className="mt-4">
        <SortBar basePath="/cari" params={linkParams} sort={filters.sort} />
      </div>

      <div className="mt-6 sm:mt-8">
        {items.length === 0 ? (
          <SearchEmptyState
            query={query}
            categories={categories}
            tabs={tabs}
          />
        ) : (
          <SearchResults books={items} />
        )}
      </div>

      {total > 0 ? (
        <div className="mt-6 sm:mt-8">
          <Pagination
            basePath="/cari"
            page={currentPage}
            perPage={perPage}
            total={total}
            params={linkParams}
            label="buku"
          />
        </div>
      ) : null}
    </div>
  );
}
