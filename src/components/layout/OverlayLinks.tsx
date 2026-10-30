import Link from "next/link";

export type Zone = {
  /** Label untuk aria-label & tooltip. */
  label: string;
  href: string;
  /** Koordinat dalam satuan "pt" kanvas PDF (1920 pt lebar). */
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Zona tautan transparan di atas render PDF.
 *
 * Semua halaman design di `references/layouts/split` memakai kanvas 1920 pt
 * lebar. Koordinat PDF (dari `pdftotext -bbox-layout`) dipakai langsung,
 * lalu dikonversi ke persen relatif terhadap potongan gambar yang dipakai.
 *
 * @param originY  koordinat pt y di mana potongan gambar mulai
 * @param originHeight tinggi potongan gambar dalam pt
 */
export default function OverlayLinks({
  zones,
  originX = 0,
  originY = 0,
  originWidth = 1920,
  originHeight,
}: {
  zones: Zone[];
  originX?: number;
  originY?: number;
  originWidth?: number;
  originHeight: number;
}) {
  return (
    <>
      {zones.map((z) => (
        <Link
          key={`${z.label}-${z.x}`}
          href={z.href}
          aria-label={z.label}
          title={z.label}
          className="absolute block"
          style={{
            left: `${((z.x - originX) / originWidth) * 100}%`,
            top: `${((z.y - originY) / originHeight) * 100}%`,
            width: `${(z.w / originWidth) * 100}%`,
            height: `${(z.h / originHeight) * 100}%`,
          }}
        />
      ))}
    </>
  );
}
