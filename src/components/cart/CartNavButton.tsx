"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
 */
export default function CartNavButton({
  style,
}: {
  style?: React.CSSProperties;
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

  return (
    <Link
      href="/keranjang"
      aria-label={count ? `Keranjang (${count})` : "Keranjang"}
      className="absolute z-10 block"
      style={style}
    >
      {count && count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-semibold leading-none text-white shadow">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
