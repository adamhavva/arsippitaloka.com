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

/** Tombol aksi tabel — ukuran touch-target ≥48px di layar kecil untuk aksesibilitas mobile. */
function ActionButtons({ entityKey, id, editHref }: { entityKey: string; id: string; editHref: string }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={editHref}
        className="rounded-full border border-neutral-300 px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 active:scale-95 sm:py-1"
      >
        Ubah
      </Link>
      <ConfirmButton entityKey={entityKey} id={id} />
    </div>
  );
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
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] uppercase tracking-wide text-neutral-500 sm:text-xs">
          <tr>
            {listFields.map((f) => (
              <th key={f.name} className="px-3 py-3 font-medium sm:px-4 sm:py-3">
                {f.label}
              </th>
            ))}
            <th className="px-3 py-3 font-medium sm:px-4 sm:py-3">Aksi</th>
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
                    className="whitespace-normal break-words px-3 py-3 align-middle text-neutral-800 sm:px-4"
                  >
                    <span className="line-clamp-2">
                      {formatCell(row[f.name], f)}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-3 sm:px-4">
                  <ActionButtons
                    entityKey={def.key}
                    id={String(row.id)}
                    editHref={`/admin/${def.key}?edit=${String(row.id)}`}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
