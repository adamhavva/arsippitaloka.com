import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SocialCard from "@/components/social/SocialCard";
import type { SocialPostData } from "@/components/social/types";

export const metadata: Metadata = { title: "Media Sosial — Arsip Pitaloka" };

async function SosmedList() {
  await connection();
  const posts = await prisma.socialMedia.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      book: { select: { id: true, title: true, slug: true, tab: { select: { slug: true } } } },
      documentation: { select: { id: true, title: true } },
      contentTab: { select: { id: true, label: true, slug: true } },
    },
  });

  if (posts.length === 0) {
    return <p className="py-20 text-center text-neutral-500">Belum ada postingan media sosial.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p) => {
        const post: SocialPostData = {
          id: p.id, title: p.title, platform: p.platform, videoId: p.videoId,
          embedUrl: p.embedUrl, coverUrl: p.coverUrl, caption: p.caption, author: p.author,
        };
        const bookLink = p.book ? { id: p.book.id, title: p.book.title, slug: p.book.slug, tabSlug: p.book.tab?.slug ?? null } : undefined;
        const docLink = p.documentation ? { id: p.documentation.id, title: p.documentation.title } : undefined;
        const tabLink = p.contentTab ? { id: p.contentTab.id, label: p.contentTab.label, slug: p.contentTab.slug } : undefined;
        return <SocialCard key={p.id} post={post} book={bookLink} documentation={docLink} contentTab={tabLink} />;
      })}
    </div>
  );
}

export default function SosmedPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="mb-6 font-heading text-2xl font-bold text-black sm:mb-8 sm:text-3xl">Media Sosial</h1>
      <Suspense fallback={<p className="py-20 text-center text-neutral-400">Memuat…</p>}>
        <SosmedList />
      </Suspense>
    </div>
  );
}
