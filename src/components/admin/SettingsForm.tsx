"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/admin/profile/actions";
import type { SettingField } from "@/lib/site-settings";

export default function SettingsForm({
  fields,
  values,
}: {
  fields: SettingField[];
  values: Record<string, string>;
}) {
  const [state, action, pending] = useActionState(saveSettings, {
    ok: false,
    message: "",
  });

  const groups = [...new Set(fields.map((f) => f.group))];

  return (
    <form action={action} className="space-y-6">
      {groups.map((group) => (
        <section
          key={group}
          className="rounded-xl border border-neutral-200 bg-white p-5"
        >
          <h2 className="font-heading text-lg font-bold text-black">{group}</h2>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {fields
              .filter((f) => f.group === group)
              .map((field) => {
                const value = values[field.key] ?? "";

                if (field.type === "boolean") {
                  return (
                    <label
                      key={field.key}
                      className="flex items-center gap-2 text-sm text-neutral-700"
                    >
                      <input type="hidden" name={field.key} value="0" />
                      <input
                        type="checkbox"
                        name={field.key}
                        value="1"
                        defaultChecked={value === "true"}
                        className="h-4 w-4 accent-[#3a1012]"
                      />
                      {field.label}
                    </label>
                  );
                }

                return (
                  <div key={field.key} className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-neutral-700">
                      {field.label}
                    </label>
                    {field.type === "textarea" || field.type === "lines" ? (
                      <textarea
                        name={field.key}
                        defaultValue={value}
                        rows={field.type === "lines" ? 5 : 3}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
                      />
                    ) : (
                      <input
                        type="text"
                        name={field.key}
                        defaultValue={value}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none"
                      />
                    )}
                    {field.help ? (
                      <p className="mt-1 text-xs text-neutral-500">{field.help}</p>
                    ) : null}
                  </div>
                );
              })}
          </div>
        </section>
      ))}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-maroon-dark px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : "Simpan Pengaturan"}
        </button>
        {state.message ? (
          <span className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
