import DOMPurify from "isomorphic-dompurify";

let hookRegistered = false;

/**
 * Daftarkan hook sekali: buang iframe yang bukan dari YouTube supaya editor
 * tidak bisa menyisipkan iframe ke domain sembarangan.
 */
function ensureHook() {
  if (hookRegistered) return;
  DOMPurify.addHook("uponSanitizeElement", (node, data) => {
    if (data.tagName !== "iframe") return;
    const src = (node as Element).getAttribute("src") ?? "";
    const allowed =
      /^https?:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(
        src,
      );
    if (!allowed) {
      (node as Element).remove();
    }
  });
  hookRegistered = true;
}

/**
 * Bersihkan HTML dari field rich-text (Tiptap) sebelum dirender ke publik.
 * Teks lama (plain string tanpa tag) tetap lolos apa adanya — backward
 * compatible otomatis tanpa perlu deteksi JSON-vs-legacy.
 *
 * Mengizinkan gambar (termasuk `data:image/*` base64 dari editor) dan iframe
 * YouTube; iframe non-YouTube dibuang lewat hook.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";
  ensureHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "strong",
      "em",
      "a",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "br",
      "img",
      "iframe",
      "div",
      "blockquote",
      "hr",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "colgroup",
      "col",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "title",
      "width",
      "height",
      "class",
      "style",
      "colspan",
      "rowspan",
      "allow",
      "allowfullscreen",
      "frameborder",
      "data-youtube-video",
    ],
    // Izinkan data:image/* pada <img> (gambar base64 dari editor).
    ADD_DATA_URI_TAGS: ["img"],
  });
}

/** Class Tailwind arbitrary-variant untuk styling elemen rich-text yang dirender. */
export const RICH_TEXT_CLASS =
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline [&_strong]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_p+p]:mt-3 [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-lg [&_iframe]:my-3 [&_iframe]:aspect-video [&_iframe]:w-full [&_iframe]:rounded-lg [&_div[data-youtube-video]]:my-3 [&_blockquote]:my-3 [&_blockquote]:border-l-4 [&_blockquote]:border-maroon/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-neutral-600 [&_hr]:my-5 [&_hr]:border-neutral-300 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-neutral-300 [&_th]:bg-neutral-100 [&_th]:p-2 [&_th]:text-left [&_th]:font-semibold [&_td]:border [&_td]:border-neutral-300 [&_td]:p-2 [&_td]:align-top";
