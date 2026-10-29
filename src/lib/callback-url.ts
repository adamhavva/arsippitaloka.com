/**
 * Sanitasi `callbackUrl` supaya hanya path internal.
 *
 * Tanpa ini, `?callbackUrl=https://evil.example` bisa dipakai sebagai open
 * redirect setelah login. Aman dipakai di server maupun client.
 */
export function sanitizeCallbackUrl(
  callbackUrl: string | string[] | null | undefined,
): string {
  const raw = Array.isArray(callbackUrl) ? callbackUrl[0] : callbackUrl;
  if (!raw) return "/";
  // Hanya path yang dimulai dengan "/" dan bukan "//" (protocol-relative).
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}
