import Link from "next/link";
import {
  Bookmark,
  ExternalLink,
  FileText,
  Heart,
  Library,
  MessageCircle,
  PanelsTopLeft,
  Plus,
  UserRound,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-settings";
import { clampPage, parsePage } from "@/lib/pagination";
import MarketPagination from "@/components/books/marketplace/MarketPagination";
import { parseMarketPer } from "@/components/books/marketplace/market-utils";
import SocialEmbedPlayer from "./SocialEmbedPlayer";
import { SocialPlatformBadge } from "./SocialCard";

/**
 * Katalog media sosial di `/buku/kategori/social-media`.
 *
 * Mengganti tampilan katalog buku khusus untuk kategori "social-media":
 * grid kartu video (TikTok/YouTube/Instagram) dengan UI engagement
 * (suka/komentar/simpan) dan tautan ke konten terkait (buku, dokumentasi,
 * tab konten). Teks judul/subjudul diambil dari SiteSetting supaya bisa
 * diubah dari `/admin/profile` (grup "Media Sosial").
 *
 * CATATAN: membaca `page`/`per` dari URL, jadi komponen ini TIDAK memakai
 * `"use cache"`. Ia dirender di dalam boundary `<Suspense>` + `connection()`
 * milik halaman kategori. Paginasi server-side (skip/take + count).
 */
export default async function SocialMediaCatalog({
  basePath,
  page: pageParam,
  per: perParam,
}: {
  basePath: string;
  page?: string;
  per?: string;
}) {
  const perPage = parseMarketPer(perParam);
  const page = parsePage(pageParam);

  const settings = await getSettings();

  const where = { published: true } as const;
  const total = await prisma.socialMedia.count({ where });
  const currentPage = clampPage(page, total, perPage);

  const posts = await prisma.socialMedia.findMany({
    where,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    skip: (currentPage - 1) * perPage,
    take: perPage,
    include: {
      book: {
        select: { id: true, title: true, slug: true, tab: { select: { slug: true } } },
      },
      documentation: { select: { id: true, title: true } },
      contentTab: { select: { id: true, label: true, slug: true } },
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <header className="border-b border-neutral-200 pb-5">
        <p className="text-sm font-medium text-maroon">
          {settings["social.catalog.eyebrow"]}
        </p>
        <h1 className="font-heading mt-1 text-2xl font-bold text-black md:text-3xl">
          {settings["social.catalog.title"]}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          {settings["social.catalog.subtitle"]}
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          {total} konten media sosial.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="py-20 text-center text-neutral-500">
          Belum ada postingan media sosial.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <EngagementCard
                key={post.id}
                post={post}
                bookTabSlug={post.book?.tab?.slug ?? null}
              />
            ))}
          </div>

          <div className="mt-8">
            <MarketPagination
              basePath={basePath}
              page={currentPage}
              perPage={perPage}
              total={total}
              params={{ per: String(perPage) }}
              label="konten"
            />
          </div>
        </>
      )}
    </div>
  );
}

type EngagementPost = {
  id: string;
  title: string;
  platform: string;
  videoId: string;
  embedUrl: string | null;
  coverUrl: string | null;
  caption: string | null;
  author: string | null;
  likeCount: number | null;
  commentCount: number | null;
  bookmarkCount: number | null;
  book: { id: string; title: string; slug: string } | null;
  documentation: { id: string; title: string } | null;
  contentTab: { id: string; label: string; slug: string } | null;
};

function formatCount(value: number | null | undefined): string {
  if (value == null) return "0";
  return new Intl.NumberFormat("id-ID").format(value);
}

/** Rel engagement ala TikTok/Instagram: avatar+follow, suka, komentar, simpan. */
function EngagementRail({
  likeCount,
  commentCount,
  bookmarkCount,
}: {
  likeCount: number | null;
  commentCount: number | null;
  bookmarkCount: number | null;
}) {
  return (
    <div className="pointer-events-none absolute bottom-3 right-2 z-10 flex flex-col items-center gap-3 text-white">
      <div className="relative">
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-neutral-700">
          <UserRound size={18} />
        </span>
        <span className="absolute -bottom-1.5 left-1/2 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full bg-maroon text-white">
          <Plus size={11} strokeWidth={3} />
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Heart size={22} fill="white" />
        <span className="text-[11px] font-semibold drop-shadow">
          {formatCount(likeCount)}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <MessageCircle size={22} fill="white" />
        <span className="text-[11px] font-semibold drop-shadow">
          {formatCount(commentCount)}
        </span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <Bookmark size={22} fill="white" />
        <span className="text-[11px] font-semibold drop-shadow">
          {formatCount(bookmarkCount)}
        </span>
      </div>
    </div>
  );
}

/**
 * Satu kartu media sosial: video + rail engagement, judul, dan tautan ke
 * konten terkait (buku/dokumentasi/tab). Pola tombol relasi sama dengan
 * `SocialCard`.
 */
function EngagementCard({
  post,
  bookTabSlug,
}: {
  post: EngagementPost;
  bookTabSlug: string | null;
}) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="relative mx-auto w-full max-w-[420px] p-4">
        <SocialEmbedPlayer
          platform={post.platform}
          videoId={post.videoId}
          embedUrl={post.embedUrl}
          title={post.title}
          author={post.author}
          poster={post.coverUrl}
          defer
          showOverlay={false}
        />
        <EngagementRail
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          bookmarkCount={post.bookmarkCount}
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-neutral-100 px-4 py-4">
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

        {post.caption ? (
          <p className="line-clamp-3 text-xs leading-relaxed text-neutral-600">
            {post.caption}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {post.book ? (
            <Link
              href={
                bookTabSlug
                  ? `/buku/${bookTabSlug}/${post.book.slug}`
                  : `/buku/${post.book.slug}`
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Library size={13} /> Lihat buku
            </Link>
          ) : null}
          {post.documentation ? (
            <Link
              href="/news-and-views"
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <FileText size={13} /> Lihat dokumentasi
            </Link>
          ) : null}
          {post.contentTab ? (
            <Link
              href={`/buku/${post.contentTab.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <PanelsTopLeft size={13} /> {post.contentTab.label}
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
