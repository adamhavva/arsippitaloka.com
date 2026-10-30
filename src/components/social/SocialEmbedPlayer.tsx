"use client";

import { useState } from "react";
import Image from "next/image";
import { PlayCircle, VideoOff } from "lucide-react";
import {
  SOCIAL_IFRAME_ALLOW,
  resolveEmbedUrl,
  resolveVideoUrl,
  type SocialPlatform,
} from "@/lib/social";

export type SocialEmbedPlayerProps = {
  platform: string;
  videoId: string;
  embedUrl?: string | null;
  title: string;
  author?: string | null;
  caption?: string | null;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  poster?: string | null;
  /** Tampilkan poster dulu; iframe baru dimuat setelah tombol play ditekan. */
  defer?: boolean;
  /** Sembunyikan overlay judul/author di atas player. */
  showOverlay?: boolean;
};

/**
 * Tambahkan parameter autoplay/muted ke URL embed sesuai platformnya.
 * - TikTok: `autoplay=1&muted=1` (dipakai player/v1)
 * - YouTube: `autoplay=1&mute=1`
 * - Instagram: tidak mendukung keduanya.
 */
function withPlaybackFlags(
  url: string,
  platform: SocialPlatform,
  autoPlay: boolean,
  muted: boolean,
): string {
  try {
    const parsed = new URL(url);
    if (platform === "tiktok") {
      if (autoPlay) parsed.searchParams.set("autoplay", "1");
      if (muted) parsed.searchParams.set("muted", "1");
    } else if (platform === "youtube") {
      if (autoPlay) parsed.searchParams.set("autoplay", "1");
      if (muted) parsed.searchParams.set("mute", "1");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Rasio aspek: TikTok & Instagram vertikal, YouTube horizontal. */
function aspectClass(platform: SocialPlatform): string {
  return platform === "youtube" ? "aspect-video" : "aspect-[9/16]";
}

const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  youtube: "YouTube",
  instagram: "Instagram",
};

export function platformLabel(platform: string): string {
  return PLATFORM_LABEL[platform] ?? platform;
}

/**
 * Pemutar media sosial (TikTok / YouTube / Instagram).
 *
 * Iframe dimuat langsung dari pemutar resmi platform. Untuk TikTok dipakai
 * `player/v1` (bukan `embed/v2`) supaya parameter autoplay/muted benar-benar
 * diterima. Iframe sengaja TIDAK diberi atribut `sandbox` — `sandbox`
 * memblokir playback otomatis.
 */
export default function SocialEmbedPlayer({
  platform,
  videoId,
  embedUrl,
  title,
  author,
  caption,
  className,
  autoPlay = true,
  muted = true,
  poster,
  defer = false,
  showOverlay = true,
}: SocialEmbedPlayerProps) {
  const [started, setStarted] = useState(!defer);

  const normalized = (platform || "tiktok") as SocialPlatform;
  const baseUrl = resolveEmbedUrl({
    platform: normalized,
    videoId: videoId ?? "",
    embedUrl: embedUrl ?? null,
  });
  const src = baseUrl
    ? withPlaybackFlags(baseUrl, normalized, autoPlay, muted)
    : null;
  const videoUrl = resolveVideoUrl({
    platform: normalized,
    videoId: videoId ?? "",
  });

  const frameClass = `relative w-full overflow-hidden rounded-xl bg-black ${aspectClass(
    normalized,
  )} ${className ?? ""}`;

  // Tidak ada sumber video → tampilkan fallback yang rapi, bukan iframe rusak.
  if (!src) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center ${aspectClass(
          normalized,
        )}`}
      >
        <VideoOff size={28} className="text-neutral-400" />
        <p className="text-sm font-medium text-neutral-700">
          Video belum tersedia
        </p>
        <p className="max-w-xs text-xs text-neutral-500">
          Tautan videonya belum diisi atau formatnya belum dikenali.
        </p>
      </div>
    );
  }

  return (
    <figure className="space-y-2">
      <div className={frameClass}>
        {started ? (
          <iframe
            src={src}
            title={title}
            className="absolute inset-0 h-full w-full border-0"
            allow={SOCIAL_IFRAME_ALLOW}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <button
            type="button"
            onClick={() => setStarted(true)}
            className="absolute inset-0 flex items-center justify-center bg-neutral-900/40"
          >
            {poster ? (
              <Image
                src={poster}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 420px"
                className="object-cover opacity-80"
              />
            ) : null}
            <span className="relative z-10 flex flex-col items-center gap-2 text-white">
              <PlayCircle size={48} className="opacity-90" />
              <span className="text-xs font-medium">Putar video</span>
            </span>
          </button>
        )}

        {showOverlay ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0">
            {videoUrl ? (
              <a
                href={videoUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="pointer-events-auto block bg-gradient-to-t from-black/80 to-transparent px-3 pt-8 pb-2 text-white"
              >
                <span className="line-clamp-2 block text-xs font-medium">
                  {title}
                </span>
                {author ? (
                  <span className="block text-[10px] text-white/70">
                    {author}
                  </span>
                ) : null}
              </a>
            ) : (
              <div className="bg-gradient-to-t from-black/80 to-transparent px-3 pt-8 pb-2 text-white">
                <span className="line-clamp-2 block text-xs font-medium">
                  {title}
                </span>
                {author ? (
                  <span className="block text-[10px] text-white/70">
                    {author}
                  </span>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {caption ? (
        <figcaption className="text-xs leading-relaxed text-neutral-600">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
