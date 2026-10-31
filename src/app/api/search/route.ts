import { prisma } from "@/lib/prisma";
import { buildBookWhere } from "@/lib/book-search";

/**
 * GET /api/search?q=<kata kunci> — saran pencarian (autocomplete).
 *
 * Dipakai dropdown saran di `SearchBar`. Mengembalikan JSON:
 * `{ results: [{ id, slug, title, author, tabSlug, coverUrl, priceUsd, isFree }], total }`
 *
 * - Query kosong / terlalu pendek → `{ results: [], total: 0 }`.
 * - Panjang query dibatasi supaya tidak ada request yang berlebihan.
 * - Pencarian match di `title`, `author`, dan `description` (case-insensitive)
 *   lewat kontrak bersama `buildBookWhere`.
 */

/** Panjang maksimum kata kunci yang diproses. */
const MAX_QUERY_LENGTH = 100;

/** Batas jumlah hasil yang dikembalikan API. */
const MAX_RESULTS = 20;

/** Batas jumlah hasil yang diminta lewat `?limit=`. */
const MAX_LIMIT = 20;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawQuery = url.searchParams.get("q") ?? "";
  const query = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);

  if (!query) {
    return Response.json({ results: [], total: 0 });
  }

  const limitParam = Number.parseInt(url.searchParams.get("limit") ?? "", 10);
  const take = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
    : MAX_RESULTS;

  try {
    const where = buildBookWhere({ q: query, bahasa: "", gratis: false });

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        orderBy: [{ rating: "desc" }, { readCount: "desc" }, { order: "asc" }],
        take,
        select: {
          id: true,
          slug: true,
          title: true,
          author: true,
          coverUrl: true,
          priceUsd: true,
          isFree: true,
        },
      }),
    ]);

    return Response.json({
      results: books.map((book) => ({
        id: book.id,
        slug: book.slug,
        title: book.title,
        author: book.author,
        tabSlug: "e-book",
        coverUrl: book.coverUrl || null,
        priceUsd: Number(book.priceUsd),
        isFree: book.isFree,
      })),
      total,
    });
  } catch {
    // Kegagalan DB tidak boleh menjatuhkan halaman — saran bisa dilewati.
    return Response.json(
      { results: [], total: 0, error: "Gagal memuat saran pencarian." },
      { status: 500 },
    );
  }
}
