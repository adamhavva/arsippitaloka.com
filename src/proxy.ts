import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Gerbang /admin — lapisan pertama, cepat.
 *
 * Role dicek DUA kali:
 * 1. `proxy.ts` (di sini) → tolak cepat berdasarkan JWT, tanpa query DB.
 * 2. `requireAdmin()` → cek role ke DB lagi sebelum merender data sensitif,
 *    supaya role yang diubah admin langsung berlaku (JWT bisa basi 7 hari).
 */
export default auth((req) => {
  if (req.auth?.user?.role === "ADMIN") {
    return NextResponse.next();
  }

  const { pathname } = req.nextUrl;

  // Endpoint API dibalas 401 JSON, bukan redirect ke halaman login —
  // supaya fetch() dari client tidak menerima HTML.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL("/login", req.nextUrl);
  url.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(url);
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
