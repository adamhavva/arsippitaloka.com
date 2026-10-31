"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ShoppingCart } from "lucide-react";

/**
 * Tombol "Keranjang" pada kartu buku.
 *
 * POST /api/cart {bookId}. Belum login (401) → diarahkan ke /login dengan
 * callback kembali ke halaman ini. Sukses → label sementara + event global
 * `cart:changed` supaya badge ikon tas di navbar ikut diperbarui.
 */
export default function AddToCartButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setNote(null);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }

      const data = (await res.json()) as {
        ok?: boolean;
        status?: "added" | "exists" | "owned" | "invalid";
        count?: number;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Gagal menambahkan ke keranjang.");
        setLoading(false);
        return;
      }

      const labels: Record<string, string> = {
        added: "✓ Ditambahkan",
        exists: "Sudah di keranjang",
        owned: "Sudah dimiliki",
      };
      setNote(labels[data.status ?? "added"] ?? "✓ Ditambahkan");
      setLoading(false);

      if (typeof data.count === "number") {
        window.dispatchEvent(
          new CustomEvent("cart:changed", { detail: { count: data.count } }),
        );
      }

      window.setTimeout(() => setNote(null), 2500);
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full border border-maroon-dark px-3 py-1.5 text-xs font-medium text-maroon-dark transition hover:bg-maroon-dark hover:text-white disabled:opacity-60"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <ShoppingCart size={14} />
      )}
      {error ? (
        <span className="text-red-600">{error}</span>
      ) : (
        <span>{note ?? "Keranjang"}</span>
      )}
    </button>
  );
}
