import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export type SettingField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "boolean";
  group: string;
  help?: string;
};

/**
 * Skema pengaturan situs. Kunci WAJIB sama dengan yang dipakai seed dan
 * landing page — kalau menambah key baru, tambahkan juga default-nya di
 * `prisma/seed.ts`.
 */
export const SETTINGS_SCHEMA: SettingField[] = [
  { key: "company.name", label: "Nama perusahaan", type: "text", group: "Profil" },
  { key: "company.tagline", label: "Tagline", type: "text", group: "Profil" },
  { key: "company.description", label: "Deskripsi singkat", type: "textarea", group: "Profil" },
  { key: "company.address", label: "Alamat", type: "text", group: "Profil" },
  { key: "company.phone", label: "Telepon", type: "text", group: "Profil" },
  { key: "company.email", label: "Email", type: "text", group: "Profil" },
  { key: "company.logoUrl", label: "URL logo", type: "text", group: "Profil" },
  { key: "company.copyright", label: "Teks copyright", type: "text", group: "Profil" },

  { key: "company.vision", label: "Visi", type: "textarea", group: "Copy Landing Page" },
  { key: "company.mission", label: "Misi", type: "textarea", group: "Copy Landing Page" },
  { key: "company.social.tiktok", label: "Tautan TikTok", type: "text", group: "Copy Landing Page" },
  { key: "company.social.youtube", label: "Tautan YouTube", type: "text", group: "Copy Landing Page" },
  { key: "company.social.instagram", label: "Tautan Instagram", type: "text", group: "Copy Landing Page" },

  { key: "payment.usdToIdr", label: "Kurs USD → IDR", type: "text", group: "Pembayaran", help: "Dipakai saat membuat order." },

  { key: "tax.enabled", label: "Aktifkan pajak", type: "boolean", group: "Pajak" },
  { key: "tax.type", label: "Jenis pajak", type: "text", group: "Pajak", help: "percentage atau fixed" },
  { key: "tax.percentage", label: "Pajak persen", type: "text", group: "Pajak" },
  { key: "tax.fixedAmount", label: "Pajak tetap (Rp)", type: "text", group: "Pajak" },
];

export const SETTING_GROUPS = [
  "Profil",
  "Copy Landing Page",
  "Pembayaran",
  "Pajak",
];

/**
 * Baca semua pengaturan situs. Di-cache supaya landing page tidak query
 * DB tiap request; tag "content" di-invalidate dari server action admin.
 */
export async function getSettings(): Promise<Record<string, string>> {
  "use cache";
  cacheTag("content");

  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}
