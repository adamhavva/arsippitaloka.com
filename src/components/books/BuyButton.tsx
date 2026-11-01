"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Tombol "Beli Sekarang" — membuat order di /api/checkout lalu mengarahkan
 * pembeli ke halaman Snap Midtrans.
 *
 * `loginUrl` opsional: kalau tidak diberikan (mis. dari kartu buku), tujuan
 * login dihitung saat diklik dari URL halaman sekarang. `compact` memberi
 * ukuran kecil agar pas di kartu. `className` dipakai kartu untuk mengatur
 * lebar tombol (mis. `w-full`).
 */
export default function BuyButton({
  bookId,
  loginUrl,
  label = "Beli Sekarang",
  compact = false,
  className = "",
  wrapperClassName = "",
}: {
  bookId: string;
  loginUrl?: string;
  label?: string;
  compact?: boolean;
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

      const data = (await res.json()) as {
        redirectUrl?: string;
        error?: string;
      };

      if (res.status === 401) {
        router.push(
          loginUrl ?? `/login?callbackUrl=${encodeURIComponent(pathname)}`,
        );
        return;
      }

      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? "Gagal membuat transaksi. Coba lagi.");
        setLoading(false);
        return;
      }

      window.location.href = data.redirectUrl;
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
        ) : null}
        <span className="truncate">{loading ? "Memproses…" : label}</span>
      </button>
      {error ? (
        <p className="mt-1 text-[11px] leading-tight text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
