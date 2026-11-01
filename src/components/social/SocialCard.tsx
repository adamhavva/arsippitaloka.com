import Link from "next/link";
import { ExternalLink, FileText, Library, PanelsTopLeft } from "lucide-react";
import { platformLabel } from "@/lib/social";
import SocialEmbedPlayer from "./SocialEmbedPlayer";
import type {
  SocialBookLink,
  SocialDocLink,
  SocialPostData,
  SocialArticleLink,
} from "./types";

/** Badge kecil penanda platform (TikTok / YouTube / Instagram). */
export function SocialPlatformBadge({
  platform,
  className = "",
}: {
  platform: string;
  className?: string;
}) {
  const styles: Record<string, string> = {
    tiktok: "bg-neutral-900 text-white",
    youtube: "bg-red-600 text-white",
    instagram: "bg-gradient-to-r from-amber-500 to-pink-600 text-white",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
        styles[platform] ?? "bg-neutral-200 text-neutral-700"
      } ${className}`}
    >
      {platformLabel(platform)}
    </span>
  );
}

/**
 * Kartu satu postingan media sosial: badge platform, judul, player (atau
 * poster + tombol play), dan tautan ke konten terkait.
 */
export default function SocialCard({
  post,
  book,
  documentation,
  article,
  defer = true,
}: {
  post: SocialPostData;
  book?: SocialBookLink | null;
  documentation?: SocialDocLink | null;
  article?: SocialArticleLink | null;
  defer?: boolean;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="mx-auto w-full max-w-[420px] p-3 sm:p-4">
        <SocialEmbedPlayer
          platform={post.platform}
          videoId={post.videoId}
          embedUrl={post.embedUrl}
          title={post.title}
          author={post.author}
          caption={post.caption}
          poster={post.coverUrl}
          defer={defer}
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 border-t border-neutral-100 px-3 py-3 sm:gap-3 sm:px-4 sm:py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <SocialPlatformBadge platform={post.platform} />
            <h3 className="mt-2 text-sm font-semibold leading-snug text-black">
              <Link href={`/sosmed/${post.id}`} className="hover:underline">
                {post.title}
              </Link>
            </h3>
            {post.author ? (
              <p className="mt-1 text-xs text-neutral-500">oleh {post.author}</p>
            ) : null}
          </div>
        </div>

        {post.caption ? (
          <p className="line-clamp-3 text-xs leading-relaxed text-neutral-600">
            {post.caption}
          </p>
        ) : null}

        {/* Baris aksi: semua tombol tinggi sama (h-9) dan "Detail" selalu
            menempel di kanan, sehingga kartu social terlihat rata. */}
        <div className="mt-auto flex flex-wrap items-center justify-end gap-2 pt-3">
          {book ? (
            <Link
              href={
                book.tabSlug
                  ? `/buku/${book.tabSlug}/${book.slug}`
                  : `/buku/${book.slug}`
              }
              className="inline-flex h-9 max-w-full items-center gap-1 rounded-full border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50 active:scale-95"
            >
              <Library size={14} className="shrink-0" />
              <span className="truncate">Lihat buku</span>
            </Link>
          ) : null}
          {documentation ? (
            <Link
              href="/news-and-views"
              className="inline-flex h-9 max-w-full items-center gap-1 rounded-full border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50 active:scale-95"
            >
              <FileText size={14} className="shrink-0" />
              <span className="truncate">Lihat dokumentasi</span>
            </Link>
          ) : null}
          {article ? (
            <Link
              href={`/artikel/${article.slug}`}
              className="inline-flex h-9 max-w-full items-center gap-1 rounded-full border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50 active:scale-95"
            >
              <PanelsTopLeft size={14} className="shrink-0" />
              <span className="truncate">{article.title}</span>
            </Link>
          ) : null}
          <Link
            href={`/sosmed/${post.id}`}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-maroon-dark px-3 text-xs font-medium text-white hover:bg-maroon active:scale-95"
          >
            <ExternalLink size={14} className="shrink-0" /> Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
