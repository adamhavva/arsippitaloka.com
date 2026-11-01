/**
 * Ubah email user (dipakai untuk admin yang email domainnya belum aktif).
 *
 *   npx tsx scripts/update-user-email.ts info@arsipitaloka.id
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const target = (process.argv[2] ?? "").trim().toLowerCase();
  if (!target) {
    console.log("Pemakaian: npx tsx scripts/update-user-email.ts <email-baru>");
    return;
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });

  for (const user of users) {
    if (user.email === target) {
      console.log(`- ${user.email} sudah pakai email ini, dilewati.`);
      continue;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { email: target },
    });
    console.log(`- ${user.email} → ${target} (${user.role})`);

    // Langganan newsletter ikut diperbarui supaya tetap sinkron.
    const sub = await prisma.newsletterSubscriber.findUnique({
      where: { email: user.email },
    });
    if (sub) {
      await prisma.newsletterSubscriber.update({
        where: { id: sub.id },
        data: { email: target },
      });
      console.log(`  langganan newsletter ikut diperbarui.`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
