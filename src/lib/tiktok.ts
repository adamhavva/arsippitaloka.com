/**
 * Helper untuk konten TikTok: admin cukup menempelkan share link atau
 * kode embed, lalu id video-nya diekstrak otomatis.
 *
 * Format yang dikenali:
 * - Share link      : https://www.tiktok.com/@user/video/7234567890123456789
 * - Embed iframe    : <iframe src="https://www.tiktok.com/player/v1/<id>?…">
 * - Embed lama      : https://www.tiktok.com/embed/v2/<id>
 * - Short link      : https://vm.tiktok.com/XXXX (id diketahui setelah redirect)
 */

export type TikTokRef = {
  /** Id video angka, mis. "7234567890123456789". */
  videoId: string | null;
  /** Username pembuat, mis. "pita_pitaloka". */
  author: string | null;
  /** Caption/judul dari kode embed (atribut title), kalau ada. */
  title: string | null;
  /** URL video yang bisa dibuka. */
  videoUrl: string | null;
  /** URL siap tempel untuk iframe embed. */
  embedUrl: string | null;
};

/**
 * URL pemutar resmi TikTok (`player/v1`).
 *
 * `player/v1` adalah format embed yang dipakai TikTok sendiri sekarang —
 * `embed/v2` sudah deprecated dan sebagian video gagal dimuat di sana.
 * Parameter `autoplay=1` + `muted=1` hanya dipakai untuk pratinjau admin.
 */
export function tiktokPlayerUrl(videoId: string): string {
  return `https://www.tiktok.com/player/v1/${videoId}?embed_from=webapp_share&music_info=1&description=1&autoplay=1&muted=1`;
}

/** URL embed untuk tampilan publik (tanpa autoplay). */
export function tiktokEmbedUrl(videoId: string): string {
  return `https://www.tiktok.com/player/v1/${videoId}?embed_from=webapp_share&music_info=1&description=1`;
}

/** URL halaman video. */
export function tiktokVideoUrl(videoId: string): string {
  return `https://www.tiktok.com/@i/video/${videoId}`;
}

/**
 * Ambil id video dari share link, short link, atau kode embed
 * `<iframe src="https://www.tiktok.com/player/v1/ID?…">` maupun
 * `<blockquote class="tiktok-embed" cite="https://www.tiktok.com/@user/video/ID">`.
 */
export function parseTikTok(source: string | null | undefined): TikTokRef {
  const empty: TikTokRef = {
    videoId: null,
    author: null,
    title: null,
    videoUrl: null,
    embedUrl: null,
  };
  if (!source) return empty;

  const text = source.trim();
  if (!text) return empty;

  // 1. Kode embed: ambil `src` (iframe) atau `cite` (blockquote). Kalau
  //    keduanya tidak ada, pakai URL pertama yang muncul di teks.
  const src = text.match(/src=["']([^"']+)["']/i)?.[1];
  const cite = text.match(/cite=["']([^"']+)["']/i)?.[1];
  const url = src ?? cite ?? text.match(/https?:\/\/[^\s"'<>\\]+/)?.[0];
  if (!url) return empty;

  const author = url.match(/@([A-Za-z0-9._-]+)/)?.[1] ?? null;

  // Judul/caption ikut diambil dari atribut `title` kode embed.
  const embedTitle = text
    .match(/\stitle=["']([^"']+)["']/i)?.[1]
    ?.replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
  const title = embedTitle || null;

  // 2. Format embed terbaru: /player/v1/<id> (tombol Share → Embed).
  const player = url.match(/\/player\/(?:v1\/)?(\d{5,})/i);
  if (player) {
    const videoId = player[1];
    return {
      videoId,
      author,
      title,
      videoUrl: tiktokVideoUrl(videoId),
      embedUrl: tiktokPlayerUrl(videoId),
    };
  }

  // 3. Share link: https://www.tiktok.com/@user/video/123456
  const direct = url.match(/\/video\/(\d{5,})/);
  if (direct) {
    const videoId = direct[1];
    return {
      videoId,
      author,
      title,
      videoUrl: tiktokVideoUrl(videoId),
      embedUrl: tiktokPlayerUrl(videoId),
    };
  }

  // 4. Embed lama: https://www.tiktok.com/embed/v2/<id>
  const legacy = url.match(/\/embed\/(?:v2\/)?(\d{5,})/i);
  if (legacy) {
    const videoId = legacy[1];
    return {
      videoId,
      author,
      title,
      videoUrl: tiktokVideoUrl(videoId),
      embedUrl: tiktokPlayerUrl(videoId),
    };
  }

  // 5. Short link (vm.tiktok.com/XXXX) — id-nya hanya diketahui setelah
  //    TikTok mengredirect, jadi dikembalikan sebagai URL video saja.
  if (/tiktok\.com/i.test(url)) {
    return { ...empty, videoUrl: url };
  }

  return empty;
}
