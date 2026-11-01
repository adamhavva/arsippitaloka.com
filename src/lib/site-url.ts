/**
 * URL dasar situs (server-side).
 *
 * Satu sumber kebenaran supaya redirect Midtrans (finish/cancel/error) dan
 * webhook memakai host yang sama. Urutan prioritas:
 *
 *   1. `SITE_URL`            — domain produksi, mis. https://arsippitaloka.com
 *   2. `NEXT_PUBLIC_SITE_URL` — sama, tapi juga dipakai di client
 *   3. `AUTH_URL`             — fallback bawaan NextAuth
 *   4. `http://localhost:3000`
 *
 * Catatan: saat memakai tunnel ngrok untuk uji webhook, `SITE_URL` bisa diisi
 * URL tunnel supaya callback pembeli juga lewat tunnel (opsional — webhook
 * sendirinya cukup memakai URL tunnel secara eksplisit).
 */
export function siteUrl(): string {
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

/** URL webhook notifikasi Midtrans (dipakai untuk ditampilkan/didaftarkan). */
export function midtransWebhookUrl(): string {
  return `${siteUrl()}/api/webhook/midtrans`;
}
