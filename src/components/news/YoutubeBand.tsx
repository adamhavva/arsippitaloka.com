import { Suspense } from "react";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import SocialEmbedPlayer from "@/components/social/SocialEmbedPlayer";
import { BandPagination } from "@/components/news/BeritaTerkini";
import { clampPage, parsePage, parsePerPage } from "@/lib/pagination";

/** Nama query khusus band ini — terpisah dari band Berita Terkini. */
const PAGE_PARAM = "ytPage";
const PER_PARAM = "ytPer";

type NewsSearchParams = {
  beritaPage?: string;
  beritaPer?: string;
  ytPage?: string;
  ytPer?: string;
};

/**
 * Band video YouTube di halaman News & Views.
 *
 * Menampilkan postingan media sosial berplatform `youtube` yang tayang.
 * Komponen luar (sinkron) membungkus `<Suspense>`; isi dinamis (baca
 * `searchParams` untuk pagination) dipindah ke komponen async + `connection()`.
 * Karena membaca query string, band ini TIDAK bisa `"use cache"`.
 */
export default function YoutubeBand({
  searchParams,
}: {
  searchParams: Promise<NewsSearchParams>;
}) {
  return (
    <Suspense fallback={<YoutubeBandFallback />}>
      <YoutubeBandContent searchParams={searchParams} />
    </Suspense>
  );
}

function YoutubeBandFallback() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10">
      <p className="text-sm text-neutral-500">Memuat video…</p>
    </section>
  );
}

async function YoutubeBandContent({
  searchParams,
}: {
  searchParams: Promise<NewsSearchParams>;
}) {
  await connection();

  const sp = await searchParams;
  const perPage = parsePerPage(sp.ytPer);

  const where = { published: true, platform: "youtube" } as const;
  const total = await prisma.socialMedia.count({ where });

  // Kalau belum ada video YouTube, band ini tidak dirender (seperti semula).
  if (total === 0) return null;

  const page = clampPage(parsePage(sp.ytPage), total, perPage);

  const posts = await prisma.socialMedia.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * perPage,
    take: perPage,
    select: {
      id: true,
      title: true,
      platform: true,
      videoId: true,
      embedUrl: true,
      coverUrl: true,
      caption: true,
      author: true,
    },
  });

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-12 md:px-10">
      <header className="border-b border-neutral-200 pb-4">
        <p className="text-sm font-medium text-maroon">Tonton</p>
        <h2 className="font-heading mt-1 text-2xl font-bold text-black md:text-3xl">
          Video YouTube
        </h2>
      </header>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <div key={post.id} className="min-w-0">
            <SocialEmbedPlayer
              platform={post.platform}
              videoId={post.videoId}
              embedUrl={post.embedUrl}
              title={post.title}
              author={post.author}
              caption={post.caption}
              poster={post.coverUrl}
              defer
              showOverlay={false}
            />
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-snug text-black">
              {post.title}
            </h3>
            {post.author ? (
              <p className="mt-1 text-xs text-neutral-500">oleh {post.author}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <BandPagination
          basePath="/news-and-views"
          pageParam={PAGE_PARAM}
          perParam={PER_PARAM}
          page={page}
          perPage={perPage}
          total={total}
          label="video"
          // Bawa query band Berita Terkini supaya tidak hilang saat pindah halaman.
          carry={{ beritaPage: sp.beritaPage, beritaPer: sp.beritaPer }}
        />
      </div>
    </section>
  );
}
