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

  // Kalau nilai di DB kosong, Midtrans memakai nilai .env — beri tahu admin.
  const envFallback: Record<string, string> = {
    "payment.midtrans.serverKey": process.env.MIDTRANS_SERVER_KEY?.trim() ?? "",
    "payment.midtrans.clientKey": process.env.MIDTRANS_CLIENT_KEY?.trim() ?? "",
  };

  const fields = SETTINGS_SCHEMA.map((field) => {
    if (!envFallback[field.key] || raw[field.key]) return field;
    return {
      ...field,
      help: `${field.help ? `${field.help} ` : ""}Saat ini dipakai dari .env (${field.key === "payment.midtrans.serverKey" ? "MIDTRANS_SERVER_KEY" : "MIDTRANS_CLIENT_KEY"}).`,
    };
  });

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
