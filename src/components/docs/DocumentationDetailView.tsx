import Image from "next/image";
import Link from "next/link";
import { Calendar, Check } from "lucide-react";
import { getDocumentationRelations } from "@/lib/relations";
import { getLatestContent } from "@/lib/latest-content";
import RelatedSocialMedia from "@/components/relations/RelatedSocialMedia";
import RelatedContentSidebar from "@/components/relations/RelatedContentSidebar";
import ShareButtons from "@/components/books/ShareButtons";
import { sanitizeRichText, RICH_TEXT_CLASS } from "@/lib/sanitize-html";
import type { Documentation } from "../../../prisma/generated/prisma/client";

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Halaman detail satu dokumentasi (pola blog).
 * URL: `/dokumentasi/<slug>`.
 */
export default async function DocumentationDetailView({
  doc,
}: {
  doc: Documentation;
}) {
  const [{ socialMedia }, latest] = await Promise.all([
    getDocumentationRelations(doc.id),
    getLatestContent({ excludeKind: "dokumentasi", excludeId: doc.id }),
  ]);
  const docPath = `/dokumentasi/${doc.slug}`;

  let eventLabel = "";
  try {
    eventLabel = DATE_FMT.format(doc.eventDate);
  } catch {
    eventLabel = "";
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-neutral-500 sm:text-sm">
            <Link href="/news-and-views" className="hover:underline">
              News &amp; Views
            </Link>
            {" · "}
            <span>Dokumentasi</span>
          </div>

          <span className="mt-4 inline-block rounded-full bg-maroon/10 px-3 py-1 text-xs font-medium text-maroon">
            Dokumentasi
          </span>

          <h1 className="font-heading mt-3 text-3xl font-bold leading-tight text-black md:text-4xl">
            {doc.title}
          </h1>

          {eventLabel ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-neutral-500">
              <Calendar size={15} className="text-maroon" /> {eventLabel}
            </p>
          ) : null}

          {doc.photoUrl ? (
            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#3d2b2e] shadow-sm">
              <Image
                src={doc.photoUrl}
                alt={doc.title}
                fill
                sizes="(max-width: 1024px) 100vw, 760px"
                className="object-cover"
              />
            </div>
          ) : null}

          <div
            className={`mt-6 text-base leading-relaxed text-neutral-700 ${RICH_TEXT_CLASS}`}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(doc.lead) }}
          />

          {doc.checklist.length > 0 ? (
            <ul className="mt-6 space-y-2">
              {doc.checklist.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-neutral-800">
                  <Check size={16} className="mt-0.5 shrink-0 text-maroon" />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-8 border-t border-neutral-200 pt-6">
            <ShareButtons url={docPath} title={doc.title} />
          </div>

          <RelatedSocialMedia posts={socialMedia} />
        </article>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <RelatedContentSidebar items={latest} />
        </aside>
      </div>
    </div>
  );
}
