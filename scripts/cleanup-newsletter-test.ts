/**
 * Bersihkan data uji newsletter & OTP.
 *
 *   npx tsx scripts/cleanup-newsletter-test.ts
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const TEST_EMAILS = [
  "uji-http@example.com",
  "footer-test@example.com",
  "newsletter-smoke@arsippitaloka.com",
  "uji-otp@example.com",
  "uji-kedaluwarsa@example.com",
];

async function main() {
  const subs = await prisma.newsletterSubscriber.deleteMany({
    where: { email: { in: TEST_EMAILS } },
  });
  console.log(`Pelanggan newsletter uji dihapus: ${subs.count}`);

  const articles = await prisma.article.deleteMany({
    where: { title: "Uji Coba Berita Newsletter" },
  });
  console.log(`Artikel uji dihapus: ${articles.count}`);

  const tokens = await prisma.passwordResetToken.deleteMany({
    where: { user: { email: { in: TEST_EMAILS } } },
  });
  console.log(`Token OTP uji dihapus: ${tokens.count}`);

  // Pengaturan SMTP dikembalikan ke default (kosong → pakai .env).
  await prisma.siteSetting.update({
    where: { key: "contact.smtp.host" },
    data: { value: "" },
  });
  await prisma.siteSetting.update({
    where: { key: "contact.smtp.port" },
    data: { value: "587" },
  });
  console.log("Pengaturan SMTP di DB dikembalikan ke default.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
