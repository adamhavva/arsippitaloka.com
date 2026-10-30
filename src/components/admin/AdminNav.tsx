"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ADMIN_MENU } from "@/lib/admin/entities";

export default function AdminNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-5">
        <p className="font-heading text-lg font-bold text-black">Arsip Pitaloka</p>
        <p className="text-xs text-neutral-500">Panel Admin</p>
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
                  ? "bg-maroon/10 font-semibold text-maroon"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-200 px-5 py-4">
        <p className="truncate text-sm font-medium text-neutral-800">{name}</p>
        <p className="truncate text-xs text-neutral-500">{email}</p>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-3 w-full rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
