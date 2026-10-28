import Hero from "@/components/home/Hero";
import FeatureCategories from "@/components/home/FeatureCategories";
import FeaturedCourses from "@/components/home/FeaturedCourses";
import ViralForJustice from "@/components/home/ViralForJustice";
import DocumentationSection from "@/components/home/DocumentationSection";
import CtaBanner from "@/components/home/CtaBanner";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Hero />
      <FeatureCategories />
      <FeaturedCourses />
      <ViralForJustice />
      <DocumentationSection />
      <CtaBanner />
      <Footer />
    </div>
  );
}
