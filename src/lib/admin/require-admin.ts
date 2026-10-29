import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
};

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
export async function requireAdmin(): Promise<AdminUser | null> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (user?.role !== "ADMIN") return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: "ADMIN",
  };
}
