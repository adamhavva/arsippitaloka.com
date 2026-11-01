/**
 * Uji alur reset password + OTP lewat HTTP (butuh dev server jalan).
 *
 *   npx tsx scripts/otp-flow-test.ts
 *
 * Membuat user sementara, meminta OTP lewat API, memakai kodenya untuk
 * mengganti password, lalu memeriksa password barunya valid. User sementara
 * dihapus di akhir.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { hashPassword, verifyPassword } from "../src/lib/password";
import { createPasswordResetToken, verifyOtpCode } from "../src/lib/otp";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const BASE = process.env.AUTH_URL ?? "http://localhost:3000";
const EMAIL = "uji-otp@example.com";
const OLD_PASSWORD = "PasswordLama123!";
const NEW_PASSWORD = "PasswordBaru456!";

async function main() {
  await prisma.user.deleteMany({ where: { email: EMAIL } });
  const user = await prisma.user.create({
    data: {
      email: EMAIL,
      name: "Uji OTP",
      role: "CUSTOMER",
      passwordHash: await hashPassword(OLD_PASSWORD),
    },
  });
  console.log("User sementara dibuat.");

  // 1. Minta OTP (cek endpoint +(upaya) kirim email).
  const forgot = await fetch(`${BASE}/api/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL }),
  });
  console.log("Forgot-password:", forgot.status, await forgot.json());

  // Kode tidak bisa dibaca dari inbox secara otomatis, jadi dibuat langsung
  // lewat helper yang sama dengan yang dipakai server (token terakhir tetap
  // yang dipakai API).
  const { code } = await createPasswordResetToken(user.id);
  console.log("Kode OTP dibuat:", code);

  // 2. Kode salah harus ditolak.
  const wrong = await fetch(`${BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, code: "000000", password: NEW_PASSWORD }),
  });
  console.log("Kode salah →", wrong.status, await wrong.json());

  // 3. Kode benar → password diganti.
  const reset = await fetch(`${BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, code, password: NEW_PASSWORD }),
  });
  console.log("Kode benar →", reset.status, await reset.json());

  // 4. Password baru harus cocok, yang lama tidak.
  const updated = await prisma.user.findUnique({ where: { email: EMAIL } });
  const newOk = await verifyPassword(NEW_PASSWORD, updated?.passwordHash ?? "");
  const oldOk = await verifyPassword(OLD_PASSWORD, updated?.passwordHash ?? "");
  console.log("Password baru valid:", newOk, "| password lama masih valid:", oldOk);

  // 5. Kode yang sama tidak bisa dipakai lagi.
  const reuse = await fetch(`${BASE}/api/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, code, password: NEW_PASSWORD }),
  });
  console.log("Pakai ulang kode →", reuse.status, await reuse.json());

  await prisma.user.deleteMany({ where: { email: EMAIL } });
  console.log("User sementara dihapus.");

  await testExpiry();
}

/** Cek bahwa kode yang sudah kedaluwarsa ditolak. */
async function testExpiry() {
  const user = await prisma.user.create({
    data: {
      email: "uji-kedaluwarsa@example.com",
      name: "Uji Kedaluwarsa",
      role: "CUSTOMER",
      passwordHash: await hashPassword(OLD_PASSWORD),
    },
  });

  const { code, tokenId } = await createPasswordResetToken(user.id);

  // Majukan masa berlaku 6 menit ke belakang → kode harus ditolak.
  await prisma.passwordResetToken.update({
    where: { id: tokenId },
    data: { expiresAt: new Date(Date.now() - 6 * 60_000) },
  });

  const result = await verifyOtpCode(user.id, code);
  console.log("Kode kedaluwarsa →", result.ok ? "LULUS (BUG!)" : result.error);

  await prisma.user.deleteMany({ where: { id: user.id } });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
