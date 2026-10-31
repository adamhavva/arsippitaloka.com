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
    <section className="mx-auto w-full max-w-4xl px-6 py-16 md:px-10">
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
          className={`mt-4 text-sm leading-relaxed text-neutral-600 ${RICH_TEXT_CLASS}`}
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(doc.lead) }}
        />
      </div>
      <RelatedSocialMedia posts={socialMedia} />
    </section>
  );
}
