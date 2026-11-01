"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

/**
 * Zona tautan transparan + badge jumlah yang menimpa ikon tas belanja yang
 * sudah tercetak di gambar navbar hero (hero-full.jpg / *-hero.jpg).
 *
 * Seperti NavAuthChip: tidak menyentuh render `<Image>`, hanya overlay di
 * atasnya. `fetch("/api/cart")` saat mount untuk angka badge; 401 (belum
 * login) → tanpa badge, link tetap ke /keranjang (proxy akan mengarahkan ke
 * login). Dengar event `cart:changed` agar badge langsung ikut berubah setelah
 * "Tambah ke Keranjang".
 *
 * Posisi diberikan lewat `style` (top/left/width/height persen) karena tiap
 * halaman memakai kanvas gambar yang berbeda.
 *
 * `variant="button"` dipakai untuk header mobile: tombol biasa (bukan
 * overlay) dengan ikon tas belanja.
 */
export default function CartNavButton({
  style,
  variant = "overlay",
  className = "",
}: {
  style?: React.CSSProperties;
  variant?: "overlay" | "button";
  /** Kelas tambahan untuk varian `button` (ikon di navbar HTML). */
  className?: string;
}) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    fetch("/api/cart", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (active && typeof data?.count === "number") setCount(data.count);
      })
      .catch(() => {
        /* biarkan tanpa badge bila sesi/keranjang gagal dibaca */
      });

    function onChanged(e: Event) {
      const detail = (e as CustomEvent<{ count?: number }>).detail;
      if (typeof detail?.count === "number") setCount(detail.count);
    }
    window.addEventListener("cart:changed", onChanged);

    return () => {
      active = false;
      window.removeEventListener("cart:changed", onChanged);
    };
  }, []);

  const badge =
    count && count > 0 ? (
      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-semibold leading-none text-white shadow">
        {count > 99 ? "99+" : count}
      </span>
    ) : null;

  if (variant === "button") {
    return (
      <Link
        href="/keranjang"
        aria-label={count ? `Keranjang (${count})` : "Keranjang"}
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-neutral-100 ${className}`}
      >
        <ShoppingCart size={20} />
        {badge}
      </Link>
    );
  }

  return (
    <Link
      href="/keranjang"
      aria-label={count ? `Keranjang (${count})` : "Keranjang"}
      className="absolute z-10 hidden sm:block"
      style={style}
    >
      {badge}
    </Link>
  );
}
