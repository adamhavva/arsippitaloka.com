import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { DEFAULT_SETTINGS } from "../src/lib/site-settings-defaults";

/**
 * Sinkronkan baris SiteSetting footer dengan nilai default terbaru.
 * Nilai di DB menang atas default, jadi perubahan default saja tidak cukup
 * untuk instance yang sudah di-seed — baris ini perlu di-update langsung.
 */
async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  const keys = ["footer.browse.links", "footer.platform.links"];
  for (const key of keys) {
    const value = DEFAULT_SETTINGS[key] ?? "";
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    console.log(`✓ ${key} = ${JSON.stringify(value)}`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
