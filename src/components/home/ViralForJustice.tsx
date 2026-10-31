import Image from "next/image";
import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-settings";
import { tiktokEmbedUrl, tiktokVideoUrl } from "@/lib/tiktok";
import { sanitizeRichText, RICH_TEXT_CLASS } from "@/lib/sanitize-html";

/**
 * Slot kartu miring pada section #ViralForJustice (sesuai desain PDF).
 */
const SLOTS = [
  {
    className:
      "absolute left-0 top-4 h-[300px] w-[70%] -rotate-3 overflow-hidden rounded-2xl opacity-60 shadow-lg",
  },
  {
    className:
      "absolute right-0 top-4 h-[300px] w-[70%] rotate-3 overflow-hidden rounded-2xl opacity-60 shadow-lg",
  },
  {
    className:
      "absolute inset-x-8 top-0 h-[360px] overflow-hidden rounded-2xl shadow-xl",
  },
] as const;

export default async function ViralForJustice() {
  "use cache";
  cacheTag("content");

  const [settings, posts] = await Promise.all([
    getSettings(),
    prisma.tiktokPost.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 3,
      select: { id: true, videoId: true, title: true, author: true },
    }),
  ]);

  const socials = [
    { label: "TikTok", href: settings["company.social.tiktok"] },
    { label: "YouTube", href: settings["company.social.youtube"] },
    { label: "Instagram", href: settings["company.social.instagram"] },
  ];

  const image = settings["home.viral.image"];

  return (
    <section className="bg-neutral-50 py-16">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:px-10">
        <div>
          <p className="text-sm font-medium text-maroon">
            {settings["home.viral.eyebrow"]}
          </p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-black md:text-4xl">
            {settings["home.viral.title"]}
            <br />
            {settings["home.viral.subtitle"]}
          </h2>
          <div
            className={`mt-5 text-sm leading-relaxed text-neutral-600 ${RICH_TEXT_CLASS}`}
            dangerouslySetInnerHTML={{
              __html: sanitizeRichText(settings["home.viral.body"]),
            }}
          />
          <div className="mt-6 flex items-center gap-4 text-sm font-medium text-black">
            {socials.map((social) =>
              social.href ? (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {social.label}
                </a>
              ) : (
                <span key={social.label}>{social.label}</span>
              ),
            )}
          </div>

        </div>

        <div className="relative mx-auto h-[360px] w-full max-w-sm">
          {SLOTS.map((slot, index) => {
            const post = posts[index];

            return (
              <div key={slot.className} className={slot.className}>
                {post ? (
                  <>
                    <iframe
                      src={tiktokEmbedUrl(post.videoId)}
                      title={post.title}
                      className="h-full w-full border-0"
                      loading="lazy"
                      allow="encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                    <a
                      href={tiktokVideoUrl(post.videoId)}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-black/80 to-transparent px-3 pt-6 pb-2 text-xs font-medium text-white"
                    >
                      <span className="line-clamp-2">{post.title}</span>
                      {post.author ? (
                        <span className="block text-[10px] text-white/70">
                          {post.author}
                        </span>
                      ) : null}
                    </a>
                  </>
                ) : (
                  <Image
                    src={image}
                    alt="#ViralForJustice"
                    fill
                    sizes="(max-width: 768px) 70vw, 320px"
                    className="object-cover"
                  />
                )}
              </div>
            );
          })}
          <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
            <span className="h-1.5 w-4 rounded-full bg-maroon-dark" />
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
          </div>
        </div>
      </div>
    </section>
  );
}
