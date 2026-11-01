import Image from "next/image";
import Link from "next/link";
import HeroSearch from "@/components/home/HeroSearch";
import NavAuthChip from "@/components/layout/NavAuthChip";
import CartNavButton from "@/components/cart/CartNavButton";

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

/**
 * Dimensi gambar hero (px) & band navbar yang dipotong pada layar kecil.
 *
 * `hero-full.jpg` = 4000 × 2836 px (kanvas PDF 1920 × 1361 pt). Navbar
 * tercetak di dalam gambar (label + logo "PITALOKA" berakhir di y ≈ 265 px),
 * jadi di layar kecil teksnya tidak terbaca dan hanya jadi coretan. Band
 * tersebut dipotong (290 px) khusus di bawah 640px; di layar ≥ 640px gambar
 * tetap utuh persis seperti desain PDF.
 */
const HERO_WIDTH = 4000;
const HERO_HEIGHT = 2836;
const HERO_CROP = 290;

export default function Hero() {
  return (
    <section
      className="pdf-hero relative w-full"
      style={
        {
          "--pdf-hero-w": String(HERO_WIDTH),
          "--pdf-hero-h": String(HERO_HEIGHT),
          "--pdf-hero-h-cropped": String(HERO_HEIGHT - HERO_CROP),
          "--pdf-hero-shift": `${-(HERO_CROP / HERO_HEIGHT) * 100}%`,
        } as React.CSSProperties
      }
    >
      <div className="pdf-hero-inner relative">
        <Image
          src="/images/hero-full.jpg"
          alt="Pitaloka — Get Access to Hundred Books Available"
          width={HERO_WIDTH}
          height={HERO_HEIGHT}
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />
        {/* Overlay interaktif transparan di atas desain PDF (hanya desktop). */}
        <div className="absolute inset-0 sm:block hidden">
          {navZones.map((z) => (
            <Link
              key={z.label}
              href={z.href}
              aria-label={z.label}
              className="absolute block"
              style={{ top: "4%", left: z.left, width: z.width, height: "4%" }}
            />
          ))}
          {/* Saat login: pill email menimpa "Sign In / Join Us". */}
          <NavAuthChip style={{ top: "4%", right: "11.7%", height: "4%" }} />
          {/* Zona tautan + badge keranjang. */}
          <CartNavButton style={{ top: "4%", left: "89.3%", width: "2.4%", height: "4%" }} />
          <HeroSearch />
        </div>
      </div>
    </section>
  );
}
