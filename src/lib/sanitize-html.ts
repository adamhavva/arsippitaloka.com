import DOMPurify from "isomorphic-dompurify";

/**
 * Bersihkan HTML dari field rich-text (Tiptap) sebelum dirender ke publik.
 * Teks lama (plain string tanpa tag) tetap lolos apa adanya — backward
 * compatible otomatis tanpa perlu deteksi JSON-vs-legacy.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "strong", "em", "a", "ul", "ol", "li", "h2", "h3", "br"],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });
}

/** Class Tailwind arbitrary-variant untuk styling elemen rich-text yang dirender. */
export const RICH_TEXT_CLASS =
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:underline [&_strong]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_p+p]:mt-3";
