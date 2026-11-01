import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: "ADMIN";
};

/**
 * Hasil pemeriksaan akses area admin.
 *
 * - `admin`     → user ada di DB dan role-nya ADMIN.
 * - `anonymous` → tidak ada sesi sama sekali.
 * - `forbidden` → sesi ada, user ada, tapi role-nya bukan ADMIN.
 * - `stale`     → sesi ada tapi user-nya sudah tidak ada di DB (mis. DB
 *                 di-reset). JWT masih valid, jadi harus diminta login ulang.
 */
export type AdminAccess =
  | { status: "admin"; admin: AdminUser }
  | { status: "anonymous" }
  | { status: "forbidden" }
  | { status: "stale" };

/**
 * Guard admin — lapisan kedua.
 *
 * `proxy.ts` menolak cepat berdasarkan isi JWT, tapi JWT session bisa basi
 * sampai 7 hari. Di sini role dicek ulang ke DB supaya admin yang turun
 * grade atau dinonaktifkan langsung kehilangan akses.
 *
 * CATATAN: `auth()` membaca cookie, jadi fungsi ini **tidak boleh** dipanggil
 * dari dalam `"use cache"`. Panggil di luar cache boundary.
 */
export async function resolveAdminAccess(): Promise<AdminAccess> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return { status: "anonymous" };

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  // Sesi menunjuk user yang sudah tidak ada (DB di-reset, user dihapus).
  if (!user) return { status: "stale" };

  if (user.role !== "ADMIN") return { status: "forbidden" };

  return {
    status: "admin",
    admin: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image ?? null,
      role: "ADMIN",
    },
  };
}

/**
 * Versi ringkas `resolveAdminAccess()` untuk tempat yang hanya butuh
 * "boleh atau tidak" (seluruh halaman admin memakai ini).
 */
export async function requireAdmin(): Promise<AdminUser | null> {
  const access = await resolveAdminAccess();
  return access.status === "admin" ? access.admin : null;
}
