import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import SocialEmbedPlayer from "@/components/social/SocialEmbedPlayer";
import { SocialPlatformBadge } from "@/components/social/SocialCard";
import { BookOpen, FileText, PanelsTopLeft, ArrowLeft } from "lucide-react";
import PageLoader from "@/components/PageLoader";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  "use cache";
  const { id } = await params;
  const post = await prisma.socialMedia.findUnique({ where: { id }, select: { title: true } });
  return { title: post ? `${post.title} — Arsip Pitaloka` : "Media Sosial" };
}

async function SosmedDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connection();
  const post = await prisma.socialMedia.findUnique({
    where: { id, published: true },
    include: {
      book: { select: { id: true, title: true, slug: true, coverUrl: true, tab: { select: { slug: true, label: true } } } },
      documentation: { select: { id: true, title: true, lead: true, photoUrl: true } },
      contentTab: { select: { id: true, label: true, slug: true } },
    },
  });
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/sosmed" className="mb-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800">
        <ArrowLeft size={16} /> Kembali ke Media Sosial
      </Link>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <SocialEmbedPlayer
          platform={post.platform}
          videoId={post.videoId}
          embedUrl={post.embedUrl}
          title={post.title}
          author={post.author}
          autoPlay
          muted
          className="aspect-[9/16] max-h-[640px] w-full"
        />
      </div>

      <div className="mt-6 space-y-3">
        <SocialPlatformBadge platform={post.platform} />
        <h1 className="font-heading text-2xl font-bold text-black">{post.title}</h1>
        {post.author ? <p className="text-sm text-neutral-500">oleh {post.author}</p> : null}
        {post.caption ? <p className="mt-2 text-sm leading-relaxed text-neutral-700">{post.caption}</p> : null}
      </div>

      {(post.book || post.documentation || post.contentTab) ? (
        <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <h2 className="mb-4 text-sm font-semibold text-neutral-600">Konten Terkait</h2>
          <div className="space-y-3">
            {post.book ? (
              <Link href={`/buku/${post.book.tab?.slug ?? "e-book"}/${post.book.slug}`} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
                <BookOpen size={20} className="text-maroon" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{post.book.title}</p>
                  <p className="text-xs text-neutral-500">Buku · {post.book.tab?.label ?? "E-Book"}</p>
                </div>
              </Link>
            ) : null}
            {post.documentation ? (
              <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
                <FileText size={20} className="text-maroon" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{post.documentation.title}</p>
                  <p className="text-xs text-neutral-500">Dokumentasi</p>
                </div>
              </div>
            ) : null}
            {post.contentTab ? (
              <Link href={`/buku/${post.contentTab.slug}`} className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm hover:shadow-md transition-shadow">
                <PanelsTopLeft size={20} className="text-maroon" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">{post.contentTab.label}</p>
                  <p className="text-xs text-neutral-500">Tab Konten</p>
                </div>
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SosmedDetailPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Suspense fallback={<PageLoader />}>
        <SosmedDetail params={params} />
      </Suspense>
    </div>
  );
}
