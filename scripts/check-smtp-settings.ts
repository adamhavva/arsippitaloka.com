/**
 * Cek status pengaturan SMTP di DB — hanya menampilkan host/port/senada,
 * bukan kredensialnya (password tidak boleh bocor ke log).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: "contact.smtp" } },
    orderBy: { key: "asc" },
  });

  if (rows.length === 0) {
    console.log("(belum ada pengaturan SMTP di DB)");
    return;
  }

  for (const row of rows) {
    const key = row.key.replace("contact.smtp.", "");
    if (key === "pass") {
      console.log(`pass: ${row.value ? "(terisi)" : "(kosong)"}`);
      continue;
    }
    console.log(`${key}: ${row.value || "(kosong)"}`);
  }

  const envUser = process.env.SMTP_USER ? "(terisi di .env)" : "(kosong)";
  console.log(`SMTP_USER dari .env: ${envUser}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
