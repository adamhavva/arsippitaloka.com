import { Suspense } from "react";
import { connection } from "next/server";
import { requireUser } from "@/lib/library";
import AccountNav from "@/components/account/AccountNav";

export const metadata = {
  title: "Akun Saya — Arsip Pitaloka",
};

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
