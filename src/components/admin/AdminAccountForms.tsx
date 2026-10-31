"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { UserRound } from "lucide-react";
import {
  updateAdminName,
  changeAdminPassword,
  updateAdminPhoto,
} from "@/app/admin/akun/actions";
import { fileToDataUrl, isDataUrl } from "@/lib/file-to-data-url";

export default function AdminAccountForms({
  name,
  image,
}: {
  name: string;
  image: string | null;
}) {
  const [nameState, nameAction, namePending] = useActionState(updateAdminName, {
    ok: false,
    message: "",
  });
  const [passState, passAction, passPending] = useActionState(
    changeAdminPassword,
    { ok: false, message: "" },
  );
  const [photoState, photoAction, photoPending] = useActionState(
    updateAdminPhoto,
    { ok: false, message: "" },
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(image);
  const [fileError, setFileError] = useState<string | null>(null);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Gagal membaca file.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Nama */}
      <form
        action={nameAction}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h2 className="font-heading text-lg font-bold text-black">
          Nama Tampilan
        </h2>
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
          <p
            className={`text-sm ${nameState.ok ? "text-green-700" : "text-red-600"}`}
          >
            {nameState.message}
          </p>
        ) : null}
      </form>

      {/* Foto */}
      <form
        action={photoAction}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h2 className="font-heading text-lg font-bold text-black">Foto Profil</h2>
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100">
            {preview ? (
              <Image
                src={preview}
                alt="Pratinjau foto"
                width={64}
                height={64}
                unoptimized={isDataUrl(preview)}
                className="h-16 w-16 object-cover"
              />
            ) : (
              <UserRound size={28} className="text-neutral-400" />
            )}
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Pilih gambar
            </button>
            {preview ? (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  setFileError(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="rounded-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Hapus
              </button>
            ) : null}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          className="hidden"
        />
        {/* Nilai yang dikirim ke server: data URL base64 (atau kosong = hapus). */}
        <input type="hidden" name="image" value={preview ?? ""} />
        {fileError ? <p className="text-sm text-red-600">{fileError}</p> : null}
        <button
          type="submit"
          disabled={photoPending}
          className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {photoPending ? "Menyimpan…" : "Simpan Foto"}
        </button>
        {photoState.message ? (
          <p
            className={`text-sm ${photoState.ok ? "text-green-700" : "text-red-600"}`}
          >
            {photoState.message}
          </p>
        ) : null}
      </form>

      {/* Password */}
      <form
        action={passAction}
        className="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2"
      >
        <h2 className="font-heading text-lg font-bold text-black">
          Ganti Password
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
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
        </div>
        <button
          type="submit"
          disabled={passPending}
          className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {passPending ? "Menyimpan…" : "Ganti Password"}
        </button>
        {passState.message ? (
          <p
            className={`text-sm ${passState.ok ? "text-green-700" : "text-red-600"}`}
          >
            {passState.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}
