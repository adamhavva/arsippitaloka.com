import Link from "next/link";
import {
  PER_PAGE_OPTIONS,
  countPages,
  pageRange,
  pageWindow,
} from "@/lib/pagination";

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
