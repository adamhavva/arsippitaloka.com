import Image from "next/image";
import Link from "next/link";
import { Calendar, Check } from "lucide-react";
import { getDocumentationRelations } from "@/lib/relations";
import RelatedSocialMedia from "@/components/relations/RelatedSocialMedia";
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
  const { socialMedia } = await getDocumentationRelations(doc.id);
  const docPath = `/dokumentasi/${doc.slug}`;

  let eventLabel = "";
  try {
    eventLabel = DATE_FMT.format(doc.eventDate);
  } catch {
    eventLabel = "";
  }

  return (
    <article className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 md:py-10">
      <div className="flex items-center gap-2 text-xs text-neutral-500 sm:text-sm">
        <Link href="/news-and-views" className="hover:underline">
          News &amp; Views
        </Link>
        {" · "}
        <span>Dokumentasi</span>
      </div>

      <h1 className="font-heading mt-2 text-2xl font-bold text-black md:text-3xl">
        {doc.title}
      </h1>

      {eventLabel ? (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-neutral-500">
          <Calendar size={15} /> {eventLabel}
        </p>
      ) : null}

      {doc.photoUrl ? (
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-xl bg-[#3d2b2e]">
          <Image
            src={doc.photoUrl}
            alt={doc.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div
        className={`mt-6 text-sm leading-relaxed text-neutral-700 ${RICH_TEXT_CLASS}`}
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

      <div className="mt-6">
        <ShareButtons url={docPath} title={doc.title} />
      </div>

      <RelatedSocialMedia posts={socialMedia} />
    </article>
  );
}
