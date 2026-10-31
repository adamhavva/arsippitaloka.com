"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Spinner from "@/components/Spinner";

/**
 * Formulir kontak — mengirim pesan ke /api/contact (SMTP).
 *
 * Kalau fitur dimatikan admin, server membalas 503 dan pesan error tampil.
 */
export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          subject: String(data.get("subject") ?? ""),
          message: String(data.get("message") ?? ""),
        }),
      });

      const json = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(json.error ?? "Gagal mengirim pesan.");
        setStatus("error");
        return;
      }

      form.reset();
      setStatus("sent");
    } catch {
      setError("Gagal menghubungi server. Coba lagi.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-medium text-green-800">Pesan terkirim. Terima kasih!</p>
        <p className="mt-1 text-sm text-green-700">
          Kami akan membalas ke email Anda.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm font-medium text-maroon hover:underline"
        >
          Kirim pesan lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          name="name"
          required
          placeholder="Nama"
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-maroon"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-maroon"
        />
      </div>
      <input
        name="subject"
        placeholder="Subjek (opsional)"
        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-maroon"
      />
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Tulis pesan Anda…"
        className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm outline-none focus:border-maroon"
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full bg-maroon-dark px-6 py-2.5 text-sm font-medium text-white transition hover:bg-maroon disabled:opacity-60"
      >
        {status === "sending" ? (
          <>
            <Spinner size={16} /> Mengirim…
          </>
        ) : (
          <>
            <Send size={16} /> Kirim Pesan
          </>
        )}
      </button>
    </form>
  );
}
