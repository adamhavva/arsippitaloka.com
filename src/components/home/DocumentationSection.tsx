import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getDocumentationRelations } from "@/lib/relations";
import RelatedSocialMedia from "@/components/relations/RelatedSocialMedia";
import { getSettings } from "@/lib/site-settings";
import { sanitizeRichText, RICH_TEXT_CLASS } from "@/lib/sanitize-html";

export default async function DocumentationSection() {
  "use cache";
  cacheTag("content");
  const [doc, settings] = await Promise.all([
    prisma.documentation.findFirst({
      where: { published: true },
      orderBy: { eventDate: "desc" },
    }),
    getSettings(),
  ]);

  if (!doc) return null;
  const { socialMedia } = await getDocumentationRelations(doc.id);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16 md:px-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
        <div className="relative h-[420px] w-full overflow-hidden rounded-2xl">
          <Image
            src={doc.photoUrl}
            alt={doc.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-maroon">
            {settings["home.documentation.eyebrow"]}
          </p>
          <h2 className="font-heading mt-2 text-2xl font-bold text-black md:text-3xl">
            {doc.title}
          </h2>
          <p className="mt-4 text-sm font-semibold text-black">
            {settings["home.documentation.signature"]}
          </p>
          <div
            className={`mt-1 text-sm leading-relaxed text-neutral-600 ${RICH_TEXT_CLASS}`}
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(doc.lead) }}
          />
          <ul className="mt-6 space-y-4">
            {doc.checklist.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2
                  size={20}
                  className="shrink-0 fill-maroon-dark text-white"
                />
                <span className="text-sm font-medium text-black">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <RelatedSocialMedia posts={socialMedia} />
    </section>
  );
}
