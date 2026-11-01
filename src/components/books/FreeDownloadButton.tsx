"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Download, Loader2 } from "lucide-react";

/**
 * Tombol "Download" untuk buku GRATIS pada kartu.
 *
 * Alurnya:
 * 1. POST /api/checkout {bookId} → buku gratis langsung jadi order PAID,
 *    sehingga tercatat sebagai transaksi di "Akun Saya".
 * 2. Setelah diklaim, file dibuka di tab baru lewat /api/read/[bookId]
 *    (PDF/gambar tampil inline sebagai preview; format lain terunduh).
 *
 * Belum login (401) → diarahkan ke /login dengan callback kembali ke sini.
 * `className` dipakai kartu untuk mengatur lebar tombol (mis. `w-full`).
 */
export default function FreeDownloadButton({
  bookId,
  compact = false,
  label = "Download",
  className = "",
  wrapperClassName = "",
}: {
  bookId: string;
  compact?: boolean;
  label?: string;
  /** Kelas tambahan untuk tombolnya. */
  className?: string;
  /** Kelas tambahan untuk pembungkus tombol (dipakai kartu untuk mengatur lebar). */
  wrapperClassName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };

      if (!res.ok && res.status !== 200) {
        setError(data.error ?? "Gagal mengambil buku. Coba lagi.");
        setLoading(false);
        return;
      }

      // Buku sudah diklaim / sudah dimiliki → buka file di tab baru.
      window.open(`/api/read/${bookId}`, "_blank", "noopener,noreferrer");
      setLoading(false);
      // Segarkan supaya status kepemilikan (mis. di /akun) ikut terbarui.
      router.refresh();
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className={`min-w-0 ${wrapperClassName}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-full bg-maroon-dark font-medium text-white transition hover:bg-maroon disabled:opacity-60 ${
          compact ? "px-3 text-xs" : "gap-2 px-5 py-2 text-sm"
        } ${className}`}
      >
        {loading ? (
          <Loader2 size={compact ? 14 : 16} className="animate-spin" />
        ) : (
          <Download size={compact ? 14 : 16} />
        )}
        <span className="truncate">{loading ? "Memproses…" : label}</span>
      </button>
      {error ? (
        <p className="mt-1 text-[11px] leading-tight text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
