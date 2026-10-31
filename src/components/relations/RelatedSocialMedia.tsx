import Link from "next/link";
import SocialEmbedPlayer from "@/components/social/SocialEmbedPlayer";
import type { SocialPostData } from "@/components/social/types";

export default function RelatedSocialMedia({
  posts,
  heading = "Media Sosial Terkait",
}: {
  posts: SocialPostData[];
  heading?: string;
}) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-8">
      <h3 className="mb-4 text-lg font-semibold text-neutral-900">{heading}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.id} href={`/sosmed/${post.id}`} className="group block">
            <div className="overflow-hidden rounded-xl border border-neutral-200 transition-shadow group-hover:shadow-md">
              <SocialEmbedPlayer
                platform={post.platform}
                videoId={post.videoId}
                embedUrl={post.embedUrl}
                title={post.title}
                author={post.author}
                defer
                showOverlay={false}
                className="aspect-[9/16] w-full"
              />
              <div className="p-3">
                <p className="text-sm font-medium text-neutral-900 line-clamp-2">{post.title}</p>
                {post.author ? <p className="mt-1 text-xs text-neutral-500">{post.author}</p> : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
