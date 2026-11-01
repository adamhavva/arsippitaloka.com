/**
 * Aktifkan / nonaktifkan fitur yang butuh SMTP (formulir kontak).
 *
 *   npx tsx scripts/toggle-smtp-feature.ts on|off
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const mode = (process.argv[2] ?? "on").toLowerCase();
  const value = mode === "off" ? "false" : "true";

  await prisma.siteSetting.upsert({
    where: { key: "contact.smtp.enabled" },
    create: { key: "contact.smtp.enabled", value },
    update: { value },
  });

  console.log(`contact.smtp.enabled = ${value}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
