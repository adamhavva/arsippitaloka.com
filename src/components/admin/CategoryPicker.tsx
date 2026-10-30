"use client";

import { useState } from "react";
import { DynamicIcon } from "lucide-react/dynamic";
import { resolveIconName } from "@/lib/icon";

export type CategoryOption = {
  value: string;
  label: string;
  icon?: string | null;
};

/**
 * Pemilih kategori: daftar kategori sebagai kartu berisi ikon lucide-nya,
 * jadi kelihatan Categories yang menempel di halaman buku.
 */
export default function CategoryPicker({
  name,
  label,
  options,
  value,
  help,
}: {
  name: string;
  label: string;
  options: CategoryOption[];
  value?: string | null;
  help?: string;
}) {
  const [selected, setSelected] = useState(value ?? "");

  const selectedOption = options.find((opt) => opt.value === selected);

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>

      <input type="hidden" name={name} value={selected} />

      {options.length === 0 ? (
        <p className="text-xs text-neutral-500">
          Belum ada kategori. Buat dulu di menu Kategori.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const kebab = resolveIconName(opt.icon);
            const active = selected === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(active ? "" : opt.value)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                  active
                    ? "border-maroon bg-maroon/10 font-medium text-maroon"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {kebab ? (
                  <DynamicIcon name={kebab as never} size={14} />
                ) : (
                  <span className="h-3.5 w-3.5 rounded-full bg-neutral-200" />
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      )}

      <p className="text-xs text-neutral-500">
        Dipilih:{" "}
        <span className="font-medium text-neutral-700">
          {selectedOption?.label ?? "—"}
        </span>
      </p>

      {help ? <p className="text-xs text-neutral-500">{help}</p> : null}
    </div>
  );
}
