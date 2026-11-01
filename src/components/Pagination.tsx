"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PER_PAGE_OPTIONS,
  countPages,
  pageRange,
  pageWindow,
} from "@/lib/pagination";

function buildHref(
  basePath: string,
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, ...overrides })) {
    if (value === undefined || value === "") continue;
    search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Kontrol paginasi untuk tabel/list: tombol halaman, prev/next, dan pemilih
 * jumlah baris per halaman (minimal 5).
 */
export default function Pagination({
  basePath,
  page,
  perPage,
  total,
  params = {},
  label = "data",
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
        <label className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500">
          Baris:
          <select
            value={perPage}
            onChange={(e) =>
              router.push(
                buildHref(basePath, params, {
                  per: e.target.value,
                  page: "1",
                }),
              )
            }
            className="min-h-9 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-800 focus:border-maroon sm:min-h-10 sm:text-sm"
          >
            {PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <nav className="flex items-center gap-1 overflow-x-auto self-start pb-1 sm:self-center sm:block sm:overflow-visible" aria-label="Paginasi">
          <Link
            href={buildHref(basePath, params, {
              page: String(Math.max(1, page - 1)),
            })}
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
                href={buildHref(basePath, params, { page: String(item) })}
                className={linkClass(item === page)}
                aria-current={item === page ? "page" : undefined}
              >
                {item}
              </Link>
            ),
          )}

          <Link
            href={buildHref(basePath, params, {
              page: String(Math.min(pages, page + 1)),
            })}
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
