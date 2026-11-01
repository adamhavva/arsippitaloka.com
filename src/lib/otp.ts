import { createHash, randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSettingsSafe } from "@/lib/site-settings";

/**
 * OTP (one-time password) untuk reset password.
 *
 * Kode 6 angka dibuat dengan CSPRNG, dikirim lewat email, dan hanya berlaku
 * 5 menit (bisa diubah lewat pengaturan `auth.otp.expiryMinutes`).
 * Yang disimpan di database adalah hash kode — bukan kode-nya — supaya isi
 * tabel tidak langsung bisa dipakai untuk login.
 */

const DEFAULT_EXPIRY_MINUTES = 5;
const DEFAULT_MAX_ATTEMPTS = 5;

/** Kode 6 angka yang seb leveling acak kriptografis (0-9). */
export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Hash kode OTP + user id supaya kode tidak bisa dipakai ulang di akun lain. */
export function hashOtpCode(code: string, userId: string): string {
  const secret = process.env.AUTH_SECRET || "arsip-pitaloka";
  return createHash("sha256")
    .update(`${secret}:${userId}:${code}`)
    .digest("hex");
}

export type OtpPolicy = { expiryMinutes: number; maxAttempts: number };

export async function getOtpPolicy(): Promise<OtpPolicy> {
  const s = await getSettingsSafe();
  const expiryMinutes =
    Number.parseInt(s["auth.otp.expiryMinutes"]?.trim() ?? "", 10) ||
    DEFAULT_EXPIRY_MINUTES;
  const maxAttempts =
    Number.parseInt(s["auth.otp.maxAttempts"]?.trim() ?? "", 10) ||
    DEFAULT_MAX_ATTEMPTS;

  return {
    expiryMinutes: Math.min(Math.max(expiryMinutes, 1), 60),
    maxAttempts: Math.min(Math.max(maxAttempts, 1), 10),
  };
}

/**
 * Buat token reset baru untuk user — token lama (yang belum dipakai) dibuang
 * supaya hanya ada satu kode aktif per user.
 */
export async function createPasswordResetToken(
  userId: string,
): Promise<{ tokenId: string; code: string; expiresAt: Date }> {
  const policy = await getOtpPolicy();
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + policy.expiryMinutes * 60_000);

  await prisma.passwordResetToken.deleteMany({
    where: { userId, usedAt: null },
  });

  const token = await prisma.passwordResetToken.create({
    data: {
      userId,
      codeHash: hashOtpCode(code, userId),
      expiresAt,
    },
  });

  return { tokenId: token.id, code, expiresAt };
}

export type VerifyOtpResult =
  | { ok: true; userId: string; tokenId: string }
  | { ok: false; error: string };

/**
 * Periksa OTP untuk user tertentu.
 *
 * - Kode dicocokkan dengan hash (bandingkan waktu konstan).
 * - Token kedaluwarsa / sudah dipakai / salah → ditolak.
 * - Setiap percobaan salah menambah `attempts`; kalau melebihi batas, token
 *   dibuang dan pengguna harus meminta kode baru.
 */
export async function verifyOtpCode(
  userId: string,
  code: string,
): Promise<VerifyOtpResult> {
  const policy = await getOtpPolicy();

  const token = await prisma.passwordResetToken.findFirst({
    where: { userId, usedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!token) {
    return { ok: false, error: "Kode OTP tidak ditemukan atau sudah dipakai." };
  }

  if (token.expiresAt.getTime() < Date.now()) {
    await prisma.passwordResetToken.delete({ where: { id: token.id } });
    return { ok: false, error: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru." };
  }

  if (token.attempts >= policy.maxAttempts) {
    await prisma.passwordResetToken.delete({ where: { id: token.id } });
    return {
      ok: false,
      error: "Terlalu banyak percobaan. Silakan minta kode OTP baru.",
    };
  }

  const expected = Buffer.from(token.codeHash);
  const given = Buffer.from(hashOtpCode(code.trim(), userId));
  const matches =
    expected.length === given.length && expected.equals(given);

  if (!matches) {
    await prisma.passwordResetToken.update({
      where: { id: token.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "Kode OTP salah." };
  }

  return { ok: true, userId, tokenId: token.id };
}

/** Tandai token sudah dipakai (dipanggil setelah password berhasil diganti). */
export async function consumeOtpToken(tokenId: string): Promise<void> {
  await prisma.passwordResetToken.update({
    where: { id: tokenId },
    data: { usedAt: new Date() },
  });
}
