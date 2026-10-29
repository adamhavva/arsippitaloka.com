"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { requireAdmin } from "./require-admin";
import { ENTITIES } from "./entities";
import { getDelegate } from "./delegates";
import { coerceField, pruneEmpty } from "./coerce";
import type { ActionState } from "./action-state";

/**
 * Simpan entitas (create/update). `id` null = buat baru.
 * Dipakai lewat `useActionState`, jadi tanda tangannya:
 *   (key, id, prevState, formData) → state baru
 */
export async function saveEntity(
  key: string,
  id: string | null,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  const def = ENTITIES[key];
  if (!def) return { ok: false, message: "Entitas tidak dikenal" };

  const delegate = getDelegate(def.model);
  if (!delegate) return { ok: false, message: "Entitas tidak dikenal" };

  if (!id && def.canCreate === false) {
    return { ok: false, message: `Tidak bisa menambah ${def.singular}` };
  }
  if (id && def.canEdit === false) {
    return { ok: false, message: `Tidak bisa mengubah ${def.singular}` };
  }

  const raw: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};

  for (const field of def.fields) {
    if (field.readOnly) continue;
    const value = coerceField(field, formData.get(field.name));
    if (field.required && (value === null || value === "" || value === undefined)) {
      fieldErrors[field.name] = `${field.label} wajib diisi`;
    }
    raw[field.name] = value;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Periksa kembali isian yang ditandai.",
      fieldErrors,
    };
  }

  const data = pruneEmpty(raw);

  try {
    if (id) {
      await delegate.update({ where: { id }, data });
    } else {
      await delegate.create({ data });
    }
  } catch (error: any) {
    if (error?.code === "P2002") {
      return {
        ok: false,
        message: `Nilai unik sudah dipakai — ${def.label} ini sudah ada.`,
      };
    }
    if (error?.code === "P2003") {
      return {
        ok: false,
        message: "Relasi tidak valid — pastikan referensi yang dipilih sudah ada.",
      };
    }
    console.error(error);
    return { ok: false, message: "Gagal menyimpan. Coba lagi." };
  }

  revalidatePath("/");
  revalidatePath(`/admin/${key}`);
  revalidatePath("/akun");
  updateTag("content");

  return {
    ok: true,
    message: `${def.label} berhasil disimpan.`,
  };
}

/** Hapus entitas. Buku yang sudah pernah dipesan tidak bisa dihapus (FK Restrict). */
export async function deleteEntity(
  key: string,
  id: string,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  const def = ENTITIES[key];
  if (!def) return { ok: false, message: "Entitas tidak dikenal" };

  const delegate = getDelegate(def.model);
  if (!delegate) return { ok: false, message: "Entitas tidak dikenal" };

  if (def.canDelete === false) {
    return { ok: false, message: `Tidak bisa menghapus ${def.singular}` };
  }

  try {
    await delegate.delete({ where: { id } });
  } catch (error: any) {
    if (error?.code === "P2003") {
      return {
        ok: false,
        message: `${def.label} ini sudah dipakai data lain, tidak bisa dihapus. Arsipkan saja.`,
      };
    }
    console.error(error);
    return { ok: false, message: "Gagal menghapus. Coba lagi." };
  }

  revalidatePath("/");
  revalidatePath(`/admin/${key}`);
  revalidatePath("/akun");
  updateTag("content");

  return { ok: true, message: `${def.label} berhasil dihapus.` };
}
