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

/** Tautan navigasi utama — tampil hanya pada layar kecil sebagai baris tombol di bawah gambar hero. */
const MOBILE_NAV_LINKS = [
  { label: "Buku", href: "/buku" },
  { label: "About", href: "/about" },
  { label: "News", href: "/news-and-views" },
  { label: "Keranjang", href: "/keranjang" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
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

      {/* Navigasi mobile — baris tombol horizontal di bawah gambar hero. */}
      <div className="sm:hidden sticky top-0 z-20 flex items-center gap-x-2 overflow-x-auto rounded-t-lg bg-white/95 px-4 py-2 backdrop-blur">
        {MOBILE_NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-full bg-maroon-dark px-4 py-1.5 text-xs font-medium text-white transition hover:bg-maroon-dark/80"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
