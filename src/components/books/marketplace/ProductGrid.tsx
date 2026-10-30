import ProductCard, { type MarketplaceBook } from "./ProductCard";

/**
 * Grid produk (buku) untuk katalog marketplace.
 *
 * 2 kolom di layar kecil, 5 kolom di layar lebar — kartu padat supaya
 * banyak buku terlihat sekaligus.
 */
export default function ProductGrid({
  books,
  emptyHint = "Coba ubah filter atau pilih kategori lain.",
}: {
  books: MarketplaceBook[];
  emptyHint?: string;
}) {
  if (books.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-12 text-center">
        <p className="font-heading text-lg font-semibold text-neutral-800">
          Tidak ada buku yang cocok
        </p>
        <p className="mt-1 text-sm text-neutral-500">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book) => (
        <ProductCard key={book.id} book={book} />
      ))}
    </div>
  );
}
