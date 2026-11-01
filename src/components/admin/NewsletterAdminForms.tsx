"use client";

import { useActionState } from "react";
import { addSubscriber, sendAnnouncement } from "@/app/admin/newsletter/actions";
import Spinner from "@/components/Spinner";

/**
 * Form admin newsletter:
 * - tambah pelanggan manual,
 * - kirim pengumuman bebas ke semua pelanggan.
 */
export default function NewsletterAdminForms() {
  const [addState, addAction, addPending] = useActionState(addSubscriber, {
    ok: false,
    message: "",
  });
  const [sendState, sendAction, sendPending] = useActionState(sendAnnouncement, {
    ok: false,
    message: "",
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        action={addAction}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h2 className="font-heading text-lg font-bold text-black">
          Tambah Pelanggan
        </h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Nama (opsional)
          </label>
          <input
            name="name"
            placeholder="Nama pelanggan"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="nama@email.com"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={addPending}
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-maroon-dark px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {addPending ? <Spinner size={16} /> : null}
          Tambah
        </button>
        {addState.message ? (
          <p
            className={`text-sm ${
              addState.ok ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {addState.message}
          </p>
        ) : null}
      </form>

      <form
        action={sendAction}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h2 className="font-heading text-lg font-bold text-black">
          Kirim Pengumuman
        </h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Subjek
          </label>
          <input
            name="subject"
            required
            placeholder="Contoh: Koleksi e-book baru sudah hadir"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Isi pengumuman
          </label>
          <textarea
            name="body"
            required
            rows={5}
            placeholder="Tulis isi emailnya di sini. Baris baru menjadi paragraf baru."
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Tautan (opsional)
          </label>
          <input
            name="path"
            placeholder="/buku/e-book/contoh-buku"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={sendPending}
          className="inline-flex min-h-9 items-center gap-2 rounded-full bg-maroon px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {sendPending ? <Spinner size={16} /> : null}
          Kirim ke semua pelanggan
        </button>
        {sendState.message ? (
          <p
            className={`text-sm ${
              sendState.ok ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {sendState.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
