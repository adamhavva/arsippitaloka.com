/**
 * Helper untuk konten TikTok: admin cukup menempelkan share link atau
 * kode embed, lalu id video-nya diekstrak otomatis.
 */

export type TikTokRef = {
  /** Id video angka, mis. "7234567890123456789". */
  videoId: string | null;
  /** Username pembuat, mis. "pita_pitaloka". */
  author: string | null;
  /** URL video yang bisa dibuka. */
  videoUrl: string | null;
  /** URL siap tempel untuk iframe embed. */
  embedUrl: string | null;
};

/** URL embed resmi TikTok untuk sebuah id video. */
export function tiktokEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/embed/v2/${videoId}`;
}

/** URL halaman video. */
export function tiktokVideoUrl(videoId: string): string {
  return `https://www.tiktok.com/@i/video/${videoId}`;
}

/**
 * Ambil id video dari share link, short link, atau kode embed
 * `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@user/video/ID">`.
 */
export function parseTikTok(source: string | null | undefined): TikTokRef {
  const empty: TikTokRef = {
    videoId: null,
    author: null,
    videoUrl: null,
    embedUrl: null,
  };
  if (!source) return empty;

  const text = source.trim();
  if (!text) return empty;

  // 1. Kode embed: ambil atribut cite.
  const cite = text.match(/cite=["']([^"']+)["']/i)?.[1];
  const url = cite ?? text.match(/https?:\/\/[^\s"'<>\\]+/)?.[0];
  if (!url) return empty;

  // 2. Share link: https://www.tiktok.com/@user/video/123456
  const direct = url.match(/\/video\/(\d{5,})/);
  if (direct) {
    const videoId = direct[1];
    const author = url.match(/@([A-Za-z0-9._-]+)/)?.[1] ?? null;
    return {
      videoId,
      author,
      videoUrl: tiktokVideoUrl(videoId),
      embedUrl: tiktokEmbedUrl(videoId),
    };
  }

  // 3. Short link (vm.tiktok.com/XXXX) — id-nya hanya diketahui setelah
  //    TikTok mengredirect, jadi dikembalikan sebagai URL video saja.
  if (/tiktok\.com/i.test(url)) {
    return { ...empty, videoUrl: url };
  }

  return empty;
}
