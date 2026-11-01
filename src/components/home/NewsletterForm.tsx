"use client";

import { useState } from "react";
import Spinner from "@/components/Spinner";

/**
 * Form subscribe newsletter di footer.
 *
 * Kirim email ke `/api/newsletter/subscribe`; afterwards email konfirmasi
 * (selamat datang) dikirim otomatis ke kotak masuk.
 */
export default function NewsletterForm({
  placeholder,
  buttonLabel,
  consentText,
}: {
  placeholder: string;
  buttonLabel: string;
  consentText: string;
}) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const value = email.trim();
    if (!value) {
      setStatus({ ok: false, message: "Email wajib diisi." });
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "footer" }),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        error?: string;
      } | null;

      if (!response.ok) {
        setStatus({
          ok: false,
          message: data?.error ?? "Gagal berlangganan. Coba lagi nanti.",
        });
        return;
      }

      setEmail("");
      setStatus({
        ok: true,
        message: data?.message ?? "Berhasil berlangganan.",
      });
    } catch {
      setStatus({
        ok: false,
        message: "Tidak bisa terhubung. Coba lagi nanti.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <form
        onSubmit={handleSubmit}
        className="flex overflow-hidden rounded-full bg-white p-1.5"
      >
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={placeholder}
          aria-label="Email untuk subscribe newsletter"
          autoComplete="email"
          className="min-h-11 min-w-0 flex-1 bg-transparent px-4 py-2 text-sm text-black outline-none placeholder:text-neutral-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex min-h-11 items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60 sm:px-5"
        >
          {pending ? <Spinner size={16} /> : buttonLabel}
        </button>
      </form>

      <p className="mt-2 text-xs text-white/60 sm:text-sm max-w-xs">
        {consentText}
      </p>

      {status ? (
        <p
          role="status"
          className={`mt-2 text-xs sm:text-sm ${
            status.ok ? "text-[#ffe9a8]" : "text-red-300"
          }`}
        >
          {status.message}
        </p>
      ) : null}
    </div>
  );
}
