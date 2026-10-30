import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
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
    <div className="flex h-screen overflow-hidden bg-neutral-100">
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

  return (
    <>
      <AdminNav name={admin.name} email={admin.email} />
      {/* Hanya konten yang ikut scroll; sidebar tetap diam di kiri. */}
      <main className="min-w-0 flex-1 overflow-y-auto px-6 py-8 md:px-10">
        {children}
      </main>
    </>
  );
}
