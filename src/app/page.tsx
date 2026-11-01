import Hero from "@/components/home/Hero";
import MobileHeroSearch from "@/components/home/MobileHeroSearch";
import FeatureCategories from "@/components/home/FeatureCategories";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import ViralForJustice from "@/components/home/ViralForJustice";
import DocumentationSection from "@/components/home/DocumentationSection";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/home/Footer";
import SiteHeader from "@/components/layout/SiteHeader";

/** Kontainer konten beranda — memberi padding konsisten di semua layar & membatasi lebar maksimum agar tetap rapi pada layar besar. */
const CONTENT_MAX = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      {/* Hero penuh lebar tanpa container (gambar PDF sudah full). */}
      <Hero />

      {/* Pencarian — hanya di mobile, karena di desktop sudah ada di gambar hero. */}
      <MobileHeroSearch />

      {/* Section terkontrol oleh max-width & spacing konsisten mobile. */}
      <section className={CONTENT_MAX}>
        <FeatureCategories />
        <FeaturedCourses />
      </section>

      {/* Viral for Justice & dokumentasi bisa full-width atau terkontainer sesuai kebutuhan desain. */}
      <ViralForJustice />
      <DocumentationSection />

      {/* CTA banner penuh lebar. */}
      <CtaBanner />

      {/* Footer penuh lebar. */}
      <Footer />
    </div>
  );
}
