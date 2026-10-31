import Image from "next/image";
import OverlayLinks, { type Zone } from "./OverlayLinks";
import NavAuthChip from "./NavAuthChip";
import CartNavButton from "@/components/cart/CartNavButton";

/**
 * Aset hasil konversi `references/layouts/split` dirender pada lebar
 * 2400 px untuk kanvas PDF 1920 pt, jadi 1 px = 0,8 pt (1,25 px/pt).
 */
const PX_PER_PT = 1.25;

/**
 * Menampilkan potongan PDF sebagai gambar selebar halaman, dengan zona
 * tautan transparan di atasnya (navbar, tombol, teks yang bisa diklik).
 *
 * Semua koordinat zona memakai satuan pt kanvas PDF; komponen mengonversi
 * sendiri ke persen relatif terhadap potongan gambar yang dipakai.
 */
export default function PdfHero({
  src,
  alt,
  heightPx,
  widthPx = 2400,
  originY = 0,
  zones = [],
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  /** Tinggi aset dalam px (lebar default 2400 px = 1920 pt). */
  heightPx: number;
  widthPx?: number;
  /** Koordinat pt y di mana potongan ini mulai di kanvas PDF. */
  originY?: number;
  zones?: Zone[];
  priority?: boolean;
  className?: string;
}) {
  const originHeight = heightPx / PX_PER_PT;

  // Chip akun menimpa "Sign In / Join Us" saat login. Posisinya dihitung dari
  // zona navbar supaya ikut benar di tiap potongan PDF (originY/tinggi beda).
  const signIn = zones.find((z) => z.label === "Sign In");
  const joinUs = zones.find((z) => z.label === "Join Us");
  const authEnd = joinUs ?? signIn;
  const authChipStyle =
    signIn && authEnd
      ? {
          top: `${((signIn.y - originY) / originHeight) * 100}%`,
          right: `${((1920 - (authEnd.x + authEnd.w)) / 1920) * 100}%`,
          height: `${(signIn.h / originHeight) * 100}%`,
        }
      : null;

  // Ikon tas belanja tercetak di gambar tepat setelah "Join Us" (~1715 pt pada
  // kanvas 1920 pt). Zona tautan + badge keranjang dipasang di atasnya, sejajar
  // baris navbar (y/tinggi mengikuti "Sign In").
  const cartStyle = signIn
    ? {
        top: `${((signIn.y - originY) / originHeight) * 100}%`,
        left: `${(1715 / 1920) * 100}%`,
        width: `${(46 / 1920) * 100}%`,
        height: `${(signIn.h / originHeight) * 100}%`,
      }
    : null;

  return (
    <section className={`relative w-full ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={widthPx}
        height={heightPx}
        priority={priority}
        sizes="100vw"
        className="h-auto w-full"
      />
      {zones.length > 0 ? (
        <div className="absolute inset-0">
          <OverlayLinks
            zones={zones}
            originY={originY}
            originWidth={1920}
            originHeight={originHeight}
          />
          {authChipStyle ? <NavAuthChip style={authChipStyle} /> : null}
          {cartStyle ? <CartNavButton style={cartStyle} /> : null}
        </div>
      ) : null}
    </section>
  );
}
