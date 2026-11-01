import { Suspense } from "react";
import { connection } from "next/server";
import { requireUser } from "@/lib/library";
import AccountNav from "@/components/account/AccountNav";

export const metadata = {
  title: "Akun Saya — Arsip Pitaloka",
};

/**
 * Sama seperti area admin: guard di dalam boundary ini melempar `redirect()`
 * saat sesi tidak valid, dan lemparan itu dibaca Next.js sebagai "error" saat
 * validasi "instant" (eksperimental) → muncul di console dev:
 *   Route "/akun": Could not validate `instant` because the target segment
 *   was prevented from rendering.
 * Area pembeli juga sepenuhnya dinamis (butuh cookie), jadi validasinya
 * tidak perlu dijalankan.
 */
export const instant = { unstable_disableValidation: true };

/**
 * Sama seperti area admin: data dinamis (session) harus di dalam <Suspense>
 * supaya route tetap bisa di-prerender dengan cacheComponents.
 */
export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Suspense fallback={<div className="h-24 w-full bg-white" />}>
        <AccountShell>{children}</AccountShell>
      </Suspense>
    </div>
  );
}

async function AccountShell({ children }: { children: React.ReactNode }) {
  await connection();

  const user = await requireUser();

  return (
    <>
      <AccountNav name={user.name} email={user.email} />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </>
  );
}
