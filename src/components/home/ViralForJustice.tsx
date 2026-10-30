import Image from "next/image";
import { getSettings } from "@/lib/site-settings";

export default async function ViralForJustice() {
  "use cache";
  const settings = await getSettings();

  const socials = [
    { label: "TikTok", href: settings["company.social.tiktok"] },
    { label: "YouTube", href: settings["company.social.youtube"] },
    { label: "Instagram", href: settings["company.social.instagram"] },
  ];

  const image = settings["home.viral.image"];

  return (
    <section className="bg-neutral-50 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 md:grid-cols-2 md:px-10">
        <div>
          <p className="text-sm font-medium text-maroon">
            {settings["home.viral.eyebrow"]}
          </p>
          <h2 className="font-heading mt-2 text-3xl font-bold text-black md:text-4xl">
            {settings["home.viral.title"]}
            <br />
            {settings["home.viral.subtitle"]}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-neutral-600">
            {settings["home.viral.body"]}
          </p>
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
          <div className="absolute left-0 top-4 h-[300px] w-[70%] -rotate-3 overflow-hidden rounded-2xl opacity-60 shadow-lg">
            <Image
              src={image}
              alt="#ViralForJustice"
              fill
              sizes="(max-width: 768px) 70vw, 320px"
              className="object-cover"
            />
          </div>
          <div className="absolute right-0 top-4 h-[300px] w-[70%] rotate-3 overflow-hidden rounded-2xl opacity-60 shadow-lg">
            <Image
              src={image}
              alt="#ViralForJustice"
              fill
              sizes="(max-width: 768px) 70vw, 320px"
              className="object-cover"
            />
          </div>
          <div className="absolute inset-x-8 top-0 h-[360px] overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={image}
              alt="#ViralForJustice"
              fill
              sizes="(max-width: 768px) 70vw, 320px"
              className="object-cover"
            />
          </div>
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
