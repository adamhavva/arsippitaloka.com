import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DocumentationDetailView from "@/components/docs/DocumentationDetailView";
import PageLoader from "@/components/PageLoader";
import Footer from "@/components/home/Footer";
import SiteHeader from "@/components/layout/SiteHeader";

export const metadata = {
  title: "Dokumentasi — Arsip Pitaloka",
};

/**
 * `/dokumentasi/<slug>` — halaman detail dokumentasi (pola blog).
 */
export default function DocumentationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<PageLoader minHeight="60vh" />}>
        <DocumentationDetailContent params={params} />
      </Suspense>
      <Footer />
    </>
  );
}

async function DocumentationDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();

  const { slug } = await params;
  const doc = await prisma.documentation.findUnique({ where: { slug } });

  if (!doc || !doc.published) notFound();

  return <DocumentationDetailView doc={doc} />;
}
