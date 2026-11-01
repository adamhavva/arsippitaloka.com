import type { Zone } from "./OverlayLinks";

/**
 * Tinggi band navbar (dalam pt kanvas PDF) yang dipotong dari gambar hero
 * pada layar kecil (< 640px).
 *
 * Semua PDF split memakai navbar yang sama: label navbar occupy y 52–110 pt dan
 * logo "PITALOKA" berakhir di y ≈ 127 pt. Pada layar kecil teks setipis itu
 * tidak terbaca, jadi band-nya dipotong dan digantikan header HTML
 * (`SiteHeader`). Di layar ≥ 640px gambar tetap utuh.
 */
export const SPLIT_NAVBAR_CROP_PT = 140;

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
  { label: "Pitaloka", href: "/", x: 99, y: 52, w: 202, h: 58, hiddenOnMobile: true },
  { label: "Home", href: "/", x: 714, y: 58, w: 68, h: 48, hiddenOnMobile: true },
  { label: "Books", href: "/buku", x: 832, y: 58, w: 66, h: 48, hiddenOnMobile: true },
  { label: "About", href: "/about", x: 942, y: 58, w: 72, h: 48, hiddenOnMobile: true },
  { label: "News & Views", href: "/news-and-views", x: 1054, y: 58, w: 152, h: 48, hiddenOnMobile: true },
  { label: "Sign In", href: "/login", x: 1529, y: 60, w: 62, h: 36, hiddenOnMobile: true },
  { label: "Join Us", href: "/register", x: 1626, y: 60, w: 68, h: 36, hiddenOnMobile: true },
];
