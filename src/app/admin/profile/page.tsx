import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getSettings, SETTINGS_SCHEMA } from "@/lib/site-settings";
import { SECRET_MASK } from "@/lib/site-settings-defaults";
import SettingsForm from "@/components/admin/SettingsForm";
import PageLoader from "@/components/PageLoader";

export const metadata = {
  title: "Profil Perusahaan — Admin",
};

export default function AdminProfilePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminProfilePageContent />
    </Suspense>
  );
}

async function AdminProfilePageContent() {
  await connection();

  const admin = await requireAdmin();
  if (!admin) return null;

  const raw = await getSettings();

  // Nilai secret tidak boleh terkirim ke browser — diganti mask dulu.
  const values: Record<string, string> = { ...raw };
  for (const field of SETTINGS_SCHEMA) {
    if (field.type !== "secret") continue;
    if (raw[field.key]) values[field.key] = SECRET_MASK;
  }

  const fields = SETTINGS_SCHEMA;

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

      <SettingsForm fields={fields} values={values} />
    </div>
  );
}
