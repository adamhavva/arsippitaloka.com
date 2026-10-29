"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  name: string;
  label: string;
  kind: "image" | "file";
  value?: string | null;
  help?: string;
};

/**
 * Field upload: pilih file → langsung diunggah ke /api/admin/upload → URL
 * hasilnya ditaruh di input hidden supaya ikut terkirim saat form disubmit.
 */
export default function ImageField({ name, label, kind, value, help }: Props) {
  const [url, setUrl] = useState<string | null>(value ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("kind", kind);

      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        setError(json?.error ?? "Upload gagal");
        return;
      }
      setUrl(json.url);
    } catch {
      setError("Upload gagal");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>

      <input type="hidden" name={name} value={url ?? ""} />

      {kind === "image" && url ? (
        <div className="relative h-32 w-24 overflow-hidden rounded-lg bg-[#3d2b2e]">
          <Image
            src={url}
            alt="Pratinjau"
            fill
            sizes="96px"
            className="object-cover"
          />
        </div>
      ) : null}

      {kind === "file" && url ? (
        <p className="truncate text-xs text-neutral-600">{url}</p>
      ) : null}

      <input
        type="file"
        accept={kind === "image" ? "image/*" : "application/pdf"}
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
        className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:bg-maroon-dark file:px-4 file:py-1.5 file:text-xs file:font-medium file:text-white"
      />

      {busy ? <p className="text-xs text-neutral-500">Mengunggah…</p> : null}
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
      {help ? <p className="text-xs text-neutral-500">{help}</p> : null}
    </div>
  );
}
