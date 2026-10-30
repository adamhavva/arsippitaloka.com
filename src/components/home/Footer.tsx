import Image from "next/image";
import Link from "next/link";
import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site-settings";

function toList(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function Footer() {
  "use cache";
  cacheTag("content");
  const [settings, tabs] = await Promise.all([
    getSettings(),
    prisma.contentTab.findMany({ select: { id: true, label: true, slug: true } }),
  ]);

  // Tautan "Browse" diarahkan ke tab katalog yang namanya cocok.
  const slugByLabel = new Map(
    tabs.map((tab) => [tab.label.toLowerCase().replace(/[^a-z0-9]/g, ""), tab.slug]),
  );

  const browseLinks = toList(settings["footer.browse.links"]);
  const platformLinks = toList(settings["footer.platform.links"]);

  return (
    <footer className="bg-maroon-dark px-6 pt-16 pb-6 text-white md:px-10">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <Image
            src={settings["company.logoUrl"] || "/images/logo-pitaloka.png"}
            alt={settings["company.name"] || "Pitaloka"}
            width={160}
            height={60}
            className="h-9 w-auto"
          />
          <div className="mt-6 flex max-w-sm overflow-hidden rounded-full bg-white p-1.5">
            <input
              type="email"
              placeholder={settings["footer.subscribe.placeholder"]}
              className="flex-1 bg-transparent px-4 text-sm text-black outline-none placeholder:text-neutral-400"
            />
            <button className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white">
              {settings["footer.subscribe.button"]}
            </button>
          </div>
          <p className="mt-3 max-w-sm text-xs text-white/60">
            {settings["footer.subscribe.text"]}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-white/90">
            {settings["footer.browse.title"]}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-white/70">
            {browseLinks.map((l) => {
              const slug = slugByLabel.get(
                l.toLowerCase().replace(/[^a-z0-9]/g, ""),
              );
              return slug ? (
                <Link key={l} href={`/buku/${slug}`} className="hover:text-white">
                  {l}
                </Link>
              ) : (
                <span key={l}>{l}</span>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-white/90">
            {settings["footer.platform.title"]}
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-white/70">
            {platformLinks.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 w-full max-w-6xl border-t border-white/15 pt-6">
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-white/70 md:flex-row">
          <span>{settings["company.copyright"]}</span>
          <div className="flex gap-6">
            <span className="underline">{settings["footer.legal.privacy"]}</span>
            <span className="underline">{settings["footer.legal.terms"]}</span>
            <span className="underline">{settings["footer.legal.cookies"]}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
