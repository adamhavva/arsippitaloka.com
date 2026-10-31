import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-settings";
import BookCard from "@/components/books/BookCard";
import { sanitizeRichText, RICH_TEXT_CLASS } from "@/lib/sanitize-html";
import {
  PER_PAGE_OPTIONS,
  clampPage,
  countPages,
  pageRange,
  pageWindow,
  parsePage,
  parsePerPage,
} from "@/lib/pagination";

/**
 * Slug tab konten yang dipakai sebagai sumber berita/artikel.
 * Sama dengan tab "Berita Terkini" di katalog (`/buku/berita-terkini`).
 */
const TAB_SLUG = "berita-terkini";

const BOOK_SELECT = {
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
} as const;

/** Nama query khusus band ini — terpisah dari band YouTube agar independen. */
const PAGE_PARAM = "beritaPage";
const PER_PARAM = "beritaPer";

type NewsSearchParams = {
  beritaPage?: string;
  beritaPer?: string;
  ytPage?: string;
  ytPer?: string;
};

/**
 * Band "Berita Terkini" pada halaman News & Views.
 *
 * Komponen luar (sinkron) membungkus `<Suspense>`; isi dinamis yang membaca
 * `searchParams` dipindah ke komponen async di dalamnya. Karena band ini
 * membaca query string (pagination), ia TIDAK bisa `"use cache"` — pola yang
 * benar di bawah `cacheComponents` adalah `<Suspense>` + `await connection()`.
 */
export default function BeritaTerkini({
  searchParams,
}: {
  searchParams: Promise<NewsSearchParams>;
}) {
  return (
    <Suspense fallback={<BeritaTerkiniFallback />}>
      <BeritaTerkiniContent searchParams={searchParams} />
    </Suspense>
  );
}

function BeritaTerkiniFallback() {
  return (
    <section className="relative mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10">
      <p className="text-sm text-neutral-500">Memuat berita…</p>
    </section>
  );
}

/**
 * Isi band: query dengan skip/take + count. Sumber data nyata tabel `Book`
 * (relasi `tab` = `ContentTab`). Kalau tab "berita-terkini" belum punya buku,
 * dipakai buku terbaru dari tab lain (fallback) dengan paginasi konsisten.
 */
async function BeritaTerkiniContent({
  searchParams,
}: {
  searchParams: Promise<NewsSearchParams>;
}) {
  await connection();

  const sp = await searchParams;
  const perPage = parsePerPage(sp.beritaPer);

  const [settings, tab] = await Promise.all([
    getSettings(),
    prisma.contentTab.findUnique({
      where: { slug: TAB_SLUG },
      select: { id: true, label: true, slug: true },
    }),
  ]);

  // Jumlah buku pada tab berita-terkini (kalau tab-nya ada).
  const tabTotal = tab
    ? await prisma.book.count({ where: { tabId: tab.id, archived: false } })
    : 0;

  // Fallback: tab tidak ada ATAU tab kosong → pakai semua buku terbaru.
  const usingFallback = tabTotal === 0;
  const where = usingFallback
    ? { archived: false }
    : { tabId: tab!.id, archived: false };
  const total = usingFallback
    ? await prisma.book.count({ where: { archived: false } })
    : tabTotal;

  const page = clampPage(parsePage(sp.beritaPage), total, perPage);

  const books =
    total === 0
      ? []
      : await prisma.book.findMany({
          where,
          orderBy: usingFallback
            ? { createdAt: "desc" }
            : [{ order: "asc" }, { createdAt: "desc" }],
          skip: (page - 1) * perPage,
          take: perPage,
          select: BOOK_SELECT,
        });

  const heading = tab?.label ?? "Berita Terkini";

  return (
    <section className="relative mx-auto w-full max-w-[1440px] px-6 py-16 md:px-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-3xl font-bold text-black md:text-4xl">
            {heading}
          </h2>
          <div
            className={`mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 ${RICH_TEXT_CLASS}`}
            dangerouslySetInnerHTML={{
              __html: sanitizeRichText(settings["company.description"]),
            }}
          />
        </div>
        <Link
          href={`/buku/${tab?.slug ?? TAB_SLUG}`}
          className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white transition hover:bg-maroon"
        >
          Lihat Semua
        </Link>
      </header>

      <p className="mt-4 text-sm text-neutral-500">
        {total} berita/artikel ditemukan
        {tab ? ` pada tab ${tab.label}` : ""}
        {usingFallback ? " · menampilkan buku terbaru" : ""}
        .
      </p>

      {books.length === 0 ? (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-10 text-center">
          <p className="font-medium text-black">Belum ada berita/artikel</p>
          <p className="mt-1 text-sm text-neutral-500">
            Konten berita akan segera hadir.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={{
                  ...book,
                  rating: String(book.rating),
                  priceUsd: String(book.priceUsd),
                  tabSlug: book.tab.slug,
                }}
              />
            ))}
          </div>

          <div className="mt-8">
            <BandPagination
              basePath="/news-and-views"
              pageParam={PAGE_PARAM}
              perParam={PER_PARAM}
              page={page}
              perPage={perPage}
              total={total}
              label="berita/artikel"
              // Bawa query band YouTube supaya tidak hilang saat pindah halaman.
              carry={{ ytPage: sp.ytPage, ytPer: sp.ytPer }}
            />
          </div>
        </>
      )}

      {/* Label vertikal "#ViralForJustice" — ada di desain PDF di sisi kanan
          band berita (x1738–1846 pt kanvas PDF). */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-10 hidden text-xs font-semibold tracking-[0.2em] text-neutral-400 lg:block"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        #ViralForJustice
      </span>
    </section>
  );
}

