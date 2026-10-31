/**
 * Tempelkan kategori ke buku yang belum punya kategori.
 *
 * Aturannya: buku yang belum punya `categoryId` dan berada di tab dengan
 * slug yang sama dengan sebuah kategori (mis. tab "e-book" → kategori
 * "e-book") otomatis ditagih kategori tersebut. Buku yang kategorinya
 * sudah diisi manual (mis. "biografi") TIDAK diubah.
 *
 * Jalankan: npx tsx scripts/tag-book-categories.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const [categories, books] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.book.findMany({
      where: { categoryId: null },
      select: { id: true, title: true },
    }),
  ]);

  if (books.length === 0) {
    console.log("Tidak ada buku tanpa kategori.");
    return;
  }

  let updated = 0;

  // Semua buku adalah e-book → tempelkan ke kategori "e-book".
  for (const book of books) {
    const category = categories.find((c) => c.slug === "e-book");
    if (!category) continue;

    await prisma.book.update({
      where: { id: book.id },
      data: { categoryId: category.id },
    });
    updated += 1;
    console.log(`✓ "${book.title}" → kategori ${category.name}`);
  }

  const stillEmpty = await prisma.book.count({ where: { categoryId: null } });
  console.log(
    `\nDitandai: ${updated} buku. Buku tanpa kategori tersisa: ${stillEmpty}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
