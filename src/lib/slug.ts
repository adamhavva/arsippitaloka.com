/**
 *_slug_ dibuat otomatis dari judul/nama, dan tetap unik.
 */

/** Ubah teks bebas menjadi slug URL (huruf kecil, tanpa spasi/aksen). */
export function slugify(value: string): string {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/**
 * Slug unik: kalau slug dasar sudah dipakai, tambahkan kode unik
 * (`e-book` → `e-book-2` → `e-book-3`, dst).
 */
export function withUniqueSuffix(slug: string, isTaken: (candidate: string) => boolean): string {
  if (!isTaken(slug)) return slug;
  let counter = 2;
  while (isTaken(`${slug}-${counter}`)) counter++;
  return `${slug}-${counter}`;
}
