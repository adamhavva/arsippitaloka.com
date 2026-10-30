import { parseTikTok } from "./tiktok";

export type TikTokOEmbed = {
  videoId: string | null;
  title: string | null;
  author: string | null;
};

/**
 * Ambil metadata TikTok lewat endpoint oEmbed. Dipakai untuk share link
 * pendek (vm.tiktok.com/...) yang id videonya belum diketahui.
 *
 * Kalau jaringan tidak tersedia, fungsi ini mengembalikan null — form tetap
 * bisa diisi manual.
 */
export async function fetchTikTokOEmbed(
  url: string,
): Promise<TikTokOEmbed | null> {
  const target = url.match(/https?:\/\/[^\s"'<>]+/)?.[0];
  if (!target || !/tiktok\.com/i.test(target)) return null;

  const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(target)}`;

  try {
    const res = await fetch(endpoint, {
      signal: AbortSignal.timeout(6000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      title?: string;
      author_name?: string;
      html?: string;
    };

    const videoId =
      data.html?.match(/\/video\/(\d{5,})/)?.[1] ??
      parseTikTok(data.html ?? "").videoId;

    return {
      videoId: videoId ?? null,
      title: data.title ?? null,
      author: data.author_name ?? null,
    };
  } catch {
    return null;
  }
}
