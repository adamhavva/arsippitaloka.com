import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessBook } from "@/lib/library";
import { serveBookFile } from "@/lib/book-file";

/**
 * GET /api/read/[bookId] — buka file e-book di browser (inline).
 * Aturan akses sama persis dengan /api/download.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string }> },
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true, title: true, fileUrl: true },
  });
  if (!book) {
    return Response.json({ error: "Buku tidak ditemukan" }, { status: 404 });
  }

  const allowed = await canAccessBook(userId, bookId);
  if (!allowed) {
    return Response.json(
      { error: "Buku ini belum Anda beli" },
      { status: 403 },
    );
  }

  const ext = book.fileUrl?.split(".").pop()?.toLowerCase() ?? "pdf";
  const filename = `${book.title.replace(/[^\w\s.-]/g, "").trim() || "ebook"}.${ext}`;

  return serveBookFile(book.fileUrl ?? "", filename, "inline");
}
