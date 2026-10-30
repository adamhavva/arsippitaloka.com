import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/require-admin";
import { getEntity } from "@/lib/admin/entities";
import { getDelegate } from "@/lib/admin/delegates";
import EntityTable from "@/lib/admin/table";
import EntityForm from "@/components/admin/EntityForm";
import Pagination from "@/components/Pagination";
import { clampPage, parsePage, parsePerPage } from "@/lib/pagination";
import type { FieldDef } from "@/lib/admin/entities";

export default function AdminEntityPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>;
  searchParams: Promise<{ edit?: string; page?: string; per?: string }>;
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
  searchParams: Promise<{ edit?: string; page?: string; per?: string }>;
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

  // Pagination: minimal 5 baris per halaman.
  const perPage = parsePerPage(sp.per);
  const total = await delegate.count();
  const page = clampPage(parsePage(sp.page), total, perPage);

  const rows: Record<string, unknown>[] = await delegate.findMany({
    orderBy,
    skip: (page - 1) * perPage,
    take: perPage,
  });

  // Isi opsi select yang sumbernya entitas lain (mis. tab konten untuk buku).
  const fields: FieldDef[] = [];
  const categoryOptions: {
    value: string;
    label: string;
    icon: string | null;
  }[] = [];

  for (const field of def.fields) {
    if (!field.source) {
      fields.push(field);
      continue;
    }
    const sourceDef = getEntity(field.source.entity);
    const sourceDelegate = sourceDef ? getDelegate(sourceDef.model) : undefined;

    // Field kategori butuh ikon juga supaya bisa ditampilkan sebagai kartu.
    const select =
      field.type === "category"
        ? { id: true, name: true, icon: true }
        : { id: true, [field.source.labelField]: true };

    const sourceRows: Record<string, unknown>[] = sourceDelegate
      ? await sourceDelegate.findMany({
          select,
          orderBy: sourceDef?.orderBy
            ? { [sourceDef.orderBy.field]: sourceDef.orderBy.dir }
            : undefined,
        })
      : [];

    if (field.type === "category") {
      for (const row of sourceRows) {
        categoryOptions.push({
          value: String(row.id),
          label: String(row.name),
          icon: row.icon ? String(row.icon) : null,
        });
      }
    }

    fields.push({
      ...field,
      options: sourceRows.map((row) => ({
        value: String(row.id),
        label: String(
          field.type === "category" ? row.name : row[field.source!.labelField],
        ),
      })),
    });
  }

  // Baris yang sedang diedit boleh berada di halaman lain → ambil terpisah.
  const editing = editId
    ? ((await delegate.findUnique({ where: { id: editId } })) as Record<
        string,
        unknown
      > | null)
    : null;

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
          categoryOptions={categoryOptions}
        />
      ) : (
        <EntityForm
          def={def}
          fields={fields}
          values={{}}
          id={null}
          categoryOptions={categoryOptions}
        />
      )}

      <EntityTable def={def} fields={fields} rows={rows} />

      <Pagination
        basePath={`/admin/${def.key}`}
        page={page}
        perPage={perPage}
        total={total}
        label={def.label.toLowerCase()}
      />
    </div>
  );
}
