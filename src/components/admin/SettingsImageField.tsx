"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { fileToDataUrl, isDataUrl } from "@/lib/file-to-data-url";

/**
 * Field gambar untuk pengaturan situs: unggah file → data URL base64 →
 * disimpan langsung ke `SiteSetting.value` lewat hidden input.
 *
 * Mendukung nilai lama berupa URL/path biasa (ditampilkan sebagai pratinjau).
 * Kosongkan untuk menghapus.
 */
export default function SettingsImageField({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(value);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    try {
      setPreview(await fileToDataUrl(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membaca file.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <span className="relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
          {preview ? (
            // `fill` dipakai (bukan width/height) supaya ukuran gambar sama
            // persis dengan kotak pratinjau — kalau memakai width/height,
            // Next.js mengeluh "width or height modified, but not the other"
            // karena border kotak membuat lebar efektifnya 94px, bukan 96px.
            <Image
              src={preview}
              alt="Pratinjau"
              fill
              sizes="96px"
              unoptimized={isDataUrl(preview)}
              className="object-contain"
            />
          ) : (
            <ImageIcon size={22} className="text-neutral-400" />
          )}
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Pilih gambar
          </button>
          {preview ? (
            <button
              type="button"
              onClick={() => {
                setPreview("");
                setError(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="rounded-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Hapus
            </button>
          ) : null}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        className="hidden"
      />
      <input type="hidden" name={name} value={preview} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
