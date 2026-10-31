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
 */
export default function FreeDownloadButton({
  bookId,
  compact = false,
  label = "Download",
}: {
  bookId: string;
  compact?: boolean;
  label?: string;
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

      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

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
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-full bg-maroon-dark font-medium text-white transition hover:bg-maroon disabled:opacity-60 ${
          compact ? "px-3 py-1.5 text-xs" : "gap-2 px-5 py-2 text-sm"
        }`}
      >
        {loading ? (
          <Loader2 size={compact ? 14 : 16} className="animate-spin" />
        ) : (
          <Download size={compact ? 14 : 16} />
        )}
        {loading ? "Memproses…" : label}
      </button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
