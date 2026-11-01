import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { normalizeEmail } from "@/lib/email";
import { consumeOtpToken, verifyOtpCode } from "@/lib/otp";

/**
 * POST /api/auth/reset-password
 *
 * Body: { email, code, password }. Kode OTP dicek (masa berlaku 5 menit),
 * lalu password diganti dan token langsung dihapus supaya tidak bisa dipakai
 * ulang.
 */
export async function POST(request: Request) {
  let body: { email?: string; code?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const code = String(body.code ?? "").trim();
  const password = body.password ?? "";

  if (!email || !code) {
    return Response.json(
      { error: "Email dan kode OTP wajib diisi." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Password minimal 8 karakter" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return Response.json({ error: "Akun tidak ditemukan." }, { status: 404 });
  }

  const verification = await verifyOtpCode(user.id, code);
  if (!verification.ok) {
    return Response.json({ error: verification.error }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(password),
      failedAttempts: 0,
      lockedUntil: null,
    },
  });

  await consumeOtpToken(verification.tokenId);

  return Response.json({ ok: true, message: "Password berhasil diperbarui." });
}
