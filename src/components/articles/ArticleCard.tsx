import Image from "next/image";
import Link from "next/link";
import { FileText, CalendarDays } from "lucide-react";
import type { Article } from "../../../prisma/generated/prisma/client";

/** Data minimum untuk kartu artikel. */
export type ArticleCardData = Pick<
  Article,
  "id" | "slug" | "title" | "excerpt" | "coverUrl" | "type" | "publishedAt"
>;

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

/** Kartu artikel (berita / blog / UMKM) — tanpa harga, tanpa keranjang. */
export default function ArticleCard({ article }: { article: ArticleCardData }) {
  const href = `/artikel/${article.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:border-maroon/40 hover:shadow-sm">
      <Link
        href={href}
        className="relative block aspect-[16/9] overflow-hidden bg-neutral-100"
        aria-label={article.title}
      >
        {article.coverUrl ? (
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-neutral-300">
            <FileText size={40} />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {article.publishedAt ? (
          <p className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <CalendarDays size={12} />
            {DATE_FMT.format(article.publishedAt)}
          </p>
        ) : null}

        <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-neutral-900">
          <Link href={href} className="hover:text-maroon">
            {article.title}
          </Link>
        </h3>

        {article.excerpt ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-600">
            {article.excerpt}
          </p>
        ) : null}

        <Link
          href={href}
          className="mt-auto flex h-9 items-center justify-center rounded-full border border-neutral-300 px-4 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 hover:text-maroon active:scale-95"
        >
          Baca selengkapnya →
        </Link>
      </div>
    </article>
  );
}
