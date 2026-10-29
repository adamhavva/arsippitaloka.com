"use server";

import { revalidatePath } from "next/cache";
import { updateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { SETTINGS_SCHEMA } from "@/lib/site-settings";
import type { ActionState } from "@/lib/admin/action-state";

/** Simpan pengaturan situs (company profile, copy landing page, pajak). */
export async function saveSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  try {
    for (const field of SETTINGS_SCHEMA) {
      const raw = formData.get(field.key);
      let value = "";

      if (field.type === "boolean") {
        value = raw === "1" || raw === "on" || raw === "true" ? "true" : "false";
      } else {
        value = typeof raw === "string" ? raw : "";
      }

      await prisma.siteSetting.upsert({
        where: { key: field.key },
        update: { value },
        create: { key: field.key, value },
      });
    }
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Gagal menyimpan pengaturan." };
  }

  revalidatePath("/");
  revalidatePath("/admin/profile");
  updateTag("content");

  return { ok: true, message: "Pengaturan berhasil disimpan." };
}
