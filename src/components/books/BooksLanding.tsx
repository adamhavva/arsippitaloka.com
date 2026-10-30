import PdfHero from "@/components/layout/PdfHero";
import { SPLIT_NAV_ZONES } from "@/components/layout/split-nav";

/**
 * Banner landing katalog buku.
 *
 * Sumber desain: `references/layouts/split/MENU BOOKS.pdf` (kanvas 1920 pt
 * × 4430,91 pt). Navigasi taken dari varian yang sama: `MENU BOOKS 2.pdf`.
 *
 * Aset `public/images/books-hero.jpg` (2400 × 1705 px = kanvas 1920 pt
 * mulai pt y=0, jadi 1,25 px/pt) sudah memuat navbar + judul
 * "One Page, Endless Stories!" + subjudul "Find Your Next Favorite Read"
 * + "Jelajah ilmu tanpa batas dalam satu genggaman saja." — teksnya menyatu
 * di dalam gambar, jadi TIDAK boleh dirender ulang sebagai HTML. Yang
 * dirender ulang hanya judul section di bawah banner, yang memang terpisah
 * dari gambar.
 *
 * Koordinat yang dipakai:
 * - navbar ( transparan, dari `SPLIT_NAV_ZONES`): Pitaloka x99 y52 w202 h58;
 *   Home x714 y58 w68 h48; Books x832 y58 w66 h48; About x942 y58 w72 h48;
 *   News & Views x1054 y58 w152 h48; Sign In x1529 y60 w62 h36;
 *   Join Us x1626 y60 w68 h36.
 * - judul section "E-Books Collections": x164–663, y1491–1575 (MENU BOOKS).
 *   Pada MENU BOOKS 2 labelnya di x709–1208, y1491–1575 dengan judul utama
 *   dua baris "One Page," / "Endless Stories!" — teksnya sama persis.
 */
export default function BooksLanding() {
  return (
    <>
      <PdfHero
        src="/images/books-hero.jpg"
        alt="Katalog E-Books Pitaloka"
        heightPx={1705}
        widthPx={2400}
        originY={0}
        zones={SPLIT_NAV_ZONES}
        priority
      />

      <section className="mx-auto w-full max-w-6xl px-6 pt-12 md:px-10">
        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-[#110f0d] md:text-5xl">
          E-Books Collections
        </h1>
      </section>
    </>
  );
}
