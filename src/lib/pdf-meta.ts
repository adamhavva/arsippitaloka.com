import zlib from "node:zlib";

/**
 * Ambil metadata dasar PDF (jumlah halaman + jumlah kata) tanpa dependency
 * eksternal: file PDF dibaca manual — stream-nya di-inflate dengan zlib
 * bawaan Node, lalu teks diambil dari operator Tj/TJ.
 *
 * Cukup untuk mengisi kolom "Format File", "Ukuran File", "Jumlah Kata",
 * dan "Halaman" secara otomatis setelah e-book diunggah.
 */
export type PdfMeta = {
  pages: number;
  words: number;
  characters: number;
};

const EMPTY: PdfMeta = { pages: 0, words: 0, characters: 0 };

export function parsePdfMeta(buffer: Buffer): PdfMeta {
  const raw = buffer.toString("latin1");
  const pages = countPages(raw);
  const text = extractText(raw, buffer);
  const words = text.split(/\s+/).filter(Boolean).length;
  return { pages, words, characters: text.length };
}

/** Halaman = objek `/Type /Page` (bukan `/Pages`). */
function countPages(raw: string): number {
  const pageObjects = raw.match(/\/Type\s*\/Page(?![sA-Za-z])/g)?.length ?? 0;
  if (pageObjects > 0) return pageObjects;

  // Fallback: ambil /Count terbesar dari pohon halaman.
  const counts = [...raw.matchAll(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/g)].map(
    (m) => Number(m[1]),
  );
  if (counts.length > 0) return Math.max(...counts);

  const loose = [...raw.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]));
  return loose.length > 0 ? Math.max(...loose) : 0;
}

/** Teks dari seluruh stream: inflate bila perlu, lalu ambil string literal. */
function extractText(raw: string, buffer: Buffer): string {
  const chunks: string[] = [];
  const streamRe = /stream\r?\n?/g;
  let match: RegExpExecArray | null;

  while ((match = streamRe.exec(raw)) !== null) {
    const start = match.index + match[0].length;
    const end = raw.indexOf("endstream", start);
    if (end === -1) break;

    const slice = buffer.subarray(start, end);
    let content = slice.toString("latin1");

    // Coba inflate (PDF asli hampir selalu FlateDecode).
    try {
      const inflated = zlib.inflateSync(slice);
      content = inflated.toString("latin1");
    } catch {
      // Stream tanpa kompresi — pakai apa adanya.
    }

    chunks.push(pullText(content));
    streamRe.lastIndex = end;
  }

  return chunks.join(" ").replace(/\s+/g, " ").trim();
}

/** Ambil isi string literal `(...)` dan hex `<...>` dari operator teks. */
function pullText(content: string): string {
  const parts: string[] = [];
  const literal = /\(((?:\\.|[^\\()])*)\)/g;
  let m: RegExpExecArray | null;

  while ((m = literal.exec(content)) !== null) {
    parts.push(m[1].replace(/\\([()\\])/g, "$1"));
  }

  const hex = /<([0-9A-Fa-f\s]{4,})>/g;
  while ((m = hex.exec(content)) !== null) {
    const hexDigits = m[1].replace(/\s+/g, "");
    if (hexDigits.length % 2 !== 0) continue;
    let out = "";
    for (let i = 0; i < hexDigits.length; i += 2) {
      const code = Number.parseInt(hexDigits.slice(i, i + 2), 16);
      if (code >= 32) out += String.fromCharCode(code);
    }
    if (out) parts.push(out);
  }

  return parts.join(" ");
}

export { EMPTY as EMPTY_PDF_META };
