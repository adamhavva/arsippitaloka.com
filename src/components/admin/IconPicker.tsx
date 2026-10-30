"use client";

import { useMemo, useState } from "react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import { resolveIconName } from "@/lib/icon";

/**
 * Pemilih ikon lucide-react: klik kolom ikon → galeri semua ikon terbuka,
 * cari by name, klik untuk memilih. Nilai yang disimpan tetap PascalCase
 * (mis. "BookOpen") supaya konsisten dengan data yang sudah ada.
 */

/** "book-open" → "BookOpen". */
function toPascal(kebab: string): string {
  return kebab
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export default function IconPicker({
  name,
  label,
  value,
  help,
}: {
  name: string;
  label: string;
  value?: string | null;
  help?: string;
}) {
  const [selected, setSelected] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(120);

  const current = resolveIconName(selected);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? iconNames.filter(
          (icon) =>
            icon.includes(q) || toPascal(icon).toLowerCase().includes(q),
        )
      : iconNames;
    return list.slice(0, limit);
  }, [query, limit]);

  const total = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return iconNames.length;
    return iconNames.filter(
      (icon) =>
        icon.includes(q) || toPascal(icon).toLowerCase().includes(q),
    ).length;
  }, [query]);

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>

      <input type="hidden" name={name} value={selected} />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 rounded-lg border border-neutral-300 px-3 py-2 text-left text-sm hover:border-maroon"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
          {current ? (
            <DynamicIcon name={current as never} size={18} />
          ) : (
            <span className="text-xs text-neutral-400">?</span>
          )}
        </span>
        <span className="min-w-0 flex-1 truncate text-neutral-800">
          {selected || "Pilih ikon…"}
        </span>
        <span className="text-xs text-neutral-500">{open ? "Tutup" : "Ganti"}</span>
      </button>

      {open ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ikon… (mis. book)"
            className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />

          <div className="grid max-h-64 grid-cols-6 gap-1.5 overflow-y-auto sm:grid-cols-8">
            {results.map((icon) => (
              <button
                key={icon}
                type="button"
                title={toPascal(icon)}
                onClick={() => {
                  setSelected(toPascal(icon));
                  setOpen(false);
                }}
                className={`flex h-10 items-center justify-center rounded-md border transition ${
                  selected === toPascal(icon)
                    ? "border-maroon bg-maroon/10 text-maroon"
                    : "border-transparent text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <DynamicIcon name={icon as never} size={18} />
              </button>
            ))}
          </div>

          {results.length < total ? (
            <button
              type="button"
              onClick={() => setLimit((v) => v + 120)}
              className="mt-2 text-xs font-medium text-maroon hover:underline"
            >
              Tampilkan lebih banyak ({total - results.length} ikon lagi)
            </button>
          ) : null}

          <p className="mt-2 text-xs text-neutral-500">
            Menampilkan {results.length} dari {total} ikon. Nama ikon:{" "}
            <span className="font-medium text-neutral-700">
              {selected || "—"}
            </span>
          </p>
        </div>
      ) : null}

      {help ? <p className="text-xs text-neutral-500">{help}</p> : null}
    </div>
  );
}
