import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

/**
 * Tables yang dikosongkan (urutan tidak penting karena CASCADE).
 *
 * `TRUNCATE ... CASCADE` dipakai supaya relasi tetap utuh — aman untuk
 * tabel yang punya foreign key (OrderItem → Book, dll).
 */
const TABLES = [
  "OrderItem",
  "CartItem",
  "Order",
  "PasswordResetToken",
  "NewsletterCampaign",
  "NewsletterSubscriber",
  "SocialMedia",
  "TiktokPost",
  "Documentation",
  "Article",
  "Book",
  "Category",
  "SiteSetting",
  "User",
];

async function main() {
  console.log("Mengosongkan tabel:", TABLES.join(", "));
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${TABLES.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE;`,
  );
  const counts = {
    user: await prisma.user.count(),
    book: await prisma.book.count(),
    article: await prisma.article.count(),
    socialMedia: await prisma.socialMedia.count(),
    tiktokPost: await prisma.tiktokPost.count(),
    siteSetting: await prisma.siteSetting.count(),
  };
  console.log("Database kosong:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
