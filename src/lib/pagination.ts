/**
 * Utilitas pagination untuk tabel/list di area admin dan area pembeli.
 *
 * Halaman minimal 5 baris (opsi: 5, 10, 25, 50), default 10.
 */
export const PER_PAGE_OPTIONS = [5, 10, 25, 50] as const;
export const DEFAULT_PER_PAGE = 10;

export function parsePage(value: unknown): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export function parsePerPage(value: unknown): number {
  const n = Number.parseInt(String(value ?? ""), 10);
  return (PER_PAGE_OPTIONS as readonly number[]).includes(n)
    ? n
    : DEFAULT_PER_PAGE;
}

export function countPages(total: number, perPage: number): number {
  return Math.max(1, Math.ceil(total / perPage));
}

/**
 * Kembalikan nomor halaman yang aman: tidak boleh 0, tidak boleh melebihi
 * jumlah halaman (mis. setelah data dihapus di halaman terakhir).
 */
export function clampPage(page: number, total: number, perPage: number): number {
  const pages = countPages(total, perPage);
  return Math.min(Math.max(1, page), pages);
}

/** Rentang baris yang tampil di halaman ini, untuk teks "Menampilkan x–y". */
export function pageRange(
  page: number,
  perPage: number,
  total: number,
): { from: number; to: number } {
  if (total === 0) return { from: 0, to: 0 };
  const from = (page - 1) * perPage + 1;
  const to = Math.min(from + perPage - 1, total);
  return { from, to };
}

/** Nomor halaman yang ditampilkan di kontrol paginasi (dengan elipsis). */
export function pageWindow(
  page: number,
  pages: number,
): (number | "gap")[] {
  const window = new Set<number>([1, pages, page]);
  if (page - 1 > 1) window.add(page - 1);
  if (page + 1 < pages) window.add(page + 1);
  if (page <= 3) [2, 3, 4].forEach((p) => p < pages && window.add(p));
  if (page >= pages - 2)
    [pages - 1, pages - 2, pages - 3].forEach((p) => p > 1 && window.add(p));

  const sorted = [...window].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}
