"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Menu, Search, UserRound, X } from "lucide-react";
import CartNavButton from "@/components/cart/CartNavButton";
import { SITE_TABS } from "@/lib/site-tabs";

/**
 * Header situs untuk layar kecil (< 640px).
 *
 * Navbar utama situs menyatu di dalam gambar hero hasil render PDF, jadi di
 * layar kecil teksnya tidak terbaca dan zona tautannya jadi target tap yang
 * terlalu kecil. Header ini menggantinya: logo, pencarian, keranjang, akun,
 * dan menu navigasi yang benar-benar bisa dipakai di HP.
 *
 * Di desktop (> 640px) navbar desain PDF tetap dipakai dan header ini
 * disembunyikan.
 *
 * Header ini dipakai halaman publik satu per satu (bukan di root layout),
 * karena `usePathname` di root layout membuat seluruh route kehilangan
 * prerender statis.
 */

type SessionUser = {
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

const PRIMARY_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/buku", label: "Katalog Buku" },
  { href: "/news-and-views", label: "News & Views" },
  { href: "/about", label: "About" },
  { href: "/kontak", label: "Kontak" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  // Sesi dibaca di browser supaya shell halaman tetap statis (PPR).
  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: SessionUser } | null) => {
        if (active) setUser(data?.user ?? null);
      })
      .catch(() => {
        /* biarkan status "belum login" */
      });
    return () => {
      active = false;
    };
  }, []);

  const accountHref = user?.email
    ? user.role === "ADMIN"
      ? "/admin"
      : "/akun"
    : "/login";

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur sm:hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <Link
          href="/"
          className="flex min-h-9 min-w-0 items-center gap-2"
          aria-label="Pitaloka — Beranda"
        >
          <Image
            src="/images/logo-pitaloka.png"
            alt=""
            width={112}
            height={42}
            className="h-7 w-auto shrink-0"
          />
        </Link>

        <div className="ml-auto flex items-center gap-0.5">
          <Link
            href="/cari"
            aria-label="Cari buku"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100"
          >
            <Search size={20} />
          </Link>

          <CartNavButton variant="button" />

          <Link
            href={accountHref}
            aria-label={user?.email ? `Akun: ${user.email}` : "Masuk"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100"
          >
            <UserRound size={20} />
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="site-mobile-menu"
          aria-label="Navigasi utama"
          className="max-h-[70vh] overflow-y-auto border-t border-neutral-200 bg-white px-3 pb-4 pt-3"
        >
          <ul className="grid grid-cols-2 gap-2">
            {PRIMARY_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-xl bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800 transition active:scale-[0.98]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
            Kanal
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {SITE_TABS.map((tab) => (
              <li key={tab.slug}>
                <Link
                  href={`/buku/${tab.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-9 items-center rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition active:scale-95"
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-t border-neutral-200 pt-4">
            {user?.email ? (
              <>
                <Link
                  href={accountHref}
                  className="flex min-h-11 items-center justify-center rounded-full bg-maroon-dark px-4 py-2 text-sm font-medium text-white"
                >
                  {user.role === "ADMIN" ? "Dashboard Admin" : "Akun Saya"}
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex min-h-11 items-center justify-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex min-h-11 items-center justify-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="flex min-h-11 items-center justify-center rounded-full bg-maroon-dark px-4 py-2 text-sm font-medium text-white"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
