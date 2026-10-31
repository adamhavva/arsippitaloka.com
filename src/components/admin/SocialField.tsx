"use client";

import { useMemo, useState } from "react";
import { parseSocialRef, platformLabel } from "@/lib/social";

/**
 * Input media sosial multi-platform: admin menempelkan share link atau kode
 * embed (TikTok/YouTube/Instagram), lalu videonya langsung muncul sebagai
 * pratinjau dengan rasio aspek sesuai platformnya. Platform & id video
 * terbaca otomatis — server (`saveEntity` cabang `social`) yang menyimpan
 * nilai finalnya.
 */
export default function SocialField({
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

  const ref = useMemo(() => parseSocialRef(source), [source]);

  const vertical = ref.platform === "tiktok" || ref.platform === "instagram";

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>

      <textarea
        name={name}
        value={source}
        onChange={(e) => setSource(e.target.value)}
        rows={2}
        placeholder="Share link TikTok / YouTube / Instagram, atau kode embed lengkap"
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
      />

      {ref.embedUrl ? (
        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-black">
          <iframe
            src={ref.embedUrl}
            title="Pratinjau media sosial"
            className={vertical ? "h-[540px] w-full" : "aspect-video w-full"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : source.trim() ? (
        <p className="text-xs text-amber-700">
          Link-nya belum bisa dikenali. Tempel share link TikTok/YouTube/Instagram
          atau kode embed lengkap.
        </p>
      ) : (
        <p className="text-xs text-neutral-500">
          Tempel share link atau kode embed untuk melihat pratinjau.
        </p>
      )}

      {ref.videoId ? (
        <p className="text-xs text-neutral-500">
          {platformLabel(ref.platform)} · ID:{" "}
          <span className="font-medium text-neutral-700">{ref.videoId}</span>
          {ref.author ? ` · @${ref.author}` : ""}
        </p>
      ) : null}

      {help ? <p className="text-xs text-neutral-500">{help}</p> : null}
    </div>
  );
}
