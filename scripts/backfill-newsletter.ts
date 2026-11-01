/**
 * Masukkan seluruh user yang sudah terdaftar ke daftar newsletter
 * (tanpa mengirim email — hanya mengisi tabel).
 *
 *   npx tsx scripts/backfill-newsletter.ts
 *
 * Pakai `--undo` untuk menonaktifkan semua pelanggan newsletter.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const undo = process.argv.includes("--undo");

  if (undo) {
    const result = await prisma.newsletterSubscriber.updateMany({
      where: { source: "register" },
      data: { isActive: false, unsubscribedAt: new Date() },
    });
    console.log(`Pelanggan dari register dinonaktifkan: ${result.count}`);
    return;
  }

  const users = await prisma.user.findMany({
    select: { email: true, name: true },
  });

  let added = 0;
  let existing = 0;

  for (const user of users) {
    const found = await prisma.newsletterSubscriber.findUnique({
      where: { email: user.email },
    });
    if (found) {
      existing += 1;
      continue;
    }
    await prisma.newsletterSubscriber.create({
      data: {
        email: user.email,
        name: user.name,
        source: "register",
        isActive: true,
      },
    });
    added += 1;
  }

  console.log(`User terdaftar: ${users.length}`);
  console.log(`Ditambahkan ke newsletter: ${added}`);
  console.log(`Sudah ada sebelumnya: ${existing}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