/**
 * Kontrol paginasi server-side untuk band News & Views.
 *
 * Komponen `Pagination` standar memakai nama query `page`/`per` yang di-hardcode,
 * jadi tidak bisa dipakai dua kali di satu halaman (query-nya akan bentrok).
 * Band ini memakai nama query sendiri (`pageParam`/`perParam`) dan meneruskan
 * query band lain lewat `carry` agar paginasi tiap band berdiri sendiri.
 * Semua tautan dirender di server (Link), tidak perlu client component.
 */
export function BandPagination({
  basePath,
  pageParam,
  perParam,
  page,
  perPage,
  total,
  label,
  carry = {},
}: {
  basePath: string;
  pageParam: string;
  perParam: string;
  page: number;
  perPage: number;
  total: number;
  label: string;
  carry?: Record<string, string | undefined>;
}) {
  const pages = countPages(total, perPage);
  const { from, to } = pageRange(page, perPage, total);

  const href = (overrides: Record<string, string | undefined>): string => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries({ ...carry, ...overrides })) {
      if (value === undefined || value === "") continue;
      search.set(key, value);
    }
    const qs = search.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const linkClass = (active: boolean) =>
    `inline-flex h-8 min-w-[36px] items-center justify-center rounded-full border px-2 text-xs transition ${
      active
        ? "border-maroon-dark bg-maroon-dark text-white"
        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 active:scale-95"
    }`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs sm:text-sm text-neutral-500">
        Menampilkan <span className="font-medium text-neutral-800">{from}</span>–
        <span className="font-medium text-neutral-800">{to}</span> dari{" "}
        <span className="font-medium text-neutral-800">{total}</span> {label}.
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
          Baris:
          {PER_PAGE_OPTIONS.map((option) => (
            <Link
              key={option}
              href={href({ [perParam]: String(option), [pageParam]: "1" })}
              className={linkClass(option === perPage)}
              aria-current={option === perPage ? "true" : undefined}
            >
              {option}
            </Link>
          ))}
        </div>

        <nav
          className="flex items-center gap-1 overflow-x-auto self-start pb-1 sm:self-center sm:block sm:overflow-visible"
          aria-label="Paginasi"
        >
          <Link
            href={href({ [pageParam]: String(Math.max(1, page - 1)) })}
            aria-disabled={page <= 1}
            className={`${linkClass(false)} whitespace-nowrap ${
              page <= 1 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Sebelumnya
          </Link>

          {pageWindow(page, pages).map((item, index) =>
            item === "gap" ? (
              <span key={`gap-${index}`} className="px-1 text-neutral-400">
                …
              </span>
            ) : (
              <Link
                key={item}
                href={href({ [pageParam]: String(item) })}
                className={linkClass(item === page)}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </Link>
            ),
          )}

          <Link
            href={href({ [pageParam]: String(Math.min(pages, page + 1)) })}
            aria-disabled={page >= pages}
            className={`${linkClass(false)} whitespace-nowrap ${
              page >= pages ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Berikutnya
          </Link>
        </nav>
      </div>
    </div>
  );
}
