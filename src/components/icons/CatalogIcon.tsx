"use client";

import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { iconKebab, iconPascal } from "@/lib/icon";

/**
 * Render ikon lucide berdasarkan nama yang tersimpan di database.
 * Katalog ikon hanya boleh dimuat di client, jadi komponen ini client-side
 * dan dipakai baik oleh form admin maupun halaman publik.
 */

const ICON_SET = new Set<string>(iconNames);

const PASCAL_TO_ICON = new Map<string, string>();
for (const kebab of iconNames) {
  PASCAL_TO_ICON.set(iconPascal(kebab), kebab);
}

/** Ubah nama ikon apa pun formatnya menjadi nama kanonik lucide. */
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

export default function CatalogIcon({
  name,
  size = 24,
  className,
  strokeWidth,
}: {
  name?: string | null;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const icon = resolveIconName(name);
  if (!icon) return null;

  return (
    <DynamicIcon
      name={icon as never}
      size={size}
      className={className}
      strokeWidth={strokeWidth}
    />
  );
}
