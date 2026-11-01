import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { resolveAdminAccess } from "@/lib/admin/require-admin";
import { getSettings } from "@/lib/site-settings";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = {
  title: "Admin — Arsip Pitaloka",
};

/**
 * Matikan validasi "instant" (eksperimental Next.js) untuk area admin.
 *
 * Validasi itu merender route dalam mode khusus untuk mengecek apakah UI bisa
 * ditampilkan instan. Guard di area admin memang *wajib* melempar `redirect()`
 * (bukan-anonim / bukan-admin / sesi kadaluarsa) — dan lemparan itu dibaca
 * Next.js sebagai "error" sehingga muncul di console dev:
 *   Route "/admin": Could not validate `instant` because the target segment
 *   was prevented from rendering.
 *
 * Area admin sepenuhnya dinamis (butuh cookie), jadi tidak ada gunanya
 * diperiksa untuk "instan". Validasi untuk route lain tetap jalan.
 */
export const instant = { unstable_disableValidation: true };

/**
 * `cacheComponents` aktif → data dinamis (cookie/params) harus berada di
 * dalam <Suspense>. Karena itu shell admin (sidebar + guard) dibungkus
 * boundary, dan halaman-halaman anak ikut di dalamnya.
 *
 * PENTING: guard di dalam boundary ini **tidak boleh** melempar error
 * (`notFound()`). `notFound()`/`throw` di dalam <Suspense> membuat route
 * gagal dirender: Next.js dev memunculkan
 * "Route \"/admin\": Could not validate `instant` because the target segment
 * was prevented from rendering" dan status HTTP-nya jadi 200 dengan shell
 * kosong. Pakai `redirect()` saja — Next.js menanganinya sebagai navigasi.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-neutral-100">
      {/* Hamburger + backdrop drawer mobile dikelola di dalam AdminNav (client). */}
      <Suspense fallback={<div className="h-full w-64 shrink-0 border-r border-neutral-200 bg-white" />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </div>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  // `await connection()` → opt-in dynamic (halaman ini baca cookie).
  await connection();

  const access = await resolveAdminAccess();

  // Anonim → arahkan ke login.
  if (access.status === "anonymous") redirect("/login?callbackUrl=/admin");
  // Sudah login tapi bukan admin → ke area akun pembeli (bukan 404, supaya
  // route tetap bisa dirender).
  if (access.status === "forbidden") redirect("/akun");
  // Sesi menunjuk user yang sudah tidak ada di DB → login ulang. Tanpa
  // `callbackUrl` supaya tidak berputar antara /login dan /admin.
  if (access.status === "stale") redirect("/login");

  const admin = access.admin;

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
