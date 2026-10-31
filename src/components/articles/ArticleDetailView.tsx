import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { sanitizeRichText, RICH_TEXT_CLASS } from "@/lib/sanitize-html";
import ShareButtons from "@/components/books/ShareButtons";
import RelatedSocialMedia from "@/components/relations/RelatedSocialMedia";
import RelatedContentSidebar from "@/components/relations/RelatedContentSidebar";
import { getArticleRelations } from "@/lib/relations";
import { getLatestContent } from "@/lib/latest-content";
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
  const [{ socialMedia }, latest] = await Promise.all([
    getArticleRelations(article.id),
    getLatestContent({ excludeKind: "artikel", excludeId: article.id }),
  ]);
  const tabSlug = TYPE_TAB[article.type] ?? "berita-terkini";
  const articlePath = `/artikel/${article.slug}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 sm:text-sm">
            <Link href="/news-and-views" className="hover:underline">
              News &amp; Views
            </Link>
            {" · "}
            <Link href={`/buku/${tabSlug}`} className="hover:underline">
              {siteTabLabel(tabSlug)}
            </Link>
          </div>

          {/* Badge kanal */}
          <span className="mt-4 inline-block rounded-full bg-maroon/10 px-3 py-1 text-xs font-medium text-maroon">
            {siteTabLabel(tabSlug)}
          </span>

          <h1 className="font-heading mt-3 text-3xl font-bold leading-tight text-black md:text-4xl">
            {article.title}
          </h1>

          {article.publishedAt ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-neutral-500">
              <CalendarDays size={16} className="text-maroon" />
              {DATE_FMT.format(article.publishedAt)}
            </p>
          ) : null}

          {article.coverUrl ? (
            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100 shadow-sm">
              <Image
                src={article.coverUrl}
                alt={article.title}
                fill
                sizes="(max-width: 1024px) 100vw, 760px"
                className="object-cover"
                priority
              />
            </div>
          ) : null}

          {article.excerpt ? (
            <p className="mt-6 border-l-4 border-maroon/30 pl-4 text-lg leading-relaxed text-neutral-600">
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

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <RelatedContentSidebar items={latest} />
        </aside>
      </div>
    </div>
  );
}
