import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import SocialEmbedPlayer from "@/components/social/SocialEmbedPlayer";

/**
 * Band video YouTube di halaman News & Views.
 *
 * Menampilkan postingan media sosial berplatform `youtube` yang tayang.
 * `"use cache"` + `cacheTag("content")` supaya ikut ter-invalidate saat admin
 * menyimpan konten. Kalau belum ada video YouTube, band ini tidak dirender.
 */
export default async function YoutubeBand() {
  "use cache";
  cacheTag("content");

  const posts = await prisma.socialMedia.findMany({
    where: { published: true, platform: "youtube" },
    orderBy: { createdAt: "desc" },
    take: 6,
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

  if (posts.length === 0) return null;

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
    </section>
  );
}
