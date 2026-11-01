"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { UserRound } from "lucide-react";

type SessionUser = {
  email?: string | null;
  name?: string | null;
  role?: string | null;
};

/**
 * Area akun untuk navbar HTML (`SiteNav`).
 *
 * Belum login → tautan "Sign In" + tombol "Join Us".
 * Sudah login → pill berisi email + tombol keluar.
 *
 * Sesi dibaca di browser (bukan server) supaya halaman tetap bisa di-prerender
 * statis — pola yang sama dipakai `SiteHeader` dan `NavAuthChip`.
 */
export default function NavAuthMenu() {
  const [user, setUser] = useState<SessionUser | null>(null);

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

  if (user?.email) {
    const href = user.role === "ADMIN" ? "/admin" : "/akun";
    return (
      <div className="flex items-center gap-2">
        <Link
          href={href}
          title={user.email}
          className="inline-flex h-9 max-w-[220px] items-center gap-2 rounded-full bg-maroon px-3 text-sm font-medium text-white transition hover:bg-maroon-dark"
        >
          <UserRound size={15} className="shrink-0" />
          <span className="truncate">{user.email}</span>
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="inline-flex h-9 items-center rounded-full border border-neutral-300 px-3 text-sm text-neutral-700 transition hover:bg-neutral-100"
        >
          Keluar
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/login"
        className="inline-flex h-9 items-center text-[15px] font-medium text-neutral-700 transition hover:text-maroon"
      >
        Sign In
      </Link>
      <Link
        href="/register"
        className="inline-flex h-9 items-center rounded-full bg-maroon px-5 text-[15px] font-semibold text-white transition hover:bg-maroon-dark"
      >
        Join Us
      </Link>
    </div>
  );
}
