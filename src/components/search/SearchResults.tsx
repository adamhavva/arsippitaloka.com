import Link from "next/link";
import ProductCard, {
  type MarketplaceBook,
} from "@/components/books/marketplace/ProductCard";

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
  readCount: number;
  isNew: boolean;
};

/** Satu kartu buku di grid hasil pencarian. */
function ResultCard({ book }: { book: SearchResultItem }) {
  const item: MarketplaceBook = {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    coverUrl: book.coverUrl,
    language: book.language,
    pages: book.pages,
    readCount: book.readCount,
    rating: book.rating,
    priceUsd: book.priceUsd,
    isNew: book.isNew,
    isFree: book.isFree,
    tabSlug: book.tabSlug,
  };

  return <ProductCard book={item} />;
}

/**
 * Grid hasil pencarian — responsif 1/2/3/4 kolom.
 */
export default function SearchResults({ books }: { books: SearchResultItem[] }) {
  if (books.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
