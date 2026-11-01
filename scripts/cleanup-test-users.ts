/**
 * Bersihkan data uji: hapus user + order dari skrip uji (prefix `pw-uji-`
 * dan `midtrans-uji-`).
 *
 * Jalankan: `npx tsx scripts/cleanup-test-users.ts`
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const prefixes = ["pw-uji-", "midtrans-uji-", "midtrans-mock-"];
  const users = await prisma.user.findMany({
    where: {
      OR: prefixes.map((prefix) => ({ email: { startsWith: prefix } })),
    },
    select: { id: true, email: true },
  });

  if (!users.length) {
    console.log("(tidak ada user uji)");
    return;
  }

  for (const user of users) {
    const orders = await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.cartItem.deleteMany({ where: { userId: user.id } }).catch(() => {});
    await prisma.user.delete({ where: { id: user.id } });
    console.log(`hapus ${user.email} (${orders.count} order)`);
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
