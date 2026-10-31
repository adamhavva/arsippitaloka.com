"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Tombol "Lanjut ke Pembayaran" di halaman keranjang.
 *
 * POST /api/cart/checkout → arahkan ke halaman Snap Midtrans (berbayar) atau
 * langsung ke /akun/orders/... (semua gratis). 401 → login.
 */
export default function CartCheckoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/cart/checkout", { method: "POST" });

      if (res.status === 401) {
        router.push("/login?callbackUrl=/keranjang");
        return;
      }

      const data = (await res.json()) as {
        redirectUrl?: string;
        error?: string;
      };

      if (!res.ok || !data.redirectUrl) {
        setError(data.error ?? "Gagal memproses pembayaran. Coba lagi.");
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
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-maroon-dark px-6 py-3 text-sm font-semibold text-white transition hover:bg-maroon disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "Memproses…" : "Lanjut ke Pembayaran"}
      </button>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
