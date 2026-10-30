"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Tombol "Beli Sekarang" — membuat order di /api/checkout lalu mengarahkan
 * pembeli ke halaman Snap Midtrans.
 */
export default function BuyButton({
  bookId,
  loginUrl,
  label = "Beli Sekarang",
}: {
  bookId: string;
  loginUrl: string;
  label?: string;
}) {
  const router = useRouter();
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
        router.push(loginUrl);
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
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "Memproses…" : label}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
