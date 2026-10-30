import Link from "next/link";
import { ExternalLink, FileText, Library, PanelsTopLeft } from "lucide-react";
import SocialEmbedPlayer, { platformLabel } from "./SocialEmbedPlayer";
import type {
  SocialBookLink,
  SocialDocLink,
  SocialPostData,
  SocialTabLink,
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
  contentTab,
  defer = true,
}: {
  post: SocialPostData;
  book?: SocialBookLink | null;
  documentation?: SocialDocLink | null;
  contentTab?: SocialTabLink | null;
  defer?: boolean;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="mx-auto w-full max-w-[420px] p-4">
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

      <div className="flex flex-1 flex-col gap-3 border-t border-neutral-100 px-4 py-4">
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

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {book ? (
            <Link
              href={
                book.tabSlug
                  ? `/buku/${book.tabSlug}/${book.slug}`
                  : `/buku/${book.slug}`
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Library size={13} /> Lihat buku
            </Link>
          ) : null}
          {documentation ? (
            <Link
              href="/news-and-views"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <FileText size={13} /> Lihat dokumentasi
            </Link>
          ) : null}
          {contentTab ? (
            <Link
              href={`/buku/${contentTab.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <PanelsTopLeft size={13} /> {contentTab.label}
            </Link>
          ) : null}
          <Link
            href={`/sosmed/${post.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-maroon-dark px-3 py-1.5 text-xs font-medium text-white hover:bg-maroon"
          >
            <ExternalLink size={13} /> Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
