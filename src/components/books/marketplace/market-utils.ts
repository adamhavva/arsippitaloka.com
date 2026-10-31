/**
 * Helper kecil untuk tampilan katalog marketplace.
 *
 * Tidak punya `"use client"` supaya bisa dipakai di Server Component maupun
 * Client Component (filter sidebar, paginasi).
 *
 * Aturan yang dipakai di sini:
 * - Paginasi grid memakai `?page=` & `?per=` (aturan pagination proyek),
 *   tapi ukuran baris untuk grid = 12/24/48 (bukan 5/10/25/50) supaya isi
 *   grid terisi penuh. Karena itu `src/lib/pagination.ts` **tidak diubah**,
 *   melainkan punya parser sendiri di file ini.
 * - Semua filter (q, sort, bahasa, hargaMin, hargaMax, rating, gratis)
 *   ikut di URL supaya tidak hilang saat paginate atau saat ganti filter.
 */

import type { CatalogParams } from "@/lib/book-search";

/** Pilihan jumlah buku per halaman untuk grid marketplace. */
export const MARKET_PER_OPTIONS = [12, 24, 48] as const;

/** Default jumlah buku per halaman untuk grid marketplace. */
export const DEFAULT_MARKET_PER = 12;

/** Parse `?per=` khusus grid marketplace (12/24/48). */
export function parseMarketPer(value: unknown): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  return (MARKET_PER_OPTIONS as readonly number[]).includes(n)
    ? n
    : DEFAULT_MARKET_PER;
}

/**
 * Susun URL dari path dasar + parameter query.
 * Nilai kosong/undefined dibuang supaya URL tetap bersih.
 */
export function buildMarketHref(
  basePath: string,
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined> = {},
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, ...overrides })) {
    if (value === undefined || value === "") continue;
    search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Buang parameter kosong dari sekumpulan parameter katalog. */
export function cleanParams(
  params: CatalogParams | Record<string, string | undefined>,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    out[key] = value;
  }
  return out;
}

/**
 * Format harga Rupiah. `priceUsd` di DB berupa Decimal berisi nilai IDR, jadi
 * dirender lewat `Intl.NumberFormat` supaya konsisten ("Rp150.000").
 */
export function formatIdr(value: unknown): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "Rp0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}
