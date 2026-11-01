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
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <p className="font-heading text-base font-bold text-black sm:text-lg">Akun Saya</p>
          <p className="text-[11px] text-neutral-500 sm:text-xs">
            {name} · {email}
          </p>
        </div>

        <nav className="-mx-1 flex w-full items-center gap-2 overflow-x-auto px-1 pb-1 sm:w-auto sm:flex-wrap sm:overflow-x-visible sm:pb-0">
          {MENU.map((item) => {
            const active =
              item.href === "/akun"
                ? pathname === "/akun"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-10 shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-95 sm:px-4 sm:py-1.5 sm:text-sm ${
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
            className="flex min-h-10 shrink-0 items-center rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700"
          >
            Beranda
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex min-h-10 shrink-0 items-center rounded-full border border-neutral-300 px-4 py-1.5 text-sm font-medium text-neutral-700"
          >
            Keluar
          </button>
        </nav>
      </div>
    </header>
  );
}
