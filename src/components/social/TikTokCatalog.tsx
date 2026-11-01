import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { clampPage, parsePage } from "@/lib/pagination";
import MarketPagination from "@/components/books/marketplace/MarketPagination";
import { parseMarketPer } from "@/components/books/marketplace/market-utils";
import SocialEmbedPlayer from "./SocialEmbedPlayer";

/**
 * Katalog curate TikTok di `/buku/kategori/viral-for-justice`.
 *
 * Kategori "#ViralForJustice" menampilkan kumpulan Posting TikTok
 * (tabel `TiktokPost`) yang sama dipakai di section #ViralForJustice di
 * beranda — jadi kategori ini tidak menampilkan katalog buku, melainkan
 * grid video TikTok.
 *
 * CATATAN: membaca `page`/`per` dari URL, jadi komponen ini tidak memakai
 * `"use cache"`. Paginasi server-side (skip/take + count).
 */
export default async function TikTokCatalog({
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

  const where = { published: true } as const;
  const total = await prisma.tiktokPost.count({ where });
  const currentPage = clampPage(page, total, perPage);

  const posts = await prisma.tiktokPost.findMany({
    where,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    skip: (currentPage - 1) * perPage,
    take: perPage,
    select: {
      id: true,
      videoId: true,
      embedUrl: true,
      title: true,
      caption: true,
      author: true,
    },
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
      <header className="border-b border-neutral-200 pb-5">
        <p className="text-sm font-medium text-maroon">Koleksi</p>
        <h1 className="font-heading mt-1 text-2xl font-bold text-black md:text-3xl">
          #ViralForJustice
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          Postingan TikTok pilihan — bagian dari gerakan Indonesia Bebas
          Korupsi dan Viral For Justice.
        </p>
        <p className="mt-2 text-sm text-neutral-500">
          {total} video TikTok.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="py-20 text-center text-neutral-500">
          Belum ada Posting TikTok. Tambahkan lewat /admin/tiktok.
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white"
              >
                <div className="relative mx-auto w-full max-w-[420px] p-4">
                  <SocialEmbedPlayer
                    platform="tiktok"
                    videoId={post.videoId}
                    embedUrl={post.embedUrl}
                    title={post.title}
                    author={post.author}
                    defer
                    showOverlay={false}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2 border-t border-neutral-100 px-4 py-4">
                  <h2 className="text-sm font-semibold leading-snug text-black">
                    {post.title}
                  </h2>
                  {post.caption ? (
                    <p className="line-clamp-3 text-xs leading-relaxed text-neutral-600">
                      {post.caption}
                    </p>
                  ) : null}
                  <div className="mt-auto pt-3">
                    <Link
                      href={`https://www.tiktok.com/@i/video/${post.videoId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-maroon-dark px-3 text-xs font-medium text-white hover:bg-maroon"
                    >
                      <ExternalLink size={13} /> Lihat di TikTok
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <MarketPagination
              basePath={basePath}
              page={currentPage}
              perPage={perPage}
              total={total}
              params={{ per: String(perPage) }}
              label="video"
            />
          </div>
        </>
      )}
    </div>
  );
}
