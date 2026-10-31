import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getSettings } from "@/lib/site-settings";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = {
  title: "Admin — Arsip Pitaloka",
};

/**
 * `cacheComponents` aktif → data dinamis (cookie/params) harus berada di
 * dalam <Suspense>. Karena itu shell admin (sidebar + guard) dibungkus
 * boundary, dan halaman-halaman anak ikut di dalamnya.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-neutral-100">
      {/* Overlay untuk menutup sidebar saat terbuka di mobile. */}
      <AdminOverlay />
      <Suspense fallback={<div className="h-full w-64 shrink-0 border-r border-neutral-200 bg-white" />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </div>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  // `await connection()` → opt-in dynamic (halaman ini baca cookie).
  await connection();

  const admin = await requireAdmin();
  if (!admin) redirect("/login?callbackUrl=/admin");

  const settings = await getSettings();
  const logoUrl = settings["company.logoUrl"]?.trim() || null;

  return (
    <>
      <AdminNav
        name={admin.name}
        email={admin.email}
        image={admin.image}
        logoUrl={logoUrl}
      />
      {/* Konten utama — responsif: full width di mobile (sidebar overlay), lebar tetap di desktop. */}
      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-10">
        {children}
      </main>
    </>
  );
}

/**
 * Tombol hamburger — tampil hanya di layar kecil (< sm). Saat ditekan, sidebar berubah dari hidden (-translate-x-full) menjadi visible.
 * Di desktop (≥sm) sidebar selalu tampil (static, tidak ada translate).
 */
function AdminOverlay() {
  return (
    <div className="lg:hidden">
      {/* Backdrop gelap full-screen saat sidebar terbuka. */}
      <label
        htmlFor="admin-sidebar-drawer"
        className="fixed inset-0 z-30 hidden bg-black/50 data-[state=open]:block"
        style={{ display: "none" }}
      >
        {/* Saat diklik → tutup sidebar. Kita gunakan radio button tersimpan. */}
        <input id="admin-sidebar-drawer" type="radio" name="drawer" className="sr-only" />
      </label>
      {/* Tombol hamburger (tampilan saja, logika toggle ada di AdminNav client component). */}
      <button
        type="button"
        className="fixed right-3 top-3 z-40 rounded bg-white p-2 shadow lg:hidden"
        aria-label="Toggle navigasi admin"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6 text-maroon-dark"
        >
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  );
}
