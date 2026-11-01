"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/require-admin";
import { broadcastManualAnnouncement } from "@/lib/newsletter";
import { normalizeEmail } from "@/lib/email";
import type { ActionState } from "@/lib/admin/action-state";

/** Aktifkan / nonaktifkan pelanggan newsletter. */
export async function toggleSubscriber(
  subscriberId: string,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { id: subscriberId },
  });
  if (!subscriber) {
    return { ok: false, message: "Pelanggan tidak ditemukan" };
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriberId },
    data: {
      isActive: !subscriber.isActive,
      unsubscribedAt: subscriber.isActive ? new Date() : null,
    },
  });

  revalidatePath("/admin/newsletter");
  return {
    ok: true,
    message: subscriber.isActive
      ? "Pelanggan dinonaktifkan (berhenti langganan)"
      : "Pelanggan diaktifkan kembali",
  };
}

/** Hapus pelanggan dari daftar. */
export async function deleteSubscriber(
  subscriberId: string,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  await prisma.newsletterSubscriber.delete({ where: { id: subscriberId } });
  revalidatePath("/admin/newsletter");
  return { ok: true, message: "Pelanggan dihapus" };
}

/** Tambah pelanggan manual (mis. dari offline event). */
export async function addSubscriber(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const name = String(formData.get("name") ?? "").trim();

  if (!email) {
    return { ok: false, message: "Email wajib diisi" };
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });

  if (existing) {
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { isActive: true, unsubscribedAt: null, name: name || existing.name },
    });
  } else {
    await prisma.newsletterSubscriber.create({
      data: { email, name: name || null, source: "manual", isActive: true },
    });
  }

  revalidatePath("/admin/newsletter");
  return { ok: true, message: `${email} sudah masuk daftar newsletter` };
}

/** Kirim pengumuman manual ke semua pelanggan newsletter. */
export async function sendAnnouncement(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, message: "Unauthorized" };

  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const path = String(formData.get("path") ?? "").trim();

  if (!subject || !body) {
    return { ok: false, message: "Subjek dan isi pengumuman wajib diisi" };
  }

  const result = await broadcastManualAnnouncement({
    subject,
    body,
    path: path || null,
  });

  revalidatePath("/admin/newsletter");

  return {
    ok: result.ok,
    message: result.ok ? result.message : result.message,
  };
}
