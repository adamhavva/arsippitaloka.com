import Image from "next/image";
import Link from "next/link";
import { BookOpen, FileText, Newspaper, PlayCircle } from "lucide-react";
import type { LatestItem, LatestKind } from "@/lib/latest-content";

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function KindIcon({ kind }: { kind: LatestKind }) {
  const size = 22;
  if (kind === "buku") return <BookOpen size={size} className="text-white/70" />;
  if (kind === "video") return <PlayCircle size={size} className="text-white/70" />;
  if (kind === "dokumentasi") return <FileText size={size} className="text-white/70" />;
  return <Newspaper size={size} className="text-white/70" />;
}

/**
 * Sidebar "Konten Terbaru" di halaman detail — daftar kartu kompak yang bisa
 * diklik, lintas jenis (artikel/dokumentasi/video/buku). Data dari
 * `getLatestContent`.
 */
export default function RelatedContentSidebar({
  items,
  heading = "Konten Terbaru",
}: {
  items: LatestItem[];
  heading?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4">
      <h2 className="font-heading text-base font-bold text-black">{heading}</h2>
      <ul className="mt-3 space-y-3">
        {items.map((item) => {
          const inner = (
            <>
              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[#3d2b2e]">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <KindIcon kind={item.kind} />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block rounded-full bg-maroon/10 px-2 py-0.5 text-[10px] font-medium text-maroon">
                  {item.typeLabel}
                </span>
                <p className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-neutral-900 group-hover:text-maroon">
                  {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-400">
                  {DATE_FMT.format(item.date)}
                </p>
              </div>
            </>
          );

          const className =
            "group flex gap-3 rounded-xl p-1.5 transition hover:bg-neutral-50";

          return (
            <li key={item.key}>
              {item.external ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={className}
                >
                  {inner}
                </a>
              ) : (
                <Link href={item.href} className={className}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
