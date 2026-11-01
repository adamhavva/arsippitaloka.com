import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Library,
  PanelsTopLeft,
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
  platform,
}: {
  basePath: string;
  page?: string;
  per?: string;
  platform?: "youtube" | "tiktok" | "instagram";
}) {
  const perPage = parseMarketPer(perParam);
  const page = parsePage(pageParam);

  const settings = await getSettings();

  const where = { published: true, ...(platform ? { platform } : {}) } as const;
  const total = await prisma.socialMedia.count({ where });
  const currentPage = clampPage(page, total, perPage);

  const posts = await prisma.socialMedia.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (currentPage - 1) * perPage,
    take: perPage,
    include: {
      book: {
        select: { id: true, title: true, slug: true },
      },
      documentation: { select: { id: true, title: true } },
      article: { select: { id: true, title: true, slug: true } },
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
                bookTabSlug={post.book ? "e-book" : null}
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
  book: { id: string; title: string; slug: string } | null;
  documentation: { id: string; title: string } | null;
  article: { id: string; title: string; slug: string } | null;
};

/**
 * Satu kartu media sosial: video, judul, dan tautan ke konten terkait
 * (buku/dokumentasi/tab). Pola tombol relasi sama dengan `SocialCard`.
 */
function EngagementCard({
  post,
  bookTabSlug,
}: {
  post: EngagementPost;
  bookTabSlug: string | null;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
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

        {/* Baris aksi: semua tombol tinggi sama (h-9) dan "Detail" selalu
            menempel di kanan, sehingga kartu social terlihat rata. */}
        <div className="mt-auto flex flex-wrap items-center justify-end gap-2 pt-3">
          {post.book ? (
            <Link
              href={
                bookTabSlug
                  ? `/buku/${bookTabSlug}/${post.book.slug}`
                  : `/buku/${post.book.slug}`
              }
              className="inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Library size={13} className="shrink-0" />
              <span className="truncate">Lihat buku</span>
            </Link>
          ) : null}
          {post.documentation ? (
            <Link
              href="/news-and-views"
              className="inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <FileText size={13} className="shrink-0" />
              <span className="truncate">Lihat dokumentasi</span>
            </Link>
          ) : null}
          {post.article ? (
            <Link
              href={`/artikel/${post.article.slug}`}
              className="inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border border-neutral-300 px-3 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <PanelsTopLeft size={13} className="shrink-0" />
              <span className="truncate">{post.article.title}</span>
            </Link>
          ) : null}
          <Link
            href={`/sosmed/${post.id}`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-maroon-dark px-3 text-xs font-medium text-white hover:bg-maroon"
          >
            <ExternalLink size={13} className="shrink-0" /> Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
