"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

/**
 * Polling status pembayaran di halaman detail order.
 *
 * Di sandbox lokal tidak ada webhook publik, jadi pembeli yang baru kembali
 * dari halaman Snap memeriksa statusnya langsung ke Midtrans lewat
 * /api/payment/status/[orderId].
 */
export default function PaymentStatusChecker({
  orderId,
  initialStatus,
}: {
  orderId: string;
  initialStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(initialStatus !== "PENDING");

  async function check(silent = false) {
    if (!silent) setChecking(true);
    try {
      const res = await fetch(`/api/payment/status/${orderId}`, {
        cache: "no-store",
      });
      const data = (await res.json()) as {
        status?: string;
        transactionStatus?: string | null;
        error?: string;
      };

      if (data.status) {
        setStatus(data.status);
        if (data.status === "PAID" || data.status === "COMPLETED") {
          setDone(true);
          setMessage("Pembayaran diterima. Buku sudah masuk Pustaka Saya.");
          router.refresh();
        } else if (data.status === "CANCELLED") {
          setDone(true);
          setMessage("Pembayaran dibatalkan atau kedaluwarsa.");
        } else if (!silent) {
          setMessage(
            "Pembayaran belum diterima. Selesaikan di halaman Midtrans ya.",
          );
        }
      } else if (!silent) {
        setMessage(data.error ?? "Gagal memeriksa status pembayaran.");
      }
    } catch {
      if (!silent) setMessage("Gagal menghubungi server.");
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (done) return;

    // Cek sekali setelah kembali dari halaman Snap.
    const first = setTimeout(() => void check(true), 1500);
    const interval = setInterval(() => void check(true), 8000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, orderId]);

  if (done && !message) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!done ? <Loader2 size={16} className="animate-spin" /> : null}
          <span>
            {done
              ? (message ?? "Status pembayaran terakhir.")
              : "Menunggu pembayaran diterima…"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void check()}
          disabled={checking}
          className="inline-flex items-center gap-1 rounded-full border border-amber-300 px-3 py-1 text-xs font-medium text-amber-900 disabled:opacity-60"
        >
          <RefreshCw size={12} className={checking ? "animate-spin" : ""} />
          Cek status
        </button>
      </div>
      {message && done ? (
        <p className="mt-2 text-xs">{message}</p>
      ) : null}
    </div>
  );
}
