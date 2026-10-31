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
  | "lines"
  /** Pilih ikon lucide-react lewat galeri (bukan ketik manual). */
  | "icon"
  /** Tempel share link / kode embed TikTok, ada pratinjau. */
  | "tiktok"
  /** Tempel share link / kode embed multi-platform (TikTok/YouTube/Instagram), ada pratinjau. */
  | "social"
  /** Editor teks kaya (bold/italic/heading/list/link) berbasis Tiptap. */
  | "richtext"
  /** Pilih satu kategori (dengan ikon) dari daftar kategori. */
  | "category";

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
  /**
   * Kolom diisi otomatis dari file yang diunggah:
   * "format" | "size" | "words" | "pages".
   */
  autoFrom?: "format" | "size" | "words" | "pages";
  /** Kolom otomatis (tidak diketik manual); nilainya dikirim lewat input tersembunyi. */
  auto?: boolean;
  /** Nilai awal untuk kolom otomatis. */
  defaultValue?: string | number;
  /** Slug dibuat otomatis dari field ini (mis. "title" atau "name"). */
  slugFrom?: string;
};

export type EntityDef = {
  /** Dipakai di URL: /admin/<key> */
  key: string;
  label: string;
  singular: string;
  /** Nama delegate Prisma — harus ada di ENTITY_MODELS. */
  model: "category" | "contentTab" | "book" | "documentation" | "tiktokPost" | "socialMedia";
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
      {
        name: "slug",
        label: "Slug",
        type: "text",
        list: true,
        slugFrom: "name",
        help: "Dibuat otomatis dari nama. Kalau slug sama, ditambahkan angka unik.",
      },
      {
        name: "icon",
        label: "Icon",
        type: "icon",
        required: true,
        list: true,
        help: "Pilih ikon lucide-react.",
      },
      { name: "highlight", label: "Highlight", type: "boolean", list: true },
      {
        name: "order",
        label: "Urutan",
        type: "number",
        list: true,
        defaultValue: 0,
      },
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
      {
        name: "slug",
        label: "Slug",
        type: "text",
        list: true,
        slugFrom: "label",
        help: "Dibuat otomatis dari label. Kalau slug sama, ditambahkan angka unik.",
      },
      {
        name: "order",
        label: "Urutan",
        type: "number",
        list: true,
        defaultValue: 0,
      },
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
      {
        name: "slug",
        label: "Slug",
        type: "text",
        list: true,
        slugFrom: "title",
        help: "Dibuat otomatis dari judul. Kalau slug sama, ditambahkan angka unik.",
      },
      { name: "description", label: "Deskripsi", type: "richtext" },
      {
        name: "tabId",
        label: "Tab Konten",
        type: "select",
        required: true,
        list: true,
        source: { entity: "tab", labelField: "label" },
      },
      {
        name: "categoryId",
        label: "Kategori",
        type: "category",
        source: { entity: "category", labelField: "name" },
        help: "Kategori ditempel ke buku ini.",
      },
      { name: "coverUrl", label: "Sampul", type: "image" },
      { name: "fileUrl", label: "File e-book (PDF)", type: "file" },
      {
        name: "fileFormat",
        label: "Format File",
        type: "text",
        auto: true,
        autoFrom: "format",
        defaultValue: "PDF",
      },
      {
        name: "fileSize",
        label: "Ukuran File (byte)",
        type: "number",
        auto: true,
        autoFrom: "size",
      },
      { name: "language", label: "Bahasa", type: "text", list: true },
      {
        name: "pages",
        label: "Halaman",
        type: "number",
        list: true,
        auto: true,
        autoFrom: "pages",
        defaultValue: 1,
      },
      {
        name: "wordCount",
        label: "Jumlah Kata",
        type: "number",
        auto: true,
        autoFrom: "words",
      },
      {
        name: "readCount",
        label: "Dibaca",
        type: "number",
        list: true,
        defaultValue: 0,
      },
      {
        name: "rating",
        label: "Rating",
        type: "number",
        step: "0.1",
        list: true,
        auto: true,
        defaultValue: 0,
        help: "Terisi otomatis.",
      },
      { name: "priceUsd", label: "Harga (Rp)", type: "number", step: "1", list: true },
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
      {
        name: "tiktokEmbed",
        label: "TikTok",
        type: "tiktok",
        help: "Tempel share link atau kode embed TikTok — videonya langsung muncul di sini.",
      },
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
      {
        name: "slug",
        label: "Slug",
        type: "text",
        list: true,
        slugFrom: "title",
        help: "Dibuat otomatis dari judul. Dipakai di URL /dokumentasi/<slug>.",
      },
      {
        name: "lead",
        label: "Lead",
        type: "richtext",
        help: "Isi lengkap dokumentasi — bisa sisipkan gambar & video YouTube.",
      },
      { name: "eventDate", label: "Tanggal", type: "date", required: true, list: true },
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
        name: "embedUrl",
        label: "Link / Embed TikTok",
        type: "tiktok",
        required: true,
        help: "Tempel share link TikTok atau kode embed — videonya langsung dipreview di sini.",
      },
      {
        name: "caption",
        label: "Caption",
        type: "textarea",
        list: true,
        help: "Keterangan opsional. Judul & author diambil otomatis dari TikTok.",
      },
      {
        name: "order",
        label: "Urutan",
        type: "number",
        list: true,
        defaultValue: 0,
      },
    ],
  },

  social: {
    key: "social",
    label: "Media Sosial",
    singular: "postingan media sosial",
    model: "socialMedia",
    titleField: "title",
    orderBy: { field: "order", dir: "asc" },
    fields: [
      {
        name: "embedUrl",
        label: "Link / Embed",
        type: "social",
        required: true,
        help: "Tempel share link TikTok/YouTube/Instagram atau kode embed — platform & videonya terbaca otomatis.",
      },
      { name: "title", label: "Judul", type: "text", required: true, list: true },
      { name: "caption", label: "Caption", type: "textarea" },
      { name: "author", label: "Autor", type: "text", list: true },
      {
        name: "platform",
        label: "Platform",
        type: "select",
        list: true,
        help: "Terisi otomatis dari link. Boleh dikoreksi manual bila perlu.",
        options: [
          { value: "tiktok", label: "TikTok" },
          { value: "youtube", label: "YouTube" },
          { value: "instagram", label: "Instagram" },
        ],
      },
      { name: "coverUrl", label: "Cover", type: "image" },
      {
        name: "bookId",
        label: "Buku Terkait",
        type: "select",
        source: { entity: "book", labelField: "title" },
      },
      {
        name: "documentationId",
        label: "Dokumentasi Terkait",
        type: "select",
        source: { entity: "documentation", labelField: "title" },
      },
      {
        name: "contentTabId",
        label: "Tab Konten Terkait",
        type: "select",
        source: { entity: "tab", labelField: "label" },
      },
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
  socialMedia: "socialMedia",
} as const;

export const ENTITY_KEYS = Object.keys(ENTITIES);

export function getEntity(key: string): EntityDef | undefined {
  return ENTITIES[key];
}

/**
 * Item menu sidebar admin. Bisa berupa daun (punya `href`) atau parent
 * (punya `children`). Parent menampilkan chevron untuk buka/tutup.
 */
export type AdminMenuItem = {
  label: string;
  icon: string;
  href?: string;
  children?: { href: string; label: string }[];
};

/** Daftar entitas yang tampil di sidebar admin. */
export const ADMIN_MENU: AdminMenuItem[] = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/admin/book", label: "Buku", icon: "BookOpen" },
  { href: "/admin/category", label: "Kategori", icon: "LayoutGrid" },
  { href: "/admin/tab", label: "Tab Konten", icon: "PanelsTopLeft" },
  { href: "/admin/documentation", label: "Dokumentasi", icon: "FileText" },
  {
    label: "Media Sosial",
    icon: "Video",
    children: [
      { href: "/admin/tiktok", label: "TikTok" },
      { href: "/admin/social?platform=youtube", label: "YouTube" },
      { href: "/admin/social", label: "Semua" },
    ],
  },
  { href: "/admin/orders", label: "Order", icon: "ShoppingCart" },
  { href: "/admin/users", label: "User", icon: "Users" },
  { href: "/admin/profile", label: "Profil Perusahaan", icon: "Settings" },
];
