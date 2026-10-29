import Image from "next/image";
import type { ReactNode } from "react";

type Props = {
  image: string;
  alt: string;
  /** Lebar kolom foto dalam persen, diukur dari PDF desain (1920x1080). */
  imagePercent: number;
  /** Jarak konten dari tepi kiri panel, dalam px desain. */
  contentLeft: number;
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
  contentTop,
  children,
  topSlot,
}: Props) {
  return (
    <div className="flex min-h-screen w-full bg-white">
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

      <div className="relative min-h-screen flex-1 px-6 pb-16 lg:px-0">
        {topSlot}
        <div
          className="mx-auto w-full max-w-[704px] lg:mx-0"
          style={{
            paddingTop: `${contentTop}px`,
            marginLeft: `max(0px, min(${contentLeft}px, calc(100% - 704px)))`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
