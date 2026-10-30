"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Pengalihan dari sisi klien untuk URL lama.
 *
 * `redirect()` dari server tidak bisa dipakai di sini karena halamannya
 * sudah mulai di-stream (dynamic API dibaca di dalam Suspense), jadi
 * pengalihan dilakukan di browser — URL tetap berubah tanpa reload penuh.
 */
export default function RedirectTo({ to }: { to: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [to, router]);

  return <p className="text-sm text-neutral-500">Mengalihkan…</p>;
}
