"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { countPages, pageRange, pageWindow } from "@/lib/pagination";
import { MARKET_PER_OPTIONS, buildMarketHref } from "./market-utils";

/**
 * Kontrol paginasi untuk grid marketplace.
 *
 * `src/components/Pagination.tsx` memakai ukuran baris 5/10/25/50, sedangkan
 * grid marketplace memakai 12/24/48 supaya isi grid terisi penuh. Karena itu
 * komponen ini dibuat terpisah (gayaSimilar), dan `src/lib/pagination.ts`
 * tidak diubah.
 *
 * Semua filter yang aktif ikut diteruskan lewat `params`, jadi tidak hilang
 * saat pindah halaman.
 */
export default function MarketPagination({
  basePath,
  page,
  perPage,
  total,
  params = {},
  label = "buku",
}: {
  basePath: string;
  page: number;
  perPage: number;
  total: number;
  params?: Record<string, string | undefined>;
  label?: string;
}) {
  const router = useRouter();
  const pages = countPages(total, perPage);
  const { from, to } = pageRange(page, perPage, total);

  const linkClass = (active: boolean) =>
    `inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm transition ${
      active
        ? "border-maroon-dark bg-maroon-dark text-white"
        : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
    }`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-neutral-500">
        Menampilkan <span className="font-medium text-neutral-800">{from}</span>–
        <span className="font-medium text-neutral-800">{to}</span> dari{" "}
        <span className="font-medium text-neutral-800">{total}</span> {label}.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-neutral-500">
          Baris:
          <select
            value={perPage}
            onChange={(e) =>
              router.push(
                buildMarketHref(basePath, params, {
                  per: e.target.value,
                  page: "1",
                }),
              )
            }
            className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-800"
          >
            {MARKET_PER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <nav className="flex items-center gap-1.5" aria-label="Paginasi">
          <Link
            href={buildMarketHref(basePath, params, {
              page: String(Math.max(1, page - 1)),
            })}
            aria-disabled={page <= 1}
            className={`${linkClass(false)} ${
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
                href={buildMarketHref(basePath, params, { page: String(item) })}
                className={linkClass(item === page)}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </Link>
            ),
          )}

          <Link
            href={buildMarketHref(basePath, params, {
              page: String(Math.min(pages, page + 1)),
            })}
            aria-disabled={page >= pages}
            className={`${linkClass(false)} ${
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
