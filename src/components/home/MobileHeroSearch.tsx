import SearchBar from "@/components/search/SearchBar";

/**
 * Kotak pencarian untuk layar kecil di beranda.
 *
 * Di desktop, kotak pencarian sudah tercetak di dalam gambar hero (`hero-full.jpg`)
 * dan ditumpuki `HeroSearch`. Di HP gambar itu terlalu kecil untuk diketik, jadi
 * form pencarian asli (HTML) ditampilkan tepat di bawah hero.
 */
export default function MobileHeroSearch() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:hidden">
      <SearchBar
        size="md"
        placeholder="Cari buku di Pitaloka…"
        className="w-full"
      />
    </div>
  );
}
