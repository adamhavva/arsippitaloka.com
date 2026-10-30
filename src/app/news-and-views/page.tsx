import type { Metadata } from "next";
import PdfHero from "@/components/layout/PdfHero";
import { SPLIT_NAV_ZONES } from "@/components/layout/split-nav";
import BeritaTerkini from "@/components/news/BeritaTerkini";
import ViralForJustice from "@/components/home/ViralForJustice";
import DocumentationSection from "@/components/home/DocumentationSection";
import Footer from "@/components/home/Footer";

export const metadata: Metadata = {
  title: "News & Views — Pitaloka",
  description:
    "What's Trending, What's True. Jelajah ilmu tanpa batas dalam satu genggaman saja.",
};

/**
 * Halaman News & Views (referensi desain: `references/layouts/split/MENU News & Views.pdf`).
 *
 * Hero memakai potongan render PDF (`public/images/news-hero.jpg`, 2400×1230 px
 * = 1920×984 pt kanvas PDF). Semua teks hero — navbar, judul, dan subjudul —
 * sudah menyatu di dalam gambar, jadi TIDAK dirender ulang sebagai HTML.
 * Tautan navbar dibuat sebagai zona transparan di atas gambar lewat
 * `SPLIT_NAV_ZONES`.
 *
 * Badik halaman memakai data nyata: buku/artikel dari tab konten
 * "berita-terkini", dokumentasi, dan video TikTok (#ViralForJustice).
 */
export default function NewsAndViewsPage() {
  return (
    <>
      <PdfHero
        src="/images/news-hero.jpg"
        alt="News & Views Pitaloka — What's Trending, What's True."
        heightPx={1705}
        originY={0}
        zones={SPLIT_NAV_ZONES}
        priority
      />

      <BeritaTerkini />

      <DocumentationSection />

      <ViralForJustice />

      <Footer />
    </>
  );
}
