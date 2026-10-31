import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import AdminAccountForms from "@/components/admin/AdminAccountForms";

export const metadata = {
  title: "Akun Saya — Admin Arsip Pitaloka",
};

export default function AdminAccountPage() {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <AdminAccountPageContent />
    </Suspense>
  );
}

async function AdminAccountPageContent() {
  await connection();

  const admin = await requireAdmin();
  if (!admin) notFound();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">Akun Saya</h1>
        <p className="text-sm text-neutral-500">
          Kelola nama, foto, dan password akun admin{" "}
          <span className="font-medium text-neutral-700">{admin.email}</span>.
        </p>
      </header>

      <AdminAccountForms name={admin.name} image={admin.image} />
    </div>
  );
}
