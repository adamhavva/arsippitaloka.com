import Footer from "@/components/home/Footer";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteNav from "@/components/layout/SiteNav";

/**
 * Layout area katalog `/buku/**`.
 *
 * Navbar situs dibuat sebagai HTML (`SiteNav` untuk desktop, `SiteHeader`
 * untuk mobile) — bukan bagian dari gambar hero, supaya logo Pitaloka tetap
 * tajam dan tautannya bisa difokus. Karena itu gambar hero katalog
 * (`books-hero-body.jpg`) sudah dipotong tanpa band navbar.
 *
 * Layout ini juga menyediakan `Footer` yang konsisten untuk SEMUA route
 * `/buku`.
 */
export default function BukuLayout({ children }: LayoutProps<"/buku">) {
  return (
    <>
      <SiteHeader />
      <SiteNav />
      {children}
      <Footer />
    </>
  );
}
