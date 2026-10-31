"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import type { ActionState } from "@/lib/admin/action-state";

/** Batas aman data URL base64 di server (~2MB) agar kolom DB tidak membengkak. */
const MAX_IMAGE_DATA_URL = 2 * 1024 * 1024;

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

/** Ubah nama admin yang sedang login. */
export async function updateAdminName(
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
  revalidatePath("/admin");
  revalidatePath("/admin/akun");

  return { ok: true, message: "Nama berhasil diperbarui" };
}

/** Ganti password admin — wajib password lama. */
export async function changeAdminPassword(
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
      message: "Akun ini dibuat lewat Google — tidak punya password",
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

/** Simpan foto admin (data URL base64 dari client). Kosong = hapus foto. */
export async function updateAdminPhoto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, message: "Sesi habis, silakan login lagi" };

  const raw = String(formData.get("image") ?? "").trim();

  if (!raw) {
    await prisma.user.update({ where: { id: userId }, data: { image: null } });
    revalidatePath("/admin");
    revalidatePath("/admin/akun");
    return { ok: true, message: "Foto dihapus" };
  }

  if (!raw.startsWith("data:image/")) {
    return { ok: false, message: "Format gambar tidak dikenali" };
  }
  if (raw.length > MAX_IMAGE_DATA_URL) {
    return { ok: false, message: "Ukuran gambar terlalu besar (maks ~1.5MB)" };
  }

  await prisma.user.update({ where: { id: userId }, data: { image: raw } });
  revalidatePath("/admin");
  revalidatePath("/admin/akun");

  return { ok: true, message: "Foto berhasil diperbarui" };
}
