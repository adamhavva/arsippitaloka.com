import type { Zone } from "./OverlayLinks";

/**
 * Zona navigasi (dalam satuan pt kanvas PDF 1920 pt) yang dipakai oleh
 * semua halaman hasil konversi `references/layouts/split`.
 *
 * Koordinat diambil dari `pdftotext -bbox-layout` pada PDF split. Semua
 * PDF split memakai navbar yang sama, jadi satu daftar ini berlaku untuk
 * `MENU ABOUT`, `MENU BOOKS`, `MENU BOOKS 2`, dan `MENU News & Views`.
 *
 *Navbar ikut ter-render di dalam gambar (asset di `public/images/`), jadi
 * tautannya dibuat sebagai zona transparan di atas gambar — bukan teks
 * HTML — supaya tampilan tetap sama persis dengan desain PDF.
 */
export const SPLIT_NAV_ZONES: Zone[] = [
  { label: "Pitaloka", href: "/", x: 99, y: 52, w: 202, h: 58 },
  { label: "Home", href: "/", x: 714, y: 58, w: 68, h: 48 },
  { label: "Books", href: "/buku", x: 832, y: 58, w: 66, h: 48 },
  { label: "About", href: "/about", x: 942, y: 58, w: 72, h: 48 },
  { label: "News & Views", href: "/news-and-views", x: 1054, y: 58, w: 152, h: 48 },
  { label: "Sign In", href: "/login", x: 1529, y: 60, w: 62, h: 36 },
  { label: "Join Us", href: "/register", x: 1626, y: 60, w: 68, h: 36 },
];
