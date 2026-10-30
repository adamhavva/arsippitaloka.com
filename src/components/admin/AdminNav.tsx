"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  LayoutGrid,
  PanelsTopLeft,
  FileText,
  Music2,
  ShoppingCart,
  Users,
  Settings,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { ADMIN_MENU } from "@/lib/admin/entities";

const ICONS = {
  LayoutDashboard,
  BookOpen,
  LayoutGrid,
  PanelsTopLeft,
  FileText,
  Music2,
  ShoppingCart,
  Users,
  Settings,
} as const;

type IconName = keyof typeof ICONS;

export default function AdminNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const initial = (name || "P").trim().charAt(0).toUpperCase();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col overflow-y-auto bg-maroon-dark text-white">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-6">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white font-heading text-lg font-bold text-maroon-dark">
          {initial}
        </span>
        <span className="min-w-0">
          <span className="block font-heading truncate text-base font-bold leading-tight">
            Pitaloka
          </span>
          <span className="block truncate text-xs text-white/50">Dashboard</span>
        </span>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {ADMIN_MENU.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = ICONS[item.icon as IconName];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-white/15 font-semibold text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon size={17} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>
              <ChevronRight
                size={15}
                className={`shrink-0 ${active ? "opacity-90" : "opacity-50"}`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Akun */}
      <div className="border-t border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white">
            {initial}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{name}</span>
            <span className="block truncate text-xs text-white/50">{email}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-4 flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2 text-sm text-white/70 transition hover:text-white"
        >
          <span className="flex items-center gap-3">
            <LogOut size={17} />
            Sign out
          </span>
          <ChevronRight size={15} className="opacity-50" />
        </button>
      </div>
    </aside>
  );
}
