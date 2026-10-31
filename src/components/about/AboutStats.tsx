import Link from "next/link";

/**
 * Band statistik di halaman `/about`.
 *
 * Di PDF `references/layouts/split/MENU ABOUT.pdf` band ini ada di
 * y = 1464–1628 pt dengan latar abu rgb(217,216,215).
 *
 * Sejak 2026-10-31 semua ukuran `vw` diganti responsif:
 * - mobile: grid vertikal (1 kolom), angka h-12, label sm
 * - tablet/desktop: grid 4 kolom, angka sesuai PDF rasio (~text-5xl/md:text-6xl)
 */

const COLUMNS = [
  { number: "600+", label: "Books" },
  { number: "Updated", label: "News" },
  { number: "1000+", label: "Documentations" },
  { number: "Updated", label: "Social Media" },
];

export default function AboutStats() {
  return (
    <section className="w-full">
      {/* Jarak putih antar section (desktop ~68pt ≈ 8.5rem, mobile ~40px) */}
      <div className="h-10 md:h-[5rem]" aria-hidden />

      <div className="bg-[#d9d8d7] px-4 py-6 md:mx-[4.075%] md:flex md:h-auto md:items-center md:justify-center md:py-10">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-x-0 md:gap-y-0 md:text-center md:text-[#231f20]">
          {COLUMNS.map((col) => (
            <div key={col.label} className="flex flex-col items-center">
              <dt className="font-heading text-xl font-bold leading-none md:text-5xl lg:text-6xl">
                {col.number}
              </dt>
              <dd className="mt-1 font-sans text-xs font-medium leading-none md:mt-0 md:text-lg">
                {col.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Jarak putih antar section (desktop ~143pt ≈ 18rem, mobile ~60px) */}
      <div className="h-14 md:h-[10rem]" aria-hidden />
    </section>
  );
}
