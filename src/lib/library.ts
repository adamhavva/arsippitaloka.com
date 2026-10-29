import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * Status order yang memberi hak akses ke file e-book.
 * PENDING/SHIPPED/CANCELLED tidak memberi akses (lihat rencana induk M9).
 */
export const ACCESS_STATUSES = ["PAID", "COMPLETED"] as const;

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

/**
 * Guard area pembeli: wajib login, tapi role apa pun boleh masuk
 * (admin juga punya akun, jadi bisa memakai pustakanya sendiri).
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login?callbackUrl=/akun");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) redirect("/login?callbackUrl=/akun");

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

/** Item order yang sudah dibayar — sumber "Pustaka Saya". */
export async function getPurchasedItems(userId: string) {
  return prisma.orderItem.findMany({
    where: {
      order: { userId, status: { in: [...ACCESS_STATUSES] } },
    },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          slug: true,
          coverUrl: true,
          fileUrl: true,
          fileFormat: true,
          fileSize: true,
          pages: true,
          isDownloadable: true,
          isFree: true,
          archived: true,
        },
      },
      order: {
        select: { id: true, status: true, createdAt: true, paidAt: true },
      },
    },
    orderBy: { order: { createdAt: "desc" } },
  });
}

/**
 * Apakah user berhak membuka file buku ini?
 * Granted bila: (a) pernah membeli lewat order PAID/COMPLETED, atau
 * (b) buku gratis dan belum diarsipkan.
 */
export async function canAccessBook(
  userId: string,
  bookId: string,
): Promise<boolean> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, isFree: true, archived: true },
  });
  if (!book) return false;
  if (book.isFree && !book.archived) return true;

  const item = await prisma.orderItem.findFirst({
    where: {
      bookId,
      order: { userId, status: { in: [...ACCESS_STATUSES] } },
    },
    select: { id: true },
  });
  return item !== null;
}

const MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".epub": "application/epub+zip",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/**
 * Terjemahkan `Book.fileUrl` menjadi sumber file yang bisa dikirim.
 * - URL absolut (http/https) → arahkan ke sana.
 * - `/files/...` → file privat di `storage/private` (hasil upload admin).
 * - `/...` lain → file di folder `public`.
 */
export function resolveBookFile(
  fileUrl: string,
): { external: string } | { path: string; contentType: string } | null {
  if (!fileUrl) return null;

  if (/^https?:\/\//i.test(fileUrl)) {
    return { external: fileUrl };
  }

  const ext = fileUrl.slice(fileUrl.lastIndexOf(".")).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";

  if (fileUrl.startsWith("/files/")) {
    const rel = fileUrl.slice("/files/".length);
    return {
      path: `${process.cwd()}/storage/private/${rel}`,
      contentType,
    };
  }

  const rel = fileUrl.replace(/^\/+/, "");
  return { path: `${process.cwd()}/public/${rel}`, contentType };
}
