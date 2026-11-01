/**
 * Daftar user + status kirim email terakhir (diagnostik).
 *
 *   npx tsx scripts/list-users.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Total user: ${users.length}`);
  for (const user of users) {
    console.log(
      `- ${user.email} (${user.name}) · ${user.role} · order: ${user._count.orders}`,
    );
  }

  const subs = await prisma.newsletterSubscriber.findMany({
    select: { email: true, source: true, isActive: true },
  });
  console.log(`Pelanggan newsletter: ${subs.length}`);
  for (const sub of subs) {
    console.log(`- ${sub.email} · ${sub.source} · ${sub.isActive ? "aktif" : "nonaktif"}`);
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
