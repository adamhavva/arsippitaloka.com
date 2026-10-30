import Image from "next/image";
import Link from "next/link";
import HeroSearch from "@/components/home/HeroSearch";

// Posisi tiap label di dalam hero-full.jpg (kanvas PDF 1920 pt, teks navbar
// diukur dari render 150 DPI): Pitaloka x99–301, Home x714–781,
// Books x832–898, About x942–1014, News & Views x1054–1206,
// Sign In x1529–1591, Join Us x1626–1694.
const navZones = [
  { label: "Pitaloka", href: "/", left: "5.2%", width: "10.5%" },
  { label: "Home", href: "/", left: "37.2%", width: "3.5%" },
  { label: "Books", href: "/buku", left: "43.3%", width: "3.5%" },
  { label: "About", href: "/about", left: "49.1%", width: "3.8%" },
  { label: "News & Views", href: "/news-and-views", left: "54.9%", width: "8%" },
  { label: "Sign In", href: "/login", left: "79.6%", width: "3.3%" },
  { label: "Join Us", href: "/register", left: "84.7%", width: "3.6%" },
];

export default function Hero() {
  return (
    <section className="relative w-full">
      <Image
        src="/images/hero-full.jpg"
        alt="Pitaloka — Get Access to Hundred Books Available"
        width={4000}
        height={2836}
        priority
        sizes="100vw"
        className="h-auto w-full"
      />
      {/* Overlay interaktif transparan di atas desain PDF */}
      <div className="absolute inset-0">
        {navZones.map((z) => (
          <Link
            key={z.label}
            href={z.href}
            aria-label={z.label}
            className="absolute block"
            style={{ top: "4%", left: z.left, width: z.width, height: "4%" }}
          />
        ))}
        <HeroSearch />
      </div>
    </section>
  );
}
