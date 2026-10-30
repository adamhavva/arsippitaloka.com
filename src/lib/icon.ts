/**
 * Helper nama ikon lucide.
 *
 * File ini SENGAJA tidak meng-import `lucide-react/dynamic` supaya aman
 * dipakai di Server Component (katalog ikon hanya boleh dimuat di client).
 */

/** "BookOpen" → "book-open", "Building2" → "building-2". */
export function iconKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([A-Za-z])(\d)/g, "$1-$2")
    .toLowerCase();
}

/** "book-open" → "BookOpen". */
export function iconPascal(name: string): string {
  return name
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
