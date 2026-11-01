import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleDetailView from "@/components/articles/ArticleDetailView";
import PageLoader from "@/components/PageLoader";
import Footer from "@/components/home/Footer";
import SiteHeader from "@/components/layout/SiteHeader";

export const metadata = {
  title: "Artikel — Arsip Pitaloka",
};

/**
 * `/artikel/<slug>` — halaman baca artikel (berita/blog/UMKM), pola blog.
 */
export default function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<PageLoader minHeight="60vh" />}>
        <ArticleDetailContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

async function ArticleDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();

  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article || !article.published) notFound();

  return <ArticleDetailView article={article} />;
}
