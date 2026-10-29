"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { ActionState } from "@/lib/admin/action-state";

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Ubah nama tampilan. */
export async function updateProfileName(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, message: "Sesi habis, silakan login lagi" };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) {
    return { ok: false, message: "Nama minimal 2 karakter" };
  }

  await prisma.user.update({ where: { id: userId }, data: { name } });
  revalidatePath("/akun");
  revalidatePath("/akun/profil");

  return { ok: true, message: "Nama berhasil diperbarui" };
}

/** Ganti password — wajib menyertakan password lama. */
export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, message: "Sesi habis, silakan login lagi" };

  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (next.length < 8) {
    return { ok: false, message: "Password baru minimal 8 karakter" };
  }
  if (next !== confirm) {
    return { ok: false, message: "Konfirmasi password tidak cocok" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return {
      ok: false,
      message: "Akun ini dibuat lewat Google — atur password lewat admin",
    };
  }

  const ok = await verifyPassword(current, user.passwordHash);
  if (!ok) {
    return { ok: false, message: "Password lama salah" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(next) },
  });

  return { ok: true, message: "Password berhasil diganti" };
}
