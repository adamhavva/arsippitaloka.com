"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ADMIN_MENU } from "@/lib/admin/entities";

export default function AdminNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-maroon-dark text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="font-heading text-lg font-bold">Arsip Pitaloka</p>
        <p className="text-xs text-white/60">Panel Admin</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {ADMIN_MENU.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-white/15 font-semibold"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-white/60">{email}</p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-3 w-full rounded-full border border-white/25 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
