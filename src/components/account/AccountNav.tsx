"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const MENU = [
  { href: "/akun", label: "Pustaka Saya" },
  { href: "/akun/orders", label: "Riwayat Order" },
  { href: "/akun/profil", label: "Profil" },
];

export default function AccountNav({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <p className="font-heading text-lg font-bold text-black">Akun Saya</p>
          <p className="text-xs text-neutral-500">
            {name} · {email}
          </p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {MENU.map((item) => {
            const active =
              item.href === "/akun"
                ? pathname === "/akun"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  active
                    ? "bg-maroon-dark text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700"
          >
            Beranda
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700"
          >
            Keluar
          </button>
        </nav>
      </div>
    </header>
  );
}
