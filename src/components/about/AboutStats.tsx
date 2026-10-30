/**
 * Band statistik di halaman `/about`.
 *
 * Di PDF `references/layouts/split/MENU ABOUT.pdf` band ini ada di
 * y = 1464–1628 pt dengan latar abu rgb(217,216,215) dan inset 78,24 pt
 * dari kiri/kanan. Teksnya sengaja TIDAK ikut dirender sebagai gambar,
 * jadi di sini dibangun sebagai HTML asli.
 *
 * Ukuran dalam PDF (kanvas 1920 pt) dikonversi ke `vw` supaya proporsinya
 * tetap sama di lebar layar apa pun:
 *   1 pt = 100/1920 vw = 0,0520833 vw
 *
 * Posisi ink di PDF (hasil pengukuran piksel, penyesuaian font):
 *   - angka : ink 68,6 pt (tinggi) mulai 1500,5 pt
 *   - label : ink 32,6 pt (tinggi) mulai 1573,4 pt
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
      {/* Jarak putih antara hero (selesai di 1385,6 pt) dan band (1464 pt). */}
      <div className="h-[4.083vw]" aria-hidden />
      <div className="mx-[4.075%] flex h-[8.542vw] items-start justify-center bg-[#d9d8d7] pt-[1.391vw]">
        <dl className="grid w-full grid-cols-4 text-center text-[#231f20]">
          {COLUMNS.map((col) => (
            <div key={col.label} className="flex flex-col items-center">
              {/* Angka: ink 68,6 pt di PDF → font-size ±4,27vw (font heading). */}
              <dt className="font-heading text-[4.27vw] leading-none font-bold">
                {col.number}
              </dt>
              {/* Label: ink 32,6 pt di PDF → font-size ±2,26vw. */}
              <dd className="mt-[-0.188vw] font-sans text-[2.26vw] leading-none font-medium">
                {col.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {/* Jarak putih antara band (1628 pt) dan gambar profil (1871 pt). */}
      <div className="h-[12.656vw]" aria-hidden />
    </section>
  );
}
