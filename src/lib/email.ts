/**
 * Normalisasi email sebelum disimpan maupun dicari.
 *
 * Postgres membandingkan string case-sensitive & whitespace-sensitive, sehingga
 * "John@Example.com" dan "john@example.com" akan menjadi dua akun berbeda
 * kalau tidak dinormalisasi.
 */
export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
