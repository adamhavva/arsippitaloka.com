import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Gerbang area admin + area pembeli — lapisan pertama, cepat.
 *
 * `/admin` dan `/api/admin`:
 *   1. `proxy.ts` (di sini) → tolak cepat berdasarkan JWT, tanpa query DB.
 *   2. `requireAdmin()` → cek role ke DB lagi sebelum merender data sensitif,
 *      supaya role yang diubah admin langsung berlaku (JWT bisa basi 7 hari).
 *
 * `/akun` (pustaka pembeli): wajib login, role apa pun boleh masuk.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth?.user;

  // Katalog sekarang memakai path: /buku/<tab> dan /buku/kategori/<kategori>.
  // URL lama (?tab= / ?kategori=) diarahkan ke path barunya supaya tautan
  // lama tidak mati.
  if (pathname === "/buku") {
    const tab = req.nextUrl.searchParams.get("tab");
    const kategori = req.nextUrl.searchParams.get("kategori");
    const target = tab
      ? `/buku/${tab}`
      : kategori
        ? `/buku/kategori/${kategori}`
        : null;

    if (target) {
      const url = new URL(target, req.nextUrl);
      for (const key of ["page", "per"]) {
        const value = req.nextUrl.searchParams.get(key);
        if (value) url.searchParams.set(key, value);
      }
      return NextResponse.redirect(url);
    }
  }

  const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isAccountArea = pathname.startsWith("/akun");

  if (isAdminArea) {
    if (session?.role === "ADMIN") return NextResponse.next();
  } else if (isAccountArea) {
    // Area pembeli: cukup punya sesi, tidak boleh kehilangan akses
    // hanya karena role-nya bukan ADMIN.
    if (session?.id) return NextResponse.next();
  } else {
    return NextResponse.next();
  }

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
  matcher: ["/admin/:path*", "/api/admin/:path*", "/akun/:path*", "/buku"],
};
