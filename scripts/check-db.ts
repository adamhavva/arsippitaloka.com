import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { hashPassword, verifyPassword } from "../src/lib/password";

async function main() {
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
    emailVerified: true,
    failedAttempts: true,
    lockedUntil: true,
    passwordHash: true,
    createdAt: true,
  },
  orderBy: { createdAt: "asc" },
});

console.log("TOTAL USER:", users.length);
for (const u of users) {
  console.log("---");
  console.log("email   :", u.email);
  console.log("name    :", u.name);
  console.log("role    :", u.role, "| isActive:", u.isActive, "| verified:", !!u.emailVerified);
  console.log("lockout :", u.failedAttempts, u.lockedUntil);
  console.log("hash    :", u.passwordHash?.slice(0, 40) + "...");
}

console.log("\n=== UJI LOGIN ADMIN (password dari env ADMIN_PASSWORD) ===");
const email = process.env.ADMIN_EMAIL ?? "admin@arsippitaloka.com";
const password = process.env.ADMIN_PASSWORD;
const target = users.find((u) => u.email === email);
if (!target) {
  console.log("akun admin tidak ada:", email);
} else if (!password) {
  console.log("ADMIN_PASSWORD belum di-set di .env, tidak bisa verifikasi");
} else {
  const ok = await verifyPassword(password, target.passwordHash ?? "");
  console.log("verifyPassword:", ok ? "OK" : "GAGAL");
  if (!ok) {
    const fresh = await hashPassword(password);
    console.log("hash baru:", fresh.slice(0, 40) + "...");
  }
}

await prisma.$disconnect();
}
main();
