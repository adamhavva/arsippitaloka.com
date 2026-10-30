import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookCard from "@/components/books/BookCard";
import Pagination from "@/components/Pagination";
import { clampPage, parsePage, parsePerPage } from "@/lib/pagination";

export const metadata = {
  title: "Katalog Buku — Arsip Pitaloka",
};

export default function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    kategori?: string;
    page?: string;
    per?: string;
  }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <CatalogContent searchParams={searchParams} />
    </Suspense>
  );
}

async function CatalogContent({
  searchParams,
}: {
  searchParams: Promise<{
    tab?: string;
    kategori?: string;
    page?: string;
    per?: string;
  }>;
}) {
  await connection();

  const sp = await searchParams;
  const tabSlug = sp.tab?.trim() || "";
  const categorySlug = sp.kategori?.trim() || "";
  const perPage = parsePerPage(sp.per);
  const page = parsePage(sp.page);

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

  /** Bentuk query string sambil mempertahankan filter yang lain. */
  function href(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { tab: tabSlug, kategori: categorySlug, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (!value) continue;
      params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `/buku?${qs}` : "/buku";
  }

  const activeTab = tabs.find((tab) => tab.slug === tabSlug);
  const activeCategory = categories.find((cat) => cat.slug === categorySlug);

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-10 md:px-10">
      <header>
        <p className="text-sm font-medium text-maroon">Katalog</p>
        <h1 className="font-heading mt-1 text-2xl font-bold text-black md:text-3xl">
          Semua Buku
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
            href={href({ tab: undefined, page: undefined })}
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
              href={href({ tab: tab.slug, page: undefined })}
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
            href={href({ kategori: undefined, page: undefined })}
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
              href={href({ kategori: category.slug, page: undefined })}
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
          basePath="/buku"
          page={currentPage}
          perPage={perPage}
          total={total}
          label="buku"
          params={{
            tab: tabSlug || undefined,
            kategori: categorySlug || undefined,
          }}
        />
      </div>
    </div>
  );
}
