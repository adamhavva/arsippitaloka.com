import Link from "next/link";
import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-settings";
import BookCard from "@/components/books/BookCard";
import { sanitizeRichText, RICH_TEXT_CLASS } from "@/lib/sanitize-html";

/**
 * Slug tab konten yang dipakai sebagai sumber berita/artikel.
 * Sama dengan tab "Berita Terkini" di katalog (`/buku/berita-terkini`).
 */
const TAB_SLUG = "berita-terkini";

/**
 * Jumlah kartu yang ditampilkan. Grid 4 kolom (sesuai desain PDF:
 * 4 kolom × 2 baris kartu berita).
 */
const LIMIT = 8;

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

/**
 * Band "Berita Terkini" pada halaman News & Views.
 *
 * Sumber data nyata: tabel `Book` (dengan relasi `tab` = `ContentTab`).
 * Kalau tab "berita-terkini" belum punya buku, halaman tetap harus tampil
 * berisi — dipakai buku terbaru dari tab lain.
 */
export default async function BeritaTerkini() {
  "use cache";
  cacheTag("content");

  const [settings, tab] = await Promise.all([
    getSettings(),
    prisma.contentTab.findUnique({
      where: { slug: TAB_SLUG },
      select: { id: true, label: true, slug: true },
    }),
  ]);

  const tabBooks = tab
    ? await prisma.book.findMany({
        where: { tabId: tab.id, archived: false },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: LIMIT,
        select: BOOK_SELECT,
      })
    : [];

  // Fallback: belum ada buku di tab berita-terkini → pakai buku terbaru.
  const fallback = tabBooks.length
    ? []
    : await prisma.book.findMany({
        where: { archived: false },
        orderBy: { createdAt: "desc" },
        take: LIMIT,
        select: BOOK_SELECT,
      });

  const books = tabBooks.length ? tabBooks : fallback;
  const heading = tab?.label ?? "Berita Terkini";
  const usingFallback = tabBooks.length === 0 && fallback.length > 0;

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
        {books.length} berita/artikel ditemukan
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
