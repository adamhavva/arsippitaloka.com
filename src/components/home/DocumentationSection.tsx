import Image from "next/image";
import Link from "next/link";
import { cacheTag } from "next/cache";
import { FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-settings";

const DATE_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Buang tag HTML dari rich-text lalu rapikan spasi untuk dijadikan snippet. */
function toSnippet(html: string, max = 160): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

/**
 * Daftar dokumentasi sebagai grid kartu ringkas (pola blog). Tiap kartu
 * menautkan ke halaman detailnya `/dokumentasi/<slug>`.
 */
export default async function DocumentationSection() {
  "use cache";
  cacheTag("content");
  const [docs, settings] = await Promise.all([
    prisma.documentation.findMany({
      where: { published: true },
      orderBy: { eventDate: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        lead: true,
        photoUrl: true,
        eventDate: true,
      },
    }),
    getSettings(),
  ]);

  if (docs.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
      <div className="mb-8">
        <p className="text-sm font-medium text-maroon">
          {settings["home.documentation.eyebrow"]}
        </p>
        <h2 className="font-heading mt-2 text-2xl font-bold text-black md:text-3xl">
          Dokumentasi &amp; Arsip
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => {
          let dateLabel = "";
          try {
            dateLabel = DATE_FMT.format(doc.eventDate);
          } catch {
            dateLabel = "";
          }
          return (
            <Link
              key={doc.id}
              href={`/dokumentasi/${doc.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-neutral-100 bg-white transition hover:border-neutral-300"
            >
              <div className="relative flex h-44 items-center justify-center bg-[#3d2b2e]">
                {doc.photoUrl ? (
                  <Image
                    src={doc.photoUrl}
                    alt={doc.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <FileText size={32} className="text-white/70" />
                )}
              </div>
              <div className="flex flex-1 flex-col p-4">
                {dateLabel ? (
                  <p className="text-xs text-neutral-500">{dateLabel}</p>
                ) : null}
                <h3 className="mt-1 line-clamp-2 font-semibold text-black group-hover:underline">
                  {doc.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-neutral-600">
                  {toSnippet(doc.lead)}
                </p>
                <span className="mt-auto pt-3 text-xs font-medium text-maroon">
                  Baca selengkapnya →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
