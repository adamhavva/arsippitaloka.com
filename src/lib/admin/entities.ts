/**
 * Konfigurasi entitas untuk CRUD generik di area admin.
 *
 * Satu file = satu sumber kebenaran untuk label, kolom tabel, dan field form.
 * Nama `model` WAJIB ada di `ENTITY_MODELS` (allowlist) — jangan pakai
 * string model dinamis dari URL, itu celah injeksi nama delegate Prisma.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "date"
  | "image"
  | "file"
  | "lines";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Opsi select diambil dari entitas lain (mis. tab konten untuk buku). */
  source?: { entity: string; labelField: string };
  /** Tampilkan sebagai kolom di tabel. */
  list?: boolean;
  readOnly?: boolean;
  step?: string;
};

export type EntityDef = {
  /** Dipakai di URL: /admin/<key> */
  key: string;
  label: string;
  singular: string;
  /** Nama delegate Prisma — harus ada di ENTITY_MODELS. */
  model: "category" | "contentTab" | "book" | "documentation" | "tiktokPost";
  titleField: string;
  orderBy?: { field: string; dir: "asc" | "desc" };
  fields: FieldDef[];
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
};

export const ENTITIES: Record<string, EntityDef> = {
  category: {
    key: "category",
    label: "Kategori",
    singular: "kategori",
    model: "category",
    titleField: "name",
    orderBy: { field: "order", dir: "asc" },
    fields: [
      { name: "name", label: "Nama", type: "text", required: true, list: true },
      { name: "slug", label: "Slug", type: "text", required: true, list: true },
      {
        name: "icon",
        label: "Icon (nama lucide-react)",
        type: "text",
        list: true,
        placeholder: "BookOpen",
      },
      { name: "highlight", label: "Highlight", type: "boolean", list: true },
      { name: "order", label: "Urutan", type: "number", list: true },
    ],
  },

  tab: {
    key: "tab",
    label: "Tab Konten",
    singular: "tab",
    model: "contentTab",
    titleField: "label",
    orderBy: { field: "order", dir: "asc" },
    fields: [
      { name: "label", label: "Label", type: "text", required: true, list: true },
      { name: "slug", label: "Slug", type: "text", required: true, list: true },
      { name: "order", label: "Urutan", type: "number", list: true },
    ],
  },

  book: {
    key: "book",
    label: "Buku",
    singular: "buku",
    model: "book",
    titleField: "title",
    orderBy: { field: "order", dir: "asc" },
    fields: [
      { name: "title", label: "Judul", type: "text", required: true, list: true },
      { name: "author", label: "Penulis", type: "text", required: true, list: true },
      { name: "slug", label: "Slug", type: "text", required: true, list: true },
      { name: "description", label: "Deskripsi", type: "textarea" },
      {
        name: "tabId",
        label: "Tab Konten",
        type: "select",
        required: true,
        list: true,
        source: { entity: "tab", labelField: "label" },
      },
      { name: "coverUrl", label: "Sampul", type: "image" },
      { name: "fileUrl", label: "File e-book (PDF)", type: "file" },
      { name: "fileFormat", label: "Format File", type: "text", placeholder: "PDF" },
      { name: "fileSize", label: "Ukuran File (byte)", type: "number" },
      { name: "language", label: "Bahasa", type: "text", list: true },
      { name: "pages", label: "Halaman", type: "number", list: true },
      { name: "wordCount", label: "Jumlah Kata", type: "number" },
      { name: "readCount", label: "Dibaca", type: "number", list: true },
      { name: "rating", label: "Rating", type: "number", step: "0.1", list: true },
      { name: "priceUsd", label: "Harga (USD)", type: "number", step: "0.01", list: true },
      { name: "isFree", label: "Gratis", type: "boolean", list: true },
      { name: "isNew", label: "Baru", type: "boolean", list: true },
      { name: "archived", label: "Arsip", type: "boolean", list: true },
      { name: "isDownloadable", label: "Bisa diunduh", type: "boolean", list: true },
      { name: "publishedYear", label: "Tahun Terbit", type: "number" },
      { name: "edition", label: "Edisi", type: "text" },
      { name: "isbn", label: "ISBN", type: "text" },
      { name: "translator", label: "Penerjemah", type: "text" },
      { name: "editor", label: "Editor", type: "text" },
      { name: "illustrator", label: "Ilustrator", type: "text" },
      { name: "publisher", label: "Penerbit", type: "text" },
      { name: "copyrightHolder", type: "text", label: "Pemegang Hak Cipta" },
      { name: "order", label: "Urutan", type: "number", list: true },
    ],
  },

  documentation: {
    key: "documentation",
    label: "Dokumentasi",
    singular: "dokumentasi",
    model: "documentation",
    titleField: "title",
    fields: [
      { name: "title", label: "Judul", type: "text", required: true, list: true },
      { name: "lead", label: "Lead", type: "textarea" },
      { name: "photoUrl", label: "Foto", type: "image" },
      { name: "eventDate", label: "Tanggal", type: "date", required: true, list: true },
      {
        name: "checklist",
        label: "Checklist (satu per baris)",
        type: "lines",
        help: "Setiap baris jadi satu poin checklist.",
      },
      { name: "published", label: "Tayang", type: "boolean", list: true },
    ],
  },

  tiktok: {
    key: "tiktok",
    label: "TikTok",
    singular: "postingan TikTok",
    model: "tiktokPost",
    titleField: "title",
    orderBy: { field: "order", dir: "asc" },
    fields: [
      {
        name: "videoId",
        label: "Video ID",
        type: "text",
        required: true,
        list: true,
        placeholder: "7234567890123456789",
        help: "Angka terakhir dari URL tiktok.com/@user/video/<id>",
      },
      { name: "title", label: "Judul", type: "text", required: true, list: true },
      { name: "caption", label: "Caption", type: "textarea" },
      { name: "author", label: "Autor", type: "text", list: true },
      { name: "highlight", label: "Highlight", type: "boolean", list: true },
      { name: "order", label: "Urutan", type: "number", list: true },
      { name: "published", label: "Tayang", type: "boolean", list: true },
    ],
  },
};

/** Allowlist model → delegate Prisma. */
export const ENTITY_MODELS = {
  category: "category",
  contentTab: "contentTab",
  book: "book",
  documentation: "documentation",
  tiktokPost: "tiktokPost",
} as const;

export const ENTITY_KEYS = Object.keys(ENTITIES);

export function getEntity(key: string): EntityDef | undefined {
  return ENTITIES[key];
}

/** Daftar entitas yang tampil di sidebar admin. */
export const ADMIN_MENU: { href: string; label: string }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/book", label: "Buku" },
  { href: "/admin/category", label: "Kategori" },
  { href: "/admin/tab", label: "Tab Konten" },
  { href: "/admin/documentation", label: "Dokumentasi" },
  { href: "/admin/tiktok", label: "TikTok" },
  { href: "/admin/orders", label: "Order" },
  { href: "/admin/users", label: "User" },
  { href: "/admin/profile", label: "Profil Perusahaan" },
];
