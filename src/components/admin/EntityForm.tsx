"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { saveEntity, deleteEntity } from "@/lib/admin/actions";
import type { FieldDef, EntityDef } from "@/lib/admin/entities";
import ImageField from "./ImageField";

type Props = {
  def: EntityDef;
  fields: FieldDef[];
  values?: Record<string, unknown>;
  id?: string | null;
};

function toInputValue(value: unknown): string | number {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "boolean") return value ? "1" : "";
  if (typeof value === "string" && Array.isArray(value)) return "";
  if (Array.isArray(value)) return value.join("\n");
  return value as string | number;
}

export default function EntityForm({ def, fields, values = {}, id = null }: Props) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    saveEntity.bind(null, def.key, id),
    { ok: false, message: "" },
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <form action={action} className="space-y-5 rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-black">
          {id ? `Ubah ${def.singular}` : `Tambah ${def.singular}`}
        </h2>
        {id ? (
          <button
            type="button"
            onClick={() => router.push(`/admin/${def.key}`)}
            className="text-sm text-neutral-500 hover:text-neutral-800"
          >
            Batal
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => {
          const error = state.fieldErrors?.[field.name];
          const raw = values[field.name];

          if (field.type === "boolean") {
            return (
              <label key={field.name} className="flex items-center gap-2 text-sm text-neutral-700">
                <input type="hidden" name={field.name} value="0" />
                <input
                  type="checkbox"
                  name={field.name}
                  value="1"
                  defaultChecked={raw === true}
                  className="h-4 w-4 accent-[#3a1012]"
                />
                {field.label}
              </label>
            );
          }

          if (field.type === "image" || field.type === "file") {
            return (
              <div key={field.name} className="md:col-span-2">
                <ImageField
                  name={field.name}
                  label={field.label}
                  kind={field.type}
                  value={(raw as string) ?? null}
                  help={field.help}
                />
              </div>
            );
          }

          if (field.type === "textarea" || field.type === "lines") {
            return (
              <div key={field.name} className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {field.label}
                </label>
                <textarea
                  name={field.name}
                  defaultValue={toInputValue(raw)}
                  required={field.required}
                  placeholder={field.placeholder}
                  rows={field.type === "lines" ? 5 : 3}
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
                />
                {field.help ? (
                  <p className="mt-1 text-xs text-neutral-500">{field.help}</p>
                ) : null}
                {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
              </div>
            );
          }

          if (field.type === "select") {
            return (
              <div key={field.name}>
                <label className="mb-1 block text-sm font-medium text-neutral-700">
                  {field.label}
                </label>
                <select
                  name={field.name}
                  defaultValue={toInputValue(raw)}
                  required={field.required}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-maroon focus:outline-none"
                >
                  <option value="">— pilih —</option>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
              </div>
            );
          }

          return (
            <div key={field.name}>
              <label className="mb-1 block text-sm font-medium text-neutral-700">
                {field.label}
              </label>
              <input
                type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                name={field.name}
                step={field.step}
                defaultValue={toInputValue(raw)}
                required={field.required}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
              />
              {field.help ? (
                <p className="mt-1 text-xs text-neutral-500">{field.help}</p>
              ) : null}
              {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
            </div>
          );
        })}
      </div>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>
          {state.message}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : "Simpan"}
        </button>

        {id ? (
          <>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="rounded-full border border-red-200 px-5 py-2 text-sm font-medium text-red-600"
            >
              Hapus
            </button>
            {confirmOpen ? (
              <span className="flex items-center gap-2 text-sm">
                Yakin hapus {def.singular} ini?
                <button
                  type="button"
                  onClick={async () => {
                    const res = await deleteEntity(def.key, id!);
                    setConfirmOpen(false);
                    if (res.ok) router.push(`/admin/${def.key}`);
                    else alert(res.message);
                  }}
                  className="rounded-full bg-red-600 px-4 py-1.5 text-xs font-medium text-white"
                >
                  Ya, hapus
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  className="text-xs text-neutral-500"
                >
                  Batal
                </button>
              </span>
            ) : null}
          </>
        ) : null}
      </div>
    </form>
  );
}
