import type { Metadata } from "next";
import Footer from "@/components/home/Footer";
import AboutCta from "@/components/about/AboutCta";
import AboutStats from "@/components/about/AboutStats";
import PdfHero from "@/components/layout/PdfHero";
import type { Zone } from "@/components/layout/OverlayLinks";
import { SPLIT_NAV_ZONES } from "@/components/layout/split-nav";

export const metadata: Metadata = {
  title: "About — Arsip Pitaloka",
  description:
    "Arsip, Dokumentasi & E-Book by PITALOKA — wadah digital untuk Buku Langkah.",
};

/**
 * Halaman `/about` dibangun dari potongan `references/layouts/split/MENU
 * ABOUT.pdf` (kanvas 1920 pt).
 *
 * Aset di `public/images/` dirender pada lebar 2400 px untuk kanvas 1920 pt,
 * jadi 1 px = 0,8 pt (1,25 px/pt). Koordinat zona diambil dari
 * `pdftotext -bbox-layout` dan diverifikasi ulang lewat analisis piksel:
 *
 *   - about-hero.jpg    : 2400 × 1732 px  → pt 0 … 1385,6      (originY 0)
 *   - about-profile.jpg : 2400 × 1071 px  → pt 1871 … 2727,8   (originY 1871)
 *   - about-cta.jpg     : 2400 ×  666 px  → pt 2868,5 … 3401,3 (originY 2868,5)
 */
const MENU_ZONES: Zone[] = [
  {
    label: "Kumpulan Buku Original",
    href: "/buku",
    x: 1481,
    y: 236,
    w: 271,
    h: 38,
  },
  {
    label: "Biografi Rieke Diah Pitaloka",
    href: "/buku/kategori/biografi",
    x: 1481,
    y: 298,
    w: 303,
    h: 37,
  },
  {
    label: "Media For Justice",
    href: "/news-and-views",
    x: 1481,
    y: 354,
    w: 195,
    h: 37,
  },
  {
    label: "Bersatu Kita Bisa",
    href: "#cta",
    x: 1481,
    y: 414,
    w: 188,
    h: 37,
  },
];

/** Tombol "Know Us More >" — teks putih di atas bar maroon. */
const KNOW_US_MORE_ZONE: Zone = {
  label: "Know Us More",
  href: "/buku/kategori/biografi",
  x: 1017.6,
  y: 2422.1,
  w: 255.9,
  h: 54.8,
};

export default function AboutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PdfHero
        src="/images/about-hero.jpg"
        alt="Arsip, Dokumentasi & E-Book by PITALOKA"
        heightPx={1732}
        originY={0}
        zones={[...SPLIT_NAV_ZONES, ...MENU_ZONES]}
        priority
      />
      <AboutStats />
      <PdfHero
        src="/images/about-profile.jpg"
        alt="Profil Rieke Diah “PITALOKA”"
        heightPx={1071}
        originY={1871}
        zones={[KNOW_US_MORE_ZONE]}
      />
      {/* Jarak putih di PDF: profil berakhir di 2727,8 pt, CTA mulai 2868,5 pt. */}
      <div className="h-[7.3vw]" aria-hidden />
      <AboutCta />
      <Footer />
    </div>
  );
}
