"use client";

import { useMemo, useState } from "react";
import { parseTikTok } from "@/lib/tiktok";

/**
 * Input TikTok: admin cukup menempelkan share link atau kode embed, lalu
 * videonya langsung muncul sebagai pratinjau (iframe embed resmi TikTok).
 */
export default function TikTokField({
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
  const [source, setSource] = useState(value ?? "");

  const ref = useMemo(() => parseTikTok(source), [source]);

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>

      <textarea
        name={name}
        value={source}
        onChange={(e) => setSource(e.target.value)}
        rows={2}
        placeholder='https://www.tiktok.com/@username/video/7234567890123456789 atau kode <iframe src="https://www.tiktok.com/player/v1/7234567890123456789?…">'
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
      />

      {ref.embedUrl ? (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-black">
          <iframe
            src={ref.embedUrl}
            title="Pratinjau TikTok"
            className="h-[540px] w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : source.trim() ? (
        <p className="text-xs text-amber-700">
          Link-nya belum bisa dikenali. Tempel share link TikTok yang memuat
          bagian <span className="font-medium">/video/&lt;id&gt;</span>, kode
          embed <span className="font-medium">player/v1/&lt;id&gt;</span>,
          atau kode embed lengkap.
        </p>
      ) : (
        <p className="text-xs text-neutral-500">
          Tempel share link atau kode embed TikTok untuk melihat pratinjau.
        </p>
      )}

      {ref.videoId ? (
        <p className="text-xs text-neutral-500">
          Video ID: <span className="font-medium text-neutral-700">{ref.videoId}</span>
          {ref.author ? ` · @${ref.author}` : ""}
        </p>
      ) : null}

      {help ? <p className="text-xs text-neutral-500">{help}</p> : null}
    </div>
  );
}
