import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getEntity } from "@/lib/admin/entities";
import { getDelegate } from "@/lib/admin/delegates";
import EntityTable from "@/lib/admin/table";
import EntityForm from "@/components/admin/EntityForm";
import type { FieldDef } from "@/lib/admin/entities";

export default function AdminEntityPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <AdminEntityPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminEntityPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  await connection();

  const admin = await requireAdmin();
  if (!admin) notFound();

  const { entity } = await params;
  const def = getEntity(entity);
  if (!def) notFound();

  const delegate = getDelegate(def.model);
  if (!delegate) notFound();

  const sp = await searchParams;
  const editId = sp.edit ?? null;

  // Prisma memakai { [field]: dir }, bukan { field, dir }.
  const orderBy = def.orderBy
    ? { [def.orderBy.field]: def.orderBy.dir }
    : undefined;

  const rows: Record<string, unknown>[] = await delegate.findMany({
    orderBy,
  });

  // Isi opsi select yang sumbernya entitas lain (mis. tab konten untuk buku).
  const fields: FieldDef[] = [];
  for (const field of def.fields) {
    if (!field.source) {
      fields.push(field);
      continue;
    }
    const sourceDef = getEntity(field.source.entity);
    const sourceDelegate = sourceDef ? getDelegate(sourceDef.model) : undefined;
    const sourceRows: Record<string, unknown>[] = sourceDelegate
      ? await sourceDelegate.findMany({
          select: { id: true, [field.source.labelField]: true },
          orderBy: sourceDef?.orderBy
            ? { [sourceDef.orderBy.field]: sourceDef.orderBy.dir }
            : undefined,
        })
      : [];
    fields.push({
      ...field,
      options: sourceRows.map((row) => ({
        value: String(row.id),
        label: String(row[field.source!.labelField]),
      })),
    });
  }

  const editing = editId ? rows.find((row) => String(row.id) === editId) : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-black">{def.label}</h1>
        <p className="text-sm text-neutral-500">
          Kelola data {def.label.toLowerCase()} — perubahan langsung tampil di situs.
        </p>
      </header>

      {editing ? (
        <EntityForm
          def={def}
          fields={fields}
          values={editing}
          id={String(editing.id)}
        />
      ) : (
        <EntityForm def={def} fields={fields} values={{}} id={null} />
      )}

      <EntityTable def={def} fields={fields} rows={rows} />
    </div>
  );
}
