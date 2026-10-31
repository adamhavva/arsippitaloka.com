"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

/**
 * Tombol "Hapus" pada baris keranjang. DELETE /api/cart {bookId}, lalu
 * refresh server component (daftar + ringkasan harga) dan siarkan
 * `cart:changed` untuk badge navbar.
 */
export default function RemoveFromCartButton({ bookId }: { bookId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      const data = (await res.json()) as { count?: number };

      if (typeof data.count === "number") {
        window.dispatchEvent(
          new CustomEvent("cart:changed", { detail: { count: data.count } }),
        );
      }

      router.refresh();
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 transition hover:text-red-600 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <Trash2 size={14} />
      )}
      Hapus
    </button>
  );
}
