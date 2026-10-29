import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getSettings, SETTINGS_SCHEMA } from "@/lib/site-settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata = {
  title: "Profil Perusahaan — Admin",
};

export default function AdminProfilePage() {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <AdminProfilePageContent />
    </Suspense>
  );
}

async function AdminProfilePageContent() {
  await connection();

  const admin = await requireAdmin();
  if (!admin) return null;

  const values = await getSettings();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">
          Profil Perusahaan
        </h1>
        <p className="text-sm text-neutral-500">
          Copy landing page, kontak, dan pengaturan pembayaran.
        </p>
      </header>

      <SettingsForm fields={SETTINGS_SCHEMA} values={values} />
    </div>
  );
}
