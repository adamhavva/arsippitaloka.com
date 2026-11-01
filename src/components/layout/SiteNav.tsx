import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import CartNavButton from "@/components/cart/CartNavButton";
import NavAuthMenu from "@/components/layout/NavAuthMenu";

/**
 * Navbar HTML untuk halaman yang navbar desainnya tidak ikut ter-render ke
 * dalam gambar (mis. area `/buku`).
 *
 * Sebelumnya navbar di halaman ini ikut tercetak di dalam gambar hero
 * (`books-hero.jpg`), sehingga logo & teksnya ikut jadi piksel gambar — tajam
 * hanya di resolusi render, dan tidak bisa dipakai ulang. Di sini navbar
 * dibangun sebagai HTML sungguhan:
 *
 * - logo memakai berkas asli `logo-pitaloka.png` sebagai elemen `<Image>`
 *   (bukan `background-image`), jadi tetap tajam di semua resolusi;
 * - tautan navigasi, pencarian, akun, dan keranjang jadi elemen nyata
 *   (bisa difokus, dibaca screen reader, dan punya target tap yang layak).
 *
 * Di layar kecil (< 640px) navbar ini disembunyikan dan digantikan
 * `SiteHeader` (versi mobile dengan tombol hamburger).
 */

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/buku", label: "Books" },
  { href: "/about", label: "About" },
  { href: "/news-and-views", label: "News & Views" },
];

export default function SiteNav() {
  return (
    <header className="hidden border-b border-neutral-200 bg-white text-neutral-800 sm:block">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-8 px-6 lg:px-10">
        <Link
          href="/"
          aria-label="Pitaloka — Beranda"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/images/logo-pitaloka-maroon.png"
            alt="Pitaloka"
            width={600}
            height={220}
            priority
            className="h-8 w-auto lg:h-9"
          />
        </Link>

        <nav aria-label="Navigasi utama" className="ml-auto">
          <ul className="flex items-center gap-8 lg:gap-11">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex h-9 items-center text-[15px] font-medium tracking-wide text-neutral-700 transition hover:text-maroon"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/cari"
            aria-label="Cari"
            className="inline-flex h-9 items-center gap-2 text-[15px] font-medium text-neutral-700 transition hover:text-maroon"
          >
            <Search size={17} />
            <span className="hidden lg:inline">Search</span>
          </Link>

          <NavAuthMenu />

          <CartNavButton
            variant="button"
            className="text-neutral-700 hover:bg-neutral-100 hover:text-maroon"
          />
        </div>
      </div>
    </header>
  );
}
