"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { requireAdmin } from "./require-admin";
import { ENTITIES } from "./entities";
import { getDelegate } from "./delegates";
import { coerceField, pruneEmpty } from "./coerce";
import { slugify } from "@/lib/slug";
import { parseTikTok } from "@/lib/tiktok";
import { fetchTikTokOEmbed } from "@/lib/tiktok-oembed";
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
    let value = coerceField(field, formData.get(field.name));
    // Kolom dengan nilai bawaan (mis. "order" = 0) tidak boleh jadi null
    // walau form dibiarkan kosong — kolomnya wajib di DB.
    if (
      field.type !== "boolean" &&
      field.defaultValue !== undefined &&
      (value === null || value === undefined || value === "")
    ) {
      value = field.defaultValue;
    }
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

  // Slug dibuat otomatis dari judul/nama, dan tetap unik: kalau slug dasar
  // sudah dipakai, ditambahkan angka (e-book → e-book-2 → e-book-3).
  const slugField = def.fields.find((field) => field.slugFrom);
  if (slugField) {
    const sourceValue = String(raw[slugField.slugFrom!] ?? "");
    const submitted = String(raw[slugField.name] ?? "");
    let slug = slugify(submitted || sourceValue);

    if (!slug) {
      fieldErrors[slugField.name] = "Slug tidak bisa dibuat dari isian ini.";
    } else {
      let candidate = slug;
      let counter = 2;
      // eslint-disable-next-line no-await-in-loop
      while (await slugTaken(delegate, candidate, id)) {
        candidate = `${slug}-${counter}`;
        counter += 1;
        if (counter > 999) break;
      }
      raw[slugField.name] = candidate;
    }
  }

  // TikTok: admin cukup menempelkan share link / kode embed. Id video,
  // judul, dan nama author diambil otomatis dari link tersebut.
  if (def.key === "tiktok") {
    const source = String(raw.embedUrl ?? "").trim();
    const ref = parseTikTok(source);

    let videoId = ref.videoId;
    let title = String(raw.title ?? "").trim();
    let author = String(raw.author ?? "").trim();

    if (!videoId && source) {
      const oembed = await fetchTikTokOEmbed(source);
      if (oembed) {
        videoId = oembed.videoId;
        title = title || (oembed.title ?? "");
        author = author || (oembed.author ?? "");
      }
    }

    if (!videoId) {
      return {
        ok: false,
        message:
          "Link TikTok belum bisa dibaca. Tempel share link yang memuat /video/<id> atau kode embed lengkap.",
        fieldErrors: { embedUrl: "Link TikTok tidak dikenali" },
      };
    }

    raw.videoId = videoId;
    raw.title = title || `Postingan TikTok ${videoId.slice(-6)}`;
    raw.author = author || ref.author || "";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      message: "Periksa kembali isian yang ditandai.",
      fieldErrors,
    };
  }

  const data = pruneEmpty(raw);

  // Kolom wajib di DB tapi boleh dikosongkan di form → default 0.
  if (def.key === "book" && data.priceUsd === undefined) data.priceUsd = 0;

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

/**
 * Slug sudah dipakai entitas lain? (dengan pengecualian record yang sedang
 * diedit supaya slug tidak bentrok dengan dirinya sendiri).
 */
async function slugTaken(
  delegate: { findFirst(args: any): Promise<any> },
  slug: string,
  currentId: string | null,
): Promise<boolean> {
  const found = await delegate.findFirst({ where: { slug } });
  if (!found) return false;
  return !currentId || String(found.id) !== currentId;
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
