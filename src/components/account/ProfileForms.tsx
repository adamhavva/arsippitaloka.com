"use client";

import { useActionState } from "react";
import {
  updateProfileName,
  changePassword,
} from "@/app/akun/profil/actions";

export default function ProfileForms({ name }: { name: string }) {
  const [nameState, nameAction, namePending] = useActionState(updateProfileName, {
    ok: false,
    message: "",
  });
  const [passState, passAction, passPending] = useActionState(changePassword, {
    ok: false,
    message: "",
  });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        action={nameAction}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h2 className="font-heading text-lg font-bold text-black">Nama Tampilan</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Nama
          </label>
          <input
            type="text"
            name="name"
            defaultValue={name}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={namePending}
          className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {namePending ? "Menyimpan…" : "Simpan Nama"}
        </button>
        {nameState.message ? (
          <p className={`text-sm ${nameState.ok ? "text-green-700" : "text-red-600"}`}>
            {nameState.message}
          </p>
        ) : null}
      </form>

      <form
        action={passAction}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h2 className="font-heading text-lg font-bold text-black">
          Ganti Password
        </h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Password lama
          </label>
          <input
            type="password"
            name="currentPassword"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Password baru
          </label>
          <input
            type="password"
            name="newPassword"
            required
            minLength={8}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Ulangi password baru
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={8}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={passPending}
          className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {passPending ? "Menyimpan…" : "Ganti Password"}
        </button>
        {passState.message ? (
          <p className={`text-sm ${passState.ok ? "text-green-700" : "text-red-600"}`}>
            {passState.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
