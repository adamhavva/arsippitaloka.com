/**
 * Pasang file e-book contoh ke buku seed (seed-book-0) supaya fitur
 * unduh/baca di area pembeli bisa dicoba tanpa upload manual.
 *
 * File-nya: storage/private/2026/11/contoh-ebook.pdf (di luar public/, jadi
 * hanya bisa diakses lewat /api/download dan /api/read).
 */
import "dotenv/config";
import { statSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const FILE = "storage/private/2026/11/contoh-ebook.pdf";

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const size = statSync(FILE).size;
  const book = await prisma.book.update({
    where: { id: "seed-book-0" },
    data: { fileUrl: "/files/2026/11/contoh-ebook.pdf", isDownloadable: true, fileSize: size },
    select: { id: true, title: true, fileUrl: true, fileSize: true },
  });
  console.log("Buku sample:", JSON.stringify(book));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
