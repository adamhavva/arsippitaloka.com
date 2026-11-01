import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  image: string;
  alt: string;
  /** Lebar kolom foto dalam persen, diukur dari PDF desain (1920x1080). */
  imagePercent: number;
  /** Jarak konten dari tepi kiri panel, dalam px desain. */
  contentLeft: number;
  /** Jarak konten dari tepi kanan panel, dalam px desain. */
  contentRight: number;
  /** Jarak elemen pertama dari atas panel, dalam px desain. */
  contentTop: number;
  children: ReactNode;
  /** Elemen yang ditempel di bagian atas panel, mis. indikator langkah. */
  topSlot?: ReactNode;
};

export default function AuthShell({
  image,
  alt,
  imagePercent,
  contentLeft,
  contentRight,
  contentTop,
  children,
  topSlot,
}: Props) {
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Foto dekoratif kolom kiri — tampil hanya pada layar besar. */}
      <div
        className="relative hidden shrink-0 lg:block"
        style={{ width: `${imagePercent}%` }}
      >
        <Image
          src={image}
          alt={alt}
          fill
          sizes="55vw"
          priority
          className="object-cover"
        />
      </div>

      {/* Panel konten autentikasi — full-width di mobile, adaptif di desktop. */}
      <div
        className="relative min-h-[92vh] flex-1 px-4 pb-12 pt-8 sm:min-h-screen sm:px-6 md:pt-10 lg:pt-0"
        style={{
          paddingLeft: `min(${contentLeft}px, 6vw)`,
          paddingRight: `min(${contentRight}px, 6vw)`,
        }}
      >
        {topSlot}
        <div className="w-full max-w-md mx-auto sm:max-w-xl lg:max-w-none lg:max-w-[704px]">
          {/* Offset vertikal mengikuti koordinat PDF di desktop; di mobile
             koordinat itu terlalu jauh ke bawah, jadi dipakai jarak kecil saja. */}
          <div
            className="auth-content-offset"
            style={{ "--auth-content-top": `${contentTop}px` } as React.CSSProperties}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
