/**
 * Bersihkan order uji (PENDING tanpa paymentRef / order dari uji midtrans).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const orders = await prisma.order.findMany({
    where: { status: "PENDING" },
    select: { id: true, createdAt: true, paymentProvider: true, user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });

  console.log(`order PENDING: ${orders.length}`);
  for (const order of orders) {
    console.log(
      `- ${order.id} | ${order.paymentProvider ?? "-"} | ${order.createdAt.toISOString()} | ${order.user.email}`,
    );
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
