import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

/**
 * Kartu hasil pencarian global (`/cari`).
 *
 * Sengaja dibuat terpisah dari `src/components/books/**` supaya tidak
 * bentrok dengan kartu produk marketplace yang dikerjakan paralel.
 */

export type SearchResultItem = {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverUrl: string | null;
  /** Slug tab bukunya — link detail `/buku/<tab>/<slug>`. */
  tabSlug: string | null;
  priceUsd: number;
  isFree: boolean;
  rating: number;
  language: string;
  pages: number;
};

function detailHref(book: SearchResultItem): string {
  return book.tabSlug ? `/buku/${book.tabSlug}/${book.slug}` : `/buku/${book.slug}`;
}

function formatPrice(book: SearchResultItem): string {
  if (book.isFree) return "Gratis";
  return `$${book.priceUsd.toFixed(2)}`;
}

/** Satu kartu buku di grid hasil pencarian. */
function ResultCard({ book }: { book: SearchResultItem }) {
  const href = detailHref(book);
  const cover = book.coverUrl;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white">
      <div className="relative flex h-48 items-end bg-[#3d2b2e] p-3">
        {cover ? (
          <Image
            src={cover}
            alt={book.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
          />
        ) : null}
        <div className="relative z-10 flex flex-wrap gap-2">
          {book.isFree ? (
            <span className="rounded-full bg-green-500/80 px-2.5 py-1 text-[11px] font-medium text-white">
              GRATIS
            </span>
          ) : null}
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
            {book.language}
          </span>
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
            {book.pages} Halaman
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-black">
            <Link href={href} className="hover:underline">
              {book.title}
            </Link>
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-black">
            {book.rating.toFixed(1)} <Star size={14} className="fill-yellow-400 text-yellow-400" />
          </span>
        </div>
        <p className="mt-1 text-xs text-neutral-500">by {book.author}</p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-sm font-semibold text-black">{formatPrice(book)}</span>
          <Link
            href={href}
            className="rounded-full bg-maroon-dark px-4 py-1.5 text-xs font-medium text-white transition hover:bg-maroon"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * Grid hasil pencarian — responsif 1/2/3/4 kolom.
 */
export default function SearchResults({ books }: { books: SearchResultItem[] }) {
  if (books.length === 0) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <ResultCard key={book.id} book={book} />
      ))}
    </div>
  );
}

/**
 * Empty state — dipakai saat kata kunci tidak menghasilkan buku.
 */
export function SearchEmptyState({
  query,
  categories = [],
  tabs = [],
}: {
  query: string;
  categories?: { name: string; slug: string }[];
  tabs?: { label: string; slug: string }[];
}) {
  return (
    <div className="mt-10 rounded-xl border border-neutral-200 bg-white p-10 text-center">
      <p className="font-heading text-lg font-bold text-black">
        {query
          ? `Tidak ada buku untuk "${query}"`
          : "Belum ada kata kunci pencarian"}
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        {query
          ? "Coba kata kunci lain, atau jelajahi kategori di bawah."
          : "Masukkan judul, penulis, atau kata kunci di kolom pencarian di atas."}
      </p>

      {categories.length > 0 || tabs.length > 0 ? (
        <div className="mt-6 space-y-4 text-left">
          {categories.length > 0 ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                Kategori
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/buku/kategori/${category.slug}`}
                    className="rounded-full bg-neutral-100 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {tabs.length > 0 ? (
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">Tab</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <Link
                    key={tab.slug}
                    href={`/buku/${tab.slug}`}
                    className="rounded-full bg-neutral-100 px-4 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200"
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
