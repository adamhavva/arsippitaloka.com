"use client";

import { useMemo, useRef, useState } from "react";
import { parseSocialRef, SOCIAL_IFRAME_ALLOW } from "@/lib/social";

/**
 * Input media sosial generik (TikTok / YouTube / Instagram).
 *
 * Admin boleh menempelkan share link atau kode embed — id video, platform,
 * dan URL embed-nya diambil otomatis lalu diisi ke field form yang
 * accelerator (input video ID, select platform, input URL embed).
 *
 * Field yang disobut tetap punya `name` masing-masing di `entities.ts`
 * (`platform`, `videoId`, `embedUrl`), jadi tidak ada kolom tambahan di DB.
 */
export default function SocialField({
  name,
  label,
  value,
  help,
  placeholder,
}: {
  name: string;
  label: string;
  value?: string | null;
  help?: string;
  placeholder?: string;
}) {
  const [paste, setPaste] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  const ref = useMemo(() => parseSocialRef(paste), [paste]);

  function applyRef(source: string) {
    setPaste(source);

    const form = wrapperRef.current?.closest("form");
    if (!form) return;

    const parsed = parseSocialRef(source);
    if (!parsed.videoId) return;

    // Isi id video.
    const videoInput = form.elements.namedItem(name) as HTMLInputElement | null;
    if (videoInput) videoInput.value = parsed.videoId;

    // Samakan platform dengan hasil pembacaan link.
    const platformSelect = form.elements.namedItem(
      "platform",
    ) as HTMLSelectElement | null;
    if (platformSelect) {
      const exists = Array.from(platformSelect.options).some(
        (option) => option.value === parsed.platform,
      );
      if (exists) platformSelect.value = parsed.platform;
    }

    // URL embed ikut diisi supaya admin tidak perlu menyusunnya manual.
    if (parsed.embedUrl) {
      const embedInput = form.elements.namedItem(
        "embedUrl",
      ) as HTMLInputElement | null;
      if (embedInput) embedInput.value = parsed.embedUrl;
    }
  }

  return (
    <div ref={wrapperRef} className="space-y-2">
      <span className="block text-sm font-medium text-neutral-700">{label}</span>

      <input
        type="text"
        name={name}
        defaultValue={value ?? ""}
        required
        placeholder={placeholder ?? "7659105916377173269"}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
      />

      <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-3">
        <label className="block text-xs font-medium text-neutral-600">
          Tempel share link atau kode embed (opsional)
        </label>
        <textarea
          value={paste}
          onChange={(e) => applyRef(e.target.value)}
          rows={2}
          placeholder='https://www.tiktok.com/@user/video/7669105916377173269 atau kode embed <iframe src="…">'
          className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs focus:border-maroon focus:outline-none"
        />

        {ref.videoId ? (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-neutral-600">
              Terdeteksi:{" "}
              <span className="font-medium text-neutral-800">
                {ref.platform.toUpperCase()}
              </span>{" "}
              · Video ID{" "}
              <span className="font-medium text-neutral-800">
                {ref.videoId}
              </span>
              {ref.author ? ` · @${ref.author}` : ""}
            </p>
            {ref.embedUrl ? (
              <div className="mx-auto max-w-[280px] overflow-hidden rounded-lg border border-neutral-200 bg-black">
                <iframe
                  src={ref.embedUrl}
                  title="Pratinjau media sosial"
                  className="h-[420px] w-full"
                  allow={SOCIAL_IFRAME_ALLOW}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : null}
          </div>
        ) : paste.trim() ? (
          <p className="mt-2 text-xs text-amber-700">
            Link-nya belum bisa dibaca. Tempel share link yang memuat id video
            (mis. <span className="font-medium">/video/&lt;id&gt;</span> untuk
            TikTok, <span className="font-medium">?v=</span> untuk YouTube, atau{" "}
            <span className="font-medium">/p/&lt;shortcode&gt;</span> untuk
            Instagram).
          </p>
        ) : null}
      </div>

      {help ? <p className="text-xs text-neutral-500">{help}</p> : null}
    </div>
  );
}
