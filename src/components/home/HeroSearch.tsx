"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Kotak pencarian yang menumpuk di atas gambar hero beranda.
 *
 * `hero-full.jpg` sudah berisi gambar kapsul putih (area input) dan tombol
 * lingkaran dengan ikon magnifier. Jadi komponen ini HANYA menumpuk elemen
 * HTML transparan di atas kedua area itu — tidak menggambar ulang desain.
 *
 * Posisi mengikuti Piksel render 150 DPI (`public/images/hero-full.jpg`,
 * 4000 × 2836 px):
 *
 *   - kapsul input : x 1209–2469 px (30,2 %–61,7 %), y 2078–2222 px
 *   - tombol cari  : x 2566–2755 px (64,2 %–68,9 %), y 2078–2222 px
 *
 * Submit (Enter atau klik tombol) → `/cari?q=<kata kunci>`.
 */
export default function HeroSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const query = value.trim();
    router.push(query ? `/cari?q=${encodeURIComponent(query)}` : "/cari");
  }

  return (
    <>
      <form
        id="hero-search-form"
        role="search"
        onSubmit={submit}
        className="absolute"
        style={{ left: "30.5%", top: "72.5%", width: "31.5%", height: "6.5%" }}
      >
        <label htmlFor="hero-search-input" className="sr-only">
          Cari buku
        </label>
        <input
          id="hero-search-input"
          type="text"
          name="q"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Cari buku"
          placeholder="Cari buku…"
          autoComplete="off"
          className="h-full w-full rounded-full bg-transparent px-6 text-sm text-neutral-900 outline-none placeholder:text-neutral-500"
        />
      </form>

      {/* Tombol transparan di atas ikon magnifier yang sudah ada di gambar. */}
      <button
        type="submit"
        form="hero-search-form"
        aria-label="Search"
        className="absolute cursor-pointer bg-transparent"
        style={{ left: "62.5%", top: "72.5%", width: "6.5%", height: "6.5%" }}
      />
    </>
  );
}
