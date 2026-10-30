import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/site-settings-defaults";

export { DEFAULT_SETTINGS };

export type SettingField = {
  key: string;
  label: string;
  type: "text" | "textarea" | "boolean" | "lines" | "secret" | "select";
  group: string;
  help?: string;
  options?: string[];
};

/**
 * Skema pengaturan situs. Kunci WAJIB sama dengan yang dipakai seed dan
 * landing page — kalau menambah key baru, tambahkan juga default-nya di
 * `DEFAULT_SETTINGS`.
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

  { key: "home.categories.eyebrow", label: "Judul kecil kategori", type: "text", group: "Halaman Utama" },
  { key: "home.categories.title", label: "Judul kategori", type: "text", group: "Halaman Utama" },
  { key: "home.categories.button", label: "Tombol kategori", type: "text", group: "Halaman Utama" },
  { key: "home.courses.eyebrow", label: "Judul kecil buku", type: "text", group: "Halaman Utama" },
  { key: "home.courses.title", label: "Judul buku", type: "text", group: "Halaman Utama" },
  { key: "home.courses.button", label: "Tombol buku", type: "text", group: "Halaman Utama" },
  { key: "home.courses.readButton", label: "Tombol baca buku", type: "text", group: "Halaman Utama" },
  { key: "home.courses.priceSuffix", label: "Akufiks harga", type: "text", group: "Halaman Utama" },
  { key: "home.viral.eyebrow", label: "Judul kecil #ViralForJustice", type: "text", group: "Halaman Utama" },
  { key: "home.viral.title", label: "Judul #ViralForJustice", type: "text", group: "Halaman Utama" },
  { key: "home.viral.subtitle", label: "Nama di #ViralForJustice", type: "text", group: "Halaman Utama" },
  { key: "home.viral.body", label: "Paragraf #ViralForJustice", type: "textarea", group: "Halaman Utama" },
  { key: "home.viral.image", label: "Gambar #ViralForJustice", type: "text", group: "Halaman Utama" },
  { key: "home.documentation.eyebrow", label: "Judul kecil dokumentasi", type: "text", group: "Halaman Utama" },
  { key: "home.documentation.signature", label: "Nama penanda dokumentasi", type: "text", group: "Halaman Utama" },

  { key: "footer.browse.title", label: "Judul kolom Browse", type: "text", group: "Footer" },
  { key: "footer.browse.links", label: "Tautan Browse (satu per baris)", type: "lines", group: "Footer" },
  { key: "footer.platform.title", label: "Judul kolom Platform", type: "text", group: "Footer" },
  { key: "footer.platform.links", label: "Tautan Platform (satu per baris)", type: "lines", group: "Footer" },
  { key: "footer.subscribe.placeholder", label: "Placeholder email", type: "text", group: "Footer" },
  { key: "footer.subscribe.button", label: "Tombol langganan", type: "text", group: "Footer" },
  { key: "footer.subscribe.text", label: "Teks langganan", type: "textarea", group: "Footer" },
  { key: "footer.legal.privacy", label: "Tautan Privacy Policy", type: "text", group: "Footer" },
  { key: "footer.legal.terms", label: "Tautan Terms of Service", type: "text", group: "Footer" },
  { key: "footer.legal.cookies", label: "Tautan Cookies Settings", type: "text", group: "Footer" },

  { key: "company.vision", label: "Visi", type: "textarea", group: "Copy Landing Page" },
  { key: "company.mission", label: "Misi", type: "textarea", group: "Copy Landing Page" },
  { key: "company.social.tiktok", label: "Tautan TikTok", type: "text", group: "Copy Landing Page" },
  { key: "company.social.youtube", label: "Tautan YouTube", type: "text", group: "Copy Landing Page" },
  { key: "company.social.instagram", label: "Tautan Instagram", type: "text", group: "Copy Landing Page" },

  { key: "payment.usdToIdr", label: "Kurs USD → IDR", type: "text", group: "Pembayaran", help: "Dipakai saat membuat order." },

  {
    key: "payment.midtrans.enabled",
    label: "Aktifkan pembayaran Midtrans",
    type: "boolean",
    group: "Midtrans",
    help: "Kalau mati, tombol beli akan memakai mode manual.",
  },
  {
    key: "payment.midtrans.mode",
    label: "Mode Midtrans",
    type: "select",
    group: "Midtrans",
    options: ["sandbox", "production"],
    help: "sandbox = uji coba (kredit virtual), production = uang asli.",
  },
  {
    key: "payment.midtrans.serverKey",
    label: "Server Key",
    type: "secret",
    group: "Midtrans",
    help: "Rahasia — disimpan di server saja. Kosongkan untuk kembali ke nilai .env.",
  },
  {
    key: "payment.midtrans.clientKey",
    label: "Client Key",
    type: "secret",
    group: "Midtrans",
    help: "Boleh tampil di browser. Kosongkan untuk kembali ke nilai .env.",
  },

  { key: "tax.enabled", label: "Aktifkan pajak", type: "boolean", group: "Pajak" },
  { key: "tax.type", label: "Jenis pajak", type: "text", group: "Pajak", help: "percentage atau fixed" },
  { key: "tax.percentage", label: "Pajak persen", type: "text", group: "Pajak" },
  { key: "tax.fixedAmount", label: "Pajak tetap (Rp)", type: "text", group: "Pajak" },
];

export const SETTING_GROUPS = [
  "Profil",
  "Halaman Utama",
  "Footer",
  "Copy Landing Page",
  "Pembayaran",
  "Midtrans",
  "Pajak",
];

/**
 * Baca semua pengaturan situs. Di-cache supaya landing page tidak query
 * DB tiap request; tag "content" di-invalidate dari server action admin.
 * Nilai kosong di DB otomatis memakai nilai bawaan.
 */
export async function getSettings(): Promise<Record<string, string>> {
  "use cache";
  cacheTag("content");

  const rows = await prisma.siteSetting.findMany();
  const merged: Record<string, string> = { ...DEFAULT_SETTINGS };

  for (const row of rows) {
    const value = row.value?.trim() ? row.value : DEFAULT_SETTINGS[row.key] ?? "";
    merged[row.key] = value;
  }

  return merged;
}
