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
import PageLoader from "@/components/PageLoader";

export default function AdminEntityPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>;
  searchParams: Promise<{
    edit?: string;
    page?: string;
    per?: string;
    q?: string;
    platform?: string;
  }>;
}) {
  return (
    <Suspense fallback={<PageLoader />}>
      <AdminEntityPageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminEntityPageContent({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string }>;
  searchParams: Promise<{
    edit?: string;
    page?: string;
    per?: string;
    q?: string;
    platform?: string;
  }>;
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

  // Pencarian generik: cocokkan field judul entitas (dan penulis untuk buku).
  const q = sp.q?.trim();
  const hasAuthor = def.fields.some((field) => field.name === "author");

  // Filter platform (mis. /admin/social?platform=youtube) hanya berlaku untuk
  // entitas yang punya field `platform` — nilainya dibatasi ke daftar sah.
  const hasPlatform = def.fields.some((field) => field.name === "platform");
  const platform =
    hasPlatform &&
    sp.platform &&
    ["tiktok", "youtube", "instagram"].includes(sp.platform)
      ? sp.platform
      : undefined;

  const conditions: Record<string, unknown>[] = [];
  if (q) {
    conditions.push({
      OR: [
        { [def.titleField]: { contains: q, mode: "insensitive" } },
        ...(hasAuthor
          ? [{ author: { contains: q, mode: "insensitive" } }]
          : []),
      ],
    });
  }
  if (platform) {
    conditions.push({ platform });
  }
  const where = conditions.length > 0 ? { AND: conditions } : {};

  // Parameter yang harus dibawa saat pindah halaman / submit pencarian.
  const carryParams: Record<string, string> = {};
  if (q) carryParams.q = q;
  if (platform) carryParams.platform = platform;

  const total = await delegate.count({ where });
  const page = clampPage(parsePage(sp.page), total, perPage);

  const rows: Record<string, unknown>[] = await delegate.findMany({
    where,
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

      <form method="get" className="flex flex-wrap items-center gap-3">
        {platform ? (
          <input type="hidden" name="platform" value={platform} />
        ) : null}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={`Cari ${def.label.toLowerCase()}…`}
          aria-label={`Cari ${def.label.toLowerCase()}`}
          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white"
        >
          Cari
        </button>
        {q ? (
          <a
            href={
              platform
                ? `/admin/${def.key}?platform=${platform}`
                : `/admin/${def.key}`
            }
            className="text-sm text-neutral-500 underline"
          >
            Reset
          </a>
        ) : null}
      </form>

      <Pagination
        basePath={`/admin/${def.key}`}
        page={page}
        perPage={perPage}
        total={total}
        label={def.label.toLowerCase()}
        params={
          Object.keys(carryParams).length > 0 ? carryParams : undefined
        }
      />
    </div>
  );
}
