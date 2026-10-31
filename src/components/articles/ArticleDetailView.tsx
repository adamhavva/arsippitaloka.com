import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { sanitizeRichText, RICH_TEXT_CLASS } from "@/lib/sanitize-html";
import ShareButtons from "@/components/books/ShareButtons";
import RelatedSocialMedia from "@/components/relations/RelatedSocialMedia";
import { getArticleRelations } from "@/lib/relations";
import { siteTabLabel } from "@/lib/site-tabs";
import type { Article } from "../../../prisma/generated/prisma/client";

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

/** Peta tipe artikel → slug kanal untuk breadcrumb. */
const TYPE_TAB: Record<string, string> = {
  "berita-terkini": "berita-terkini",
  blog: "blog",
  umkm: "umkm",
};

/** Halaman baca artikel (berita/blog/UMKM) — bebas baca, tanpa harga. */
export default async function ArticleDetailView({ article }: { article: Article }) {
  const { socialMedia } = await getArticleRelations(article.id);
  const tabSlug = TYPE_TAB[article.type] ?? "berita-terkini";
  const articlePath = `/artikel/${article.slug}`;

  return (
    <article className="mx-auto min-h-[60vh] w-full max-w-3xl px-4 py-10 md:px-6">
      <div className="flex items-center gap-2 text-xs text-neutral-500 sm:text-sm">
        <Link href="/news-and-views" className="hover:underline">
          News &amp; Views
        </Link>
        {" · "}
        <Link href={`/buku/${tabSlug}`} className="hover:underline">
          {siteTabLabel(tabSlug)}
        </Link>
      </div>

      <h1 className="font-heading mt-3 text-2xl font-bold text-black md:text-4xl">
        {article.title}
      </h1>

      {article.publishedAt ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
          <CalendarDays size={16} />
          {DATE_FMT.format(article.publishedAt)}
        </p>
      ) : null}

      {article.coverUrl ? (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100">
          <Image
            src={article.coverUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      {article.excerpt ? (
        <p className="mt-6 text-lg leading-relaxed text-neutral-700">
          {article.excerpt}
        </p>
      ) : null}

      {article.body ? (
        <div
          className={`mt-6 text-base leading-relaxed text-neutral-800 ${RICH_TEXT_CLASS}`}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(article.body) }}
        />
      ) : null}

      <div className="mt-8 border-t border-neutral-200 pt-6">
        <ShareButtons url={articlePath} title={article.title} />
      </div>

      <RelatedSocialMedia posts={socialMedia} heading="Video terkait" />
    </article>
  );
}
