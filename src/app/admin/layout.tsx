import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
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

  // Anonim → arahkan ke login. Sudah login tapi bukan admin → 404 (halaman
  // admin disembunyikan dari pengguna biasa).
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/admin");

  const admin = await requireAdmin();
  if (!admin) notFound();

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
