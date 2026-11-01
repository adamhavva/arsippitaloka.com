import Link from "next/link";
import { SORT_OPTIONS, parseSort, sortLabel } from "@/lib/book-search";
import { buildMarketHref } from "./market-utils";

/** Label pendek untuk bar sort (label penuh ada di `sortLabel`). */
const SHORT_LABELS: Record<string, string> = {
  terbaru: "Terbaru",
  terlaris: "Terlaris",
  "harga-asc": "Harga ↑",
  "harga-desc": "Harga ↓",
  rating: "Rating Tertinggi",
};

/**
 * Baris urutan di atas grid produk.
 *
 * Semua filter lain ikut di URL (lewat `params`), dan `page` selalu
 * direset ke 1 karena urutan baru bisa menggeser isi halaman.
 */
export default function SortBar({
  basePath,
  params,
  sort,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  sort: string;
}) {
  const current = parseSort(sort);

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm">
      <span className="text-neutral-500">
        Urutkan:{" "}
        <span className="font-medium text-neutral-800">
          {SHORT_LABELS[current] ?? sortLabel(current)}
        </span>
      </span>
      <nav className="flex flex-wrap items-center gap-x-4 gap-y-1" aria-label="Urutkan">
        {SORT_OPTIONS.map((option) => {
          const active = option.value === current;
          return (
            <Link
              key={option.value}
              href={buildMarketHref(basePath, params, {
                sort: option.value,
                page: undefined,
              })}
              title={option.label}
              aria-current={active ? "true" : undefined}
              className={`flex min-h-9 items-center ${
                active
                  ? "font-semibold text-maroon underline decoration-maroon/40 underline-offset-4"
                  : "text-neutral-500 hover:text-maroon"
              }`}
            >
              {SHORT_LABELS[option.value] ?? option.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
