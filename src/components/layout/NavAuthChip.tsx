"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";

type SessionUser = {
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

/**
 * Chip akun yang menimpa area "Sign In / Join Us" pada navbar hasil render PDF.
 *
 * Navbar menyatu di dalam gambar (hero-full.jpg / *-hero.jpg), jadi teksnya
 * tidak bisa diganti langsung. Komponen client ini membaca sesi lewat
 * `/api/auth/session` di sisi browser — sehingga shell halaman tetap statis
 * (PPR) dan tidak ikut jadi dinamis. Saat BELUM login ia me-render `null`
 * (zona tautan transparan "Sign In"/"Join Us" di bawahnya tetap berfungsi);
 * saat SUDAH login ia menampilkan pill maroon berisi email yang menimpa teks
 * "Sign In / Join Us" dan menautkan ke dashboard akun sesuai role.
 *
 * Posisi diberikan lewat `style` (top/right/height dalam persen) karena tiap
 * halaman memakai kanvas gambar yang berbeda.
 */
export default function NavAuthChip({
  style,
}: {
  style?: React.CSSProperties;
}) {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { user?: SessionUser } | null) => {
        if (active) setUser(data?.user ?? null);
      })
      .catch(() => {
        /* biarkan tetap tampil "Sign In" bila sesi gagal dibaca */
      });
    return () => {
      active = false;
    };
  }, []);

  if (!user?.email) return null;

  const href = user.role === "ADMIN" ? "/admin" : "/akun";

  return (
    <Link
      href={href}
      title={user.email}
      aria-label={`Akun: ${user.email}`}
      className="absolute z-10 hidden items-center gap-2 rounded-full bg-maroon px-3 text-sm font-medium text-white shadow-md transition hover:bg-maroon-dark sm:flex"
      style={style}
    >
      <UserRound size={15} className="shrink-0" />
      <span className="max-w-[14ch] truncate sm:max-w-[20ch]">
        {user.email}
      </span>
    </Link>
  );
}
