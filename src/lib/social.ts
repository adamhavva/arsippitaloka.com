/**
 * Helper konten media sosial.
 *
 * Postingan bisa berupa TikTok, YouTube, atau Instagram. Admin cukup
 * menempelkan share link atau kode embed; id video-nya diekstrak otomatis
 * lalu URL iframe disusun ulang ke pemutar resmi platform.
 *
 * Contoh iframe TikTok yang dipakai user:
 *   <iframe height="578" width="325"
 *     src="https://www.tiktok.com/player/v1/7669105916377173269?embed_from=webapp_share&music_info=1&description=1&autoplay=1&muted=1"
 *     frameborder="0" allow="accelerometer; autoplay; clipboard-write;
 *     encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
 *     allowfullscreen loading="lazy"></iframe>
 *
 * Pakai URL `player/v1` (bukan `embed/v2`) supaya parameter `autoplay=1`
 * dan `muted=1` benar-benar diterima — `embed/v2` mengabaikan keduanya.
 */

export type SocialPlatform = "tiktok" | "youtube" | "instagram";

export const SOCIAL_PLATFORMS: { value: SocialPlatform; label: string }[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
];

/** Label platform untuk ditampilkan (server-safe, bisa dipakai Server Component). */
export function platformLabel(platform: string): string {
  return (
    SOCIAL_PLATFORMS.find((p) => p.value === platform)?.label ?? platform
  );
}

/** Atribut `allow` untuk iframe — mengikuti iframe TikTok pada referensi. */
export const SOCIAL_IFRAME_ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share";

export type SocialRef = {
  platform: SocialPlatform;
  /** Id video (numerik untuk TikTok, id YouTube, shortcode Instagram). */
  videoId: string | null;
  /** URL halaman video (untuk link "lihat asli"). */
  videoUrl: string | null;
  /** URL siap tempel untuk iframe. */
  embedUrl: string | null;
  /** Nama pembuat kalau bisa dibaca dari link. */
  author: string | null;
};

const EMPTY: SocialRef = {
  platform: "tiktok",
  videoId: null,
  videoUrl: null,
  embedUrl: null,
  author: null,
};

/** URL pemutar TikTok yang benar-benar bisa diputar (autoplay + muted). */
export function tiktokPlayerUrl(videoId: string): string {
  return `https://www.tiktok.com/player/v1/${videoId}?embed_from=webapp_share&music_info=1&description=1&autoplay=1&muted=1`;
}

/** URL halaman video TikTok. */
export function tiktokVideoUrl(videoId: string): string {
  return `https://www.tiktok.com/@i/video/${videoId}`;
}

/** URL embed YouTube. */
export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/** URL halaman video YouTube. */
export function youtubeVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/** URL embed Instagram. */
export function instagramEmbedUrl(shortcode: string): string {
  return `https://www.instagram.com/embed/${shortcode}`;
}

/** URL halaman Instagram. */
export function instagramVideoUrl(shortcode: string): string {
  return `https://www.instagram.com/p/${shortcode}`;
}

/**
 * Ambil id video dari share link, short link, atau kode embed apa pun.
 *
 * Mengembalikan `platform` Nullable — kalau tidak dikenali, `platform`
 * tetap "tiktok" tapi `videoId` null.
 */
export function parseSocialRef(
  source: string | null | undefined,
): SocialRef {
  if (!source) return EMPTY;

  const text = source.trim();
  if (!text) return EMPTY;

  // Kode embed: ambil src (iframe) atau cite (blockquote).
  const src = text.match(/src=["']([^"']+)["']/i)?.[1];
  const cite = text.match(/cite=["']([^"']+)["']/i)?.[1];
  const url = src ?? cite ?? text.match(/https?:\/\/[^\s"'<>\\]+/)?.[0];
  if (!url) return EMPTY;

  // --- TikTok ---
  const tiktokPlayer = url.match(/\/player\/v1\/(\d{5,})/);
  if (tiktokPlayer) {
    return {
      platform: "tiktok",
      videoId: tiktokPlayer[1],
      videoUrl: tiktokVideoUrl(tiktokPlayer[1]),
      embedUrl: tiktokPlayerUrl(tiktokPlayer[1]),
      author: null,
    };
  }
  const tiktokVideo = url.match(/\/video\/(\d{5,})/);
  if (tiktokVideo) {
    return {
      platform: "tiktok",
      videoId: tiktokVideo[1],
      videoUrl: tiktokVideoUrl(tiktokVideo[1]),
      embedUrl: tiktokPlayerUrl(tiktokVideo[1]),
      author: url.match(/@([A-Za-z0-9._-]+)/)?.[1] ?? null,
    };
  }

  // --- YouTube ---
  const ytWatch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  const ytShort = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  const ytEmbed = url.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
  const ytId = ytWatch?.[1] ?? ytShort?.[1] ?? ytEmbed?.[1];
  if (ytId && /youtu/i.test(url)) {
    return {
      platform: "youtube",
      videoId: ytId,
      videoUrl: youtubeVideoUrl(ytId),
      embedUrl: youtubeEmbedUrl(ytId),
      author: null,
    };
  }

  // --- Instagram ---
  const igShort = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  const igEmbed = url.match(/instagram\.com\/embed\/([A-Za-z0-9_-]+)/);
  const igId = igShort?.[1] ?? igEmbed?.[1];
  if (igId) {
    return {
      platform: "instagram",
      videoId: igId,
      videoUrl: instagramVideoUrl(igId),
      embedUrl: instagramEmbedUrl(igId),
      author: url.match(/instagram\.com\/([A-Za-z0-9._]+)/)?.[1] ?? null,
    };
  }

  return EMPTY;
}

/**
 * Susun URL embed final dari data yang tersimpan.
 *
 * Kalau `embedUrl` tersimpan, pakai itu. Kalau tidak, susun dari
 * platform + videoId.
 */
export function resolveEmbedUrl(input: {
  platform: string;
  videoId: string;
  embedUrl?: string | null;
}): string | null {
  if (input.embedUrl) return input.embedUrl;
  const platform = input.platform as SocialPlatform;
  if (!input.videoId) return null;
  if (platform === "youtube") return youtubeEmbedUrl(input.videoId);
  if (platform === "instagram") return instagramEmbedUrl(input.videoId);
  return tiktokPlayerUrl(input.videoId);
}

/** URL halaman video dari data yang tersimpan. */
export function resolveVideoUrl(input: {
  platform: string;
  videoId: string;
}): string | null {
  const platform = input.platform as SocialPlatform;
  if (!input.videoId) return null;
  if (platform === "youtube") return youtubeVideoUrl(input.videoId);
  if (platform === "instagram") return instagramVideoUrl(input.videoId);
  return tiktokVideoUrl(input.videoId);
}

/**
 * Susun URL thumbnail/cover default dari platform + videoId.
 *
 * - YouTube: `i.ytimg.com/vi/<id>/hqdefault.jpg` (deterministik dari id).
 * - TikTok: tidak deterministik — thumbnail-nya hanya bisa dari oEmbed,
 *   jadi dilewatkan lewat `tiktokThumbnail` kalau ada.
 * - Instagram: tidak ada URL thumbnail publik yang stabil → null.
 */
export function resolveThumbnailUrl(input: {
  platform: string;
  videoId: string | null;
  tiktokThumbnail?: string | null;
}): string | null {
  const platform = input.platform as SocialPlatform;
  if (platform === "youtube" && input.videoId) {
    return `https://i.ytimg.com/vi/${input.videoId}/hqdefault.jpg`;
  }
  if (platform === "tiktok") {
    return input.tiktokThumbnail ?? null;
  }
  return null;
}
