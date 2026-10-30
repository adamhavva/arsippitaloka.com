"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Star } from "lucide-react";
import { buildMarketHref } from "./market-utils";

export type FacetItem = {
  slug: string;
  name: string;
  count: number;
};

export type LanguageFacet = {
  value: string;
  count: number;
};

const RATING_OPTIONS = [4.5, 4, 3.5, 3, 2];

/**
 * Sidebar filter katalog (gaya marketplace).
 *
 * - Kategori & tab tetap memakai PATH (`/buku/kategori/<slug>`,
 *   `/buku/<slug>`), sesuai aturan repo. Filter lain memakai query string.
 * - Setiap perubahan filter selalu mereset `page` ke 1.
 * - Filter lain yang sedang aktif tetap ikut di URL.
 */
export default function FilterSidebar({
  basePath,
  params,
  categories,
  tabs,
  languages,
  activeCategorySlug = "",
  activeTabSlug = "",
  activeBahasa = "",
  activeHargaMin,
  activeHargaMax,
  activeRating,
  activeGratis = false,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  categories: FacetItem[];
  tabs: FacetItem[];
  languages: LanguageFacet[];
  activeCategorySlug?: string;
  activeTabSlug?: string;
  activeBahasa?: string;
  activeHargaMin?: number;
  activeHargaMax?: number;
  activeRating?: number;
  activeGratis?: boolean;
}) {
  const router = useRouter();
  const minId = useId();
  const maxId = useId();

  const [minPrice, setMinPrice] = useState(
    activeHargaMin !== undefined ? String(activeHargaMin) : "",
  );
  const [maxPrice, setMaxPrice] = useState(
    activeHargaMax !== undefined ? String(activeHargaMax) : "",
  );

  const href = (overrides: Record<string, string | undefined>) =>
    buildMarketHref(basePath, params, { page: undefined, ...overrides });

  const applyPrice = () => {
    router.push(
      href({
        hargaMin: minPrice.trim() === "" ? undefined : minPrice.trim(),
        hargaMax: maxPrice.trim() === "" ? undefined : maxPrice.trim(),
      }),
    );
  };

  const hasFilter =
    Boolean(activeCategorySlug) ||
    Boolean(activeTabSlug) ||
    Boolean(activeBahasa) ||
    activeHargaMin !== undefined ||
    activeHargaMax !== undefined ||
    activeRating !== undefined ||
    activeGratis;

  return (
    <div className="space-y-6 text-sm">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
          Filter
        </h2>
        {hasFilter ? (
          <Link
            href={buildMarketHref("/buku", {})}
            className="text-xs font-medium text-maroon hover:underline"
          >
            Hapus semua
          </Link>
        ) : null}
      </div>

      {/* Kategori — analogi "TOKO BERKAITAN DENGAN" */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Kategori
        </h3>
        <ul className="space-y-1">
          <li>
            <FacetLink
              href={buildMarketHref("/buku", params, { page: undefined })}
              label="Semua kategori"
              active={!activeCategorySlug}
            />
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <FacetLink
                href={buildMarketHref(
                  `/buku/kategori/${category.slug}`,
                  params,
                  { page: undefined },
                )}
                label={category.name}
                count={category.count}
                active={activeCategorySlug === category.slug}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Bahasa — analogi filter "Lokal" */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Bahasa
        </h3>
        <ul className="space-y-1">
          {languages.length === 0 ? (
            <li className="text-xs text-neutral-400">Belum ada data bahasa.</li>
          ) : null}
          {languages.map((language) => (
            <li key={language.value}>
              <FacetLink
                href={href({
                  bahasa: activeBahasa === language.value ? undefined : language.value,
                })}
                label={language.value}
                count={language.count}
                active={activeBahasa === language.value}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* Rentang harga */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Rentang Harga
        </h3>
        <div className="flex items-center gap-2">
          <label htmlFor={minId} className="sr-only">
            Harga minimum
          </label>
          <input
            id={minId}
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-maroon"
          />
          <span className="text-neutral-400">–</span>
          <label htmlFor={maxId} className="sr-only">
            Harga maksimum
          </label>
          <input
            id={maxId}
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Maks"
            className="w-full rounded-lg border border-neutral-300 px-2.5 py-1.5 text-sm outline-none focus:border-maroon"
          />
        </div>
        <button
          type="button"
          onClick={applyPrice}
          className="mt-2 w-full rounded-full bg-maroon-dark px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-maroon"
        >
          Terapkan
        </button>
      </section>

      {/* Rating minimum */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Rating Minimum
        </h3>
        <ul className="space-y-1">
          {RATING_OPTIONS.map((value) => {
            const active = activeRating === value;
            return (
              <li key={value}>
                <Link
                  href={href({ rating: active ? undefined : String(value) })}
                  className={`flex items-center gap-1.5 rounded px-1 py-0.5 transition ${
                    active ? "font-medium text-maroon" : "text-neutral-600 hover:text-maroon"
                  }`}
                >
                  <Star
                    size={13}
                    className={
                      active ? "fill-yellow-400 text-yellow-400" : "text-neutral-300"
                    }
                  />
                  {String(value)} ke atas
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Gratis */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Gratis
        </h3>
        <button
          type="button"
          role="checkbox"
          aria-checked={activeGratis}
          onClick={() =>
            router.push(href({ gratis: activeGratis ? undefined : "1" }))
          }
          className="flex w-full items-center gap-2 text-left text-neutral-700"
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              activeGratis
                ? "border-maroon bg-maroon text-white"
                : "border-neutral-300 bg-white"
            }`}
          >
            {activeGratis ? "✓" : ""}
          </span>
          Tampilkan buku gratis
        </button>
      </section>

      {/* Tab konten — analogi "Tipe Penjual" */}
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          Tab Konten
        </h3>
        <ul className="space-y-1">
          <li>
            <FacetLink
              href={buildMarketHref("/buku", params, { page: undefined })}
              label="Semua tab"
              active={!activeTabSlug}
            />
          </li>
          {tabs.map((tab) => (
            <li key={tab.slug}>
              <FacetLink
                href={buildMarketHref(`/buku/${tab.slug}`, params, { page: undefined })}
                label={tab.name}
                count={tab.count}
                active={activeTabSlug === tab.slug}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function FacetLink({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between gap-2 rounded px-1.5 py-1 transition ${
        active
          ? "bg-maroon/10 font-semibold text-maroon"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-maroon"
      }`}
    >
      <span className="truncate">{label}</span>
      {typeof count === "number" ? (
        <span className="shrink-0 text-[11px] text-neutral-400">{count}</span>
      ) : null}
    </Link>
  );
}
