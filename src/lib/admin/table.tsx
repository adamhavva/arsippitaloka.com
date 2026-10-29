import Link from "next/link";
import type { EntityDef, FieldDef } from "./entities";
import ConfirmButton from "@/components/admin/ConfirmButton";

function formatCell(value: unknown, field: FieldDef): string {
  if (value === null || value === undefined || value === "") return "—";
  if (field.type === "boolean") return value ? "Ya" : "Tidak";
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(value);
  }
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default function EntityTable({
  def,
  fields,
  rows,
}: {
  def: EntityDef;
  fields: FieldDef[];
  rows: Record<string, unknown>[];
}) {
  const listFields = fields.filter((f) => f.list);

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            {listFields.map((f) => (
              <th key={f.name} className="px-4 py-3 font-medium">
                {f.label}
              </th>
            ))}
            <th className="px-4 py-3 font-medium">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={listFields.length + 1}
                className="px-4 py-8 text-center text-neutral-500"
              >
                Belum ada data.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={String(row.id)} className="border-b border-neutral-100 last:border-0">
                {listFields.map((f) => (
                  <td
                    key={f.name}
                    className="px-4 py-3 align-middle text-neutral-800"
                  >
                    <span className="line-clamp-2">
                      {formatCell(row[f.name], f)}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/${def.key}?edit=${String(row.id)}`}
                      className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      Ubah
                    </Link>
                    <ConfirmButton entityKey={def.key} id={String(row.id)} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
