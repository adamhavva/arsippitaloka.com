import { parseTikTok } from "./tiktok";

export type TikTokOEmbed = {
  videoId: string | null;
  title: string | null;
  author: string | null;
  thumbnailUrl: string | null;
};

/** Hasil pengecekan video: ada, tidak ada, atau tidak bisa dipastikan. */
export type TikTokCheck = {
  status: "exists" | "notfound" | "unknown";
  videoId: string | null;
  title: string | null;
  author: string | null;
  thumbnailUrl: string | null;
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

  // Endpoint oEmbed hanya memahami URL halaman video, bukan URL player.
  const playerId = target.match(/\/player\/(?:v1\/)?(\d{5,})/i)?.[1];
  const pageUrl = playerId
    ? `https://www.tiktok.com/@i/video/${playerId}`
    : target;

  const endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(pageUrl)}`;

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
      thumbnail_url?: string;
    };

    const videoId =
      data.html?.match(/\/video\/(\d{5,})/)?.[1] ??
      parseTikTok(data.html ?? "").videoId;

    return {
      videoId: videoId ?? null,
      title: data.title ?? null,
      author: data.author_name ?? null,
      thumbnailUrl: data.thumbnail_url ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Ambil metadata TikTok dari halaman videonya.
 *
 * Endpoint oEmbed TikTok sering membalas 200 tanpa judul/penyebut (video
 * tanpa deskripsi, atau request tanpa User-Agent browser), jadi untuk
 * pengecekan keberadaan video lebih andal memakai halaman video langsung:
 * halaman video yang masih hidup menyertakan data pemutar (`playAddr`),
 * sedangkan video yang tidak ada dibalas `statusCode: 10204`.
 *
 * Short link `vm.tiktok.com/...` ikut ditangani: request-nya mengikuti
 * redirect sehingga URL akhirnya (@user/video/ID) bisa dibaca.
 */
export async function fetchTikTokPage(
  url: string,
): Promise<{
  videoId: string | null;
  title: string | null;
  author: string | null;
  found: boolean | null;
}> {
  const target = url.match(/https?:\/\/[^\s"'<>]+/)?.[0];
  if (!target || !/tiktok\.com/i.test(target)) {
    return { videoId: null, title: null, author: null, found: null };
  }

  // URL player (player/v1) tidak memuat metadata di halamannya — ambil dari
  // halaman video aslinya supaya judul, author, dan status video terbaca.
  const playerId = target.match(/\/player\/(?:v1\/)?(\d{5,})/i)?.[1];
  const pageTarget = playerId
    ? `https://www.tiktok.com/@i/video/${playerId}`
    : target;

  try {
    const res = await fetch(pageTarget, {
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        accept: "text/html",
      },
    });
    const html = await res.text().catch(() => "");

    const videoId =
      html.match(/\/video\/(\d{5,})/)?.[1] ??
      res.url.match(/\/video\/(\d{5,})/)?.[1] ??
      null;

    const desc = html.match(/"desc":"((?:[^"\\]|\\.)*)"/)?.[1];
    const uniqueId = html.match(/"uniqueId":"([^"]+)"/)?.[1];

    let title: string | null = null;
    if (desc) {
      try {
        title = JSON.parse(`"${desc}"`) as string;
      } catch {
        title = desc;
      }
    }

    const found = html.includes('"playAddr"')
      ? true
      : html.includes('"statusCode":10204') ||
          html.includes("item doesn't exist")
        ? false
        : null;

    return {
      videoId,
      title: title && title.trim() ? title.trim() : null,
      author: uniqueId ?? null,
      found,
    };
  } catch {
    return { videoId: null, title: null, author: null, found: null };
  }
}

/**
 * Cek apakah sebuah video TikTok benar-benar ada.
 *
 * Sinyal utama: halaman video-nya masih hidup (ada data pemutar `playAddr`)
 * atau memang tidak ada (`statusCode: 10204` / "item doesn't exist").
 *
 * Kalau halamannya tidak bisa dibaca (rate-limit, timeout, blokir), hasilnya
 * "unknown" — supaya admin tetap bisa menyimpan video yang sah. Penolakan
 * hanya terjadi kalau TikTok dengan jelas menyatakan videonya tidak ada.
 */
export async function checkTikTokVideo(url: string): Promise<TikTokCheck> {
  const oembed = await fetchTikTokOEmbed(url);
  const ref = parseTikTok(url);
  const page = await fetchTikTokPage(url);

  const videoId = page.videoId ?? oembed?.videoId ?? ref.videoId;
  const title = page.title ?? oembed?.title ?? null;
  const author = page.author ?? oembed?.author ?? ref.author ?? null;
  const thumbnailUrl = oembed?.thumbnailUrl ?? null;

  if (!videoId) {
    return { status: "unknown", videoId: null, title, author, thumbnailUrl };
  }

  if (page.found === true) {
    return { status: "exists", videoId, title, author, thumbnailUrl };
  }

  if (page.found === false) {
    return { status: "notfound", videoId, title, author, thumbnailUrl };
  }

  // Halaman tidak terbaca → cek endpoint embed sebagai cadangan.
  //
  // `embed/v2` masih jadi sinyal paling kuat: ia membalas 400/404 untuk
  // video yang tidak ada. `player/v1` selalu membalas 200 (even untuk id
  // yang tidak ada), jadi hanya dipakai sebagai buktiweak bahwa videonya
  // bisa dimuat.
  const candidates = [
    `https://www.tiktok.com/embed/v2/${videoId}`,
    `https://www.tiktok.com/player/v1/${videoId}`,
  ];

  for (const candidate of candidates) {
    try {
      const res = await fetch(candidate, {
        method: "GET",
        signal: AbortSignal.timeout(6000),
        headers: { accept: "text/html" },
      });
      await res.text().catch(() => "");

      if (res.status === 400 || res.status === 404) {
        return { status: "notfound", videoId, title, author, thumbnailUrl };
      }
      if (res.status === 200) {
        return { status: "exists", videoId, title, author, thumbnailUrl };
      }
    } catch {
      // abaikan, coba kandidat berikutnya
    }
  }

  return { status: "unknown", videoId, title, author, thumbnailUrl };
}
