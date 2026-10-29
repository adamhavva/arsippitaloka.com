/**
 * Helper konfigurasi auth sisi server.
 *
 * Jangan di-import dari Client Component — `process.env` tidak tersedia
 * di browser.
 */

/**
 * Apakah Google SSO sudah dikonfigurasi.
 *
 * Dipakai untuk mendaftarkan provider Google di `src/auth.ts` dan untuk
 * memberi tahu pengguna kalau tombol Google belum bisa dipakai.
 */
export function isGoogleAuthEnabled(): boolean {
  return Boolean(
    process.env.AUTH_GOOGLE_ID?.trim() && process.env.AUTH_GOOGLE_SECRET?.trim(),
  );
}
