"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { requireAdmin } from "@/lib/admin/require-admin";
import type { ActionState } from "@/lib/admin/action-state";

/** Ubah role user. Admin tidak boleh menurunkan role dirinya sendiri. */
export async function updateUserRole(
  userId: string,
  role: string,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  if (role !== "ADMIN" && role !== "CUSTOMER") {
    return { ok: false, message: "Role tidak dikenal" };
  }
  if (userId === admin.id) {
    return { ok: false, message: "Tidak bisa mengubah role akun Anda sendiri" };
  }

  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { ok: true, message: "Role diperbarui" };
}

/** Reset password user (hash baru, tanpa pernah menampilkan hash lama). */
export async function resetUserPassword(
  userId: string,
  password: string,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  if (password.length < 8) {
    return { ok: false, message: "Password minimal 8 karakter" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
      failedAttempts: 0,
      lockedUntil: null,
    },
  });
  revalidatePath("/admin/users");
  return { ok: true, message: "Password berhasil direset" };
}

/** Hapus user. Ditolak kalau user punya order (FK Restrict). */
export async function deleteUser(userId: string): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  if (userId === admin.id) {
    return { ok: false, message: "Tidak bisa menghapus akun Anda sendiri" };
  }

  const orderCount = await prisma.order.count({ where: { userId } });
  if (orderCount > 0) {
    return {
      ok: false,
      message: `User ini punya ${orderCount} order, tidak bisa dihapus. Nonaktifkan saja.`,
    };
  }

  try {
    await prisma.user.delete({ where: { id: userId } });
  } catch {
    return { ok: false, message: "Gagal menghapus user" };
  }

  revalidatePath("/admin/users");
  return { ok: true, message: "User dihapus" };
}

/** Aktifkan / nonaktifkan user (login ditolak kalau isActive = false). */
export async function toggleUserActive(
  userId: string,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });
  if (!user) return { ok: false, message: "User tidak ditemukan" };

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });
  revalidatePath("/admin/users");
  return { ok: true, message: user.isActive ? "User dinonaktifkan" : "User diaktifkan" };
}
