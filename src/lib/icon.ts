import { iconNames } from "lucide-react/dynamic";

const ICON_SET = new Set<string>(iconNames);
const PASCAL_TO_ICON = new Map<string, string>();
for (const kebab of iconNames) {
  PASCAL_TO_ICON.set(
    kebab
      .split("-")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(""),
    kebab,
  );
}

/** "BookOpen" → "book-open", "Building2" → "building-2". */
export function iconKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([A-Za-z])(\d)/g, "$1-$2")
    .toLowerCase();
}

/**
 * Ubah nama ikon yang tersimpan (apa pun formatnya) menjadi nama kanonik
 * lucide-react, atau `null` kalau ikonnya tidak dikenal.
 */
export function resolveIconName(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (ICON_SET.has(trimmed)) return trimmed;

  const kebab = iconKebab(trimmed);
  if (ICON_SET.has(kebab)) return kebab;

  const pascal = PASCAL_TO_ICON.get(trimmed);
  if (pascal) return pascal;

  const flat = trimmed.toLowerCase().replace(/-/g, "");
  for (const icon of iconNames) {
    if (icon.replace(/-/g, "") === flat) return icon;
  }
  return null;
}
