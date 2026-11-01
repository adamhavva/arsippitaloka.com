import PdfHero from "@/components/layout/PdfHero";
import { SPLIT_NAVBAR_CROP_PT, SPLIT_NAV_ZONES } from "@/components/layout/split-nav";
import Footer from "@/components/home/Footer";
import SiteHeader from "@/components/layout/SiteHeader";

/**
 * Layout area katalog `/buku/**`.
 *
 * Navbar situs menyatu di dalam gambar hero (`books-hero.jpg`) — tidak ada
 * navbar global di root layout. Dengan merender `PdfHero` + `Footer` di sini,
 * SEMUA route `/buku` (katalog, per-tab, per-kategori, detail buku) konsisten
 * punya navbar + footer, sehingga navbar tidak "hilang" saat berpindah dari
 * beranda.
 *
 * Aset `books-hero.jpg`: 2400 × 1705 px, kanvas 1920 pt mulai y=0. Zona navbar
 * transparan diambil dari `SPLIT_NAV_ZONES`.
 */
export default function BukuLayout({ children }: LayoutProps<"/buku">) {
  return (
    <>
      <SiteHeader />
      <PdfHero
        src="/images/books-hero.jpg"
        alt="Katalog E-Books Pitaloka"
        heightPx={1705}
        widthPx={2400}
        originY={0}
        zones={SPLIT_NAV_ZONES}
        priority
        mobileCropPt={SPLIT_NAVBAR_CROP_PT}
      />
      {children}
      <Footer />
    </>
  );
}
