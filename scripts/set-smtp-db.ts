/**
 * Set sementara host/port SMTP di DB (untuk pengujian lokal).
 *
 *   npx tsx scripts/set-smtp-db.ts 127.0.0.1 1025
 *   npx tsx scripts/set-smtp-db.ts "" ""   # kosongkan lagi
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const host = process.argv[2] ?? "";
  const port = process.argv[3] ?? "465";

  await prisma.siteSetting.upsert({
    where: { key: "contact.smtp.host" },
    create: { key: "contact.smtp.host", value: host },
    update: { value: host },
  });
  await prisma.siteSetting.upsert({
    where: { key: "contact.smtp.port" },
    create: { key: "contact.smtp.port", value: port },
    update: { value: port },
  });

  // User / From / To ikut diatur supaya sama persis dengan kredensial email.
  // Password TIDAK ditulis ke DB — tetap dibaca dari .env (SMTP_PASS).
  const user = process.env.SMTP_USER ?? "";
  const servername = process.env.SMTP_SERVERNAME ?? "";
  if (user) {
    await prisma.siteSetting.upsert({
      where: { key: "contact.smtp.user" },
      create: { key: "contact.smtp.user", value: user },
      update: { value: user },
    });
    await prisma.siteSetting.upsert({
      where: { key: "contact.smtp.from" },
      create: { key: "contact.smtp.from", value: user },
      update: { value: user },
    });
    await prisma.siteSetting.upsert({
      where: { key: "contact.smtp.to" },
      create: { key: "contact.smtp.to", value: user },
      update: { value: user },
    });
  }
  if (servername) {
    await prisma.siteSetting.upsert({
      where: { key: "contact.smtp.servername" },
      create: { key: "contact.smtp.servername", value: servername },
      update: { value: servername },
    });
  }

  console.log(`contact.smtp.host = ${host || "(kosong)"}`);
  console.log(`contact.smtp.port = ${port || "(kosong)"}`);
  console.log(`contact.smtp.user = ${user ? "(terisi)" : "(kosong → pakai .env)"}`);
  console.log(`contact.smtp.servername = ${servername || "(kosong)"}`);
  console.log("contact.smtp.pass = (tidak ditulis ke DB, tetap dari .env)");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
