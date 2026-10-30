/**
 * Cek status pengaturan Midtrans di DB — hanya menampilkan apakah terisi,
 * bukan nilainya (server key tidak boleh bocor ke log).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: "payment.midtrans" } },
    orderBy: { key: "asc" },
  });

  if (rows.length === 0) {
    console.log("(belum ada pengaturan Midtrans di DB)");
  } else {
    for (const row of rows) {
      const isSecret = row.key.includes("Key");
      const value = row.value?.trim() ?? "";
      const display =
        value === ""
          ? "(kosong)"
          : isSecret
            ? `(terisi, ${value.length} karakter)`
            : value;
      console.log(`${row.key} = ${display}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
