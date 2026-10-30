/**
 * Utilitas pencarian & filter katalog buku.
 *
 * Berisi kontrak yang dipakai bersama oleh:
 * - `/buku`, `/buku/<tab>`, `/buku/kategori/<slug>` (katalog marketplace)
 * - `/cari?q=...` (halaman hasil pencarian global)
 *
 * Aturan main:
 * - Tab & kategori tetap memakai PATH (`/buku/<tab>`), bukan query string.
 * - Pencarian (`q`), urutan (`sort`), dan filter tambahan memakai query
 *   string, supaya bisa ikut dibawa saat paginasi berubah.
 * - Paginasi memakai `?page=` & `?per=` (lihat `src/lib/pagination.ts`).
 */

/** Urutan yang didukung di bar sort. */
export const SORT_OPTIONS = [
  { value: "terbaru", label: "Terbaru" },
  { value: "terlaris", label: "Terlaris" },
  { value: "harga-asc", label: "Harga: Rendah ke Tinggi" },
  { value: "harga-desc", label: "Harga: Tinggi ke Rendah" },
  { value: "rating", label: "Rating Tertinggi" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

export const DEFAULT_SORT: SortValue = "terbaru";

/** Nilai `sort` dari query string; nilai tak dikenal jatuh ke default. */
export function parseSort(value: unknown): SortValue {
  const raw = String(value ?? "");
  const found = SORT_OPTIONS.find((option) => option.value === raw);
  return found ? found.value : DEFAULT_SORT;
}

/** Label urut untuk penyortiran saat ini. */
export function sortLabel(value: SortValue): string {
  return SORT_OPTIONS.find((option) => option.value === value)?.label ?? "";
}

/** Parameter query katalog yang wajib diteruskan ke `Pagination`. */
export type CatalogParams = {
  q?: string;
  sort?: string;
  bahasa?: string;
  hargaMin?: string;
  hargaMax?: string;
  rating?: string;
  gratis?: string;
};

/** Buang nilai kosong supaya tidak masuk query string. */
export function compactParams(
  params: CatalogParams | Record<string, string | undefined>,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    out[key] = value;
  }
  return out;
}

/** Nomor dari query string; `min`/`max` membatasi rentang. */
function parseNumber(
  value: unknown,
  { min = -Infinity, max = Infinity }: { min?: number; max?: number } = {},
): number | undefined {
  const n = Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(n)) return undefined;
  if (n < min || n > max) return undefined;
  return n;
}

/** Filter yang sudah dibersihkan dari query string. */
export type BookFilters = {
  q: string;
  sort: SortValue;
  bahasa: string;
  hargaMin?: number;
  hargaMax?: number;
  rating?: number;
  gratis: boolean;
};

/**
 * Ubah query string menjadi filter yang siap dipakai Prisma.
 * Semua nilai tak valid diabaikan (bukan error), jadi URL rusak tidak
 * membuat halaman 500.
 */
export function parseFilters(
  searchParams: Record<string, string | string[] | undefined>,
): BookFilters {
  const get = (key: string): string | undefined => {
    const value = searchParams[key];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const q = String(get("q") ?? "").trim();
  const bahasa = String(get("bahasa") ?? "").trim();

  return {
    q,
    sort: parseSort(get("sort")),
    bahasa,
    hargaMin: parseNumber(get("hargaMin"), { min: 0 }),
    hargaMax: parseNumber(get("hargaMax"), { min: 0 }),
    rating: parseNumber(get("rating"), { min: 0, max: 5 }),
    gratis: get("gratis") === "1" || get("gratis") === "true",
  };
}

/** Where clause Prisma untuk `model Book` sesuai filter. */
export function buildBookWhere(
  filters: Pick<BookFilters, "q" | "bahasa" | "hargaMin" | "hargaMax" | "rating" | "gratis">,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  const and: Record<string, unknown>[] = [];

  if (filters.q) {
    and.push({
      OR: [
        { title: { contains: filters.q, mode: "insensitive" } },
        { author: { contains: filters.q, mode: "insensitive" } },
        { description: { contains: filters.q, mode: "insensitive" } },
      ],
    });
  }

  if (filters.bahasa) {
    and.push({ language: { equals: filters.bahasa, mode: "insensitive" } });
  }

  if (filters.gratis) {
    and.push({ isFree: true });
  }

  if (filters.hargaMin !== undefined) {
    and.push({ priceUsd: { gte: filters.hargaMin } });
  }

  if (filters.hargaMax !== undefined) {
    and.push({ priceUsd: { lte: filters.hargaMax } });
  }

  if (filters.rating !== undefined) {
    and.push({ rating: { gte: filters.rating } });
  }

  return {
    archived: false,
    ...extra,
    ...(and.length ? { AND: and } : {}),
  };
}

/** `orderBy` Prisma untuk urutan yang dipilih. */
export function buildBookOrderBy(
  sort: SortValue,
): Record<string, unknown>[] {
  switch (sort) {
    case "terlaris":
      return [{ readCount: "desc" }, { order: "asc" }];
    case "harga-asc":
      return [{ priceUsd: "asc" }, { order: "asc" }];
    case "harga-desc":
      return [{ priceUsd: "desc" }, { order: "asc" }];
    case "rating":
      return [{ rating: "desc" }, { readCount: "desc" }, { order: "asc" }];
    default:
      return [{ createdAt: "desc" }, { order: "asc" }];
  }
}

/** Daftar bahasa yang tersedia di katalog (untuk sidebar filter). */
export function languageOptions(
  books: { language: string }[],
): { value: string; label: string }[] {
  const counts = new Map<string, number>();
  for (const book of books) {
    const key = book.language?.trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({ value, label: `${value} (${count})` }));
}
