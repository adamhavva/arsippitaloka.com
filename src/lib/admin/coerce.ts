import type { FieldDef } from "./entities";

/**
 * Konversi FormData menjadi nilai yang cocok untuk Prisma, berdasarkan
 * definisi field. Field yang tidak ada di `def.fields` TIDAK pernah ikut
 * (anti mass-assignment).
 */
export function coerceField(
  def: FieldDef,
  raw: FormDataEntryValue | boolean | null,
): string | number | boolean | string[] | Date | null | undefined {
  if (typeof raw === "boolean") return raw;

  const value = typeof raw === "string" ? raw : "";

  switch (def.type) {
    case "boolean":
      return value === "1" || value === "on" || value === "true";

    case "number": {
      if (value.trim() === "") return null;
      const n = Number(value);
      return Number.isNaN(n) ? null : n;
    }

    case "date": {
      if (value.trim() === "") return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    case "lines":
      return value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

    default:
      return value;
  }
}

/**
 * Buang nilai kosong supaya tidak menimpa kolom lain dengan null.
 * Nilai `null` juga dibuang: kolom yang wajib di DB tidak boleh null, dan
 * kolom opsional cukup dibiarkan memakai default kolomnya.
 */
export function pruneEmpty(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    out[key] = value;
  }
  return out;
}
