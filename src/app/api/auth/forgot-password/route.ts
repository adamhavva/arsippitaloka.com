import { prisma } from "@/lib/prisma";
import { normalizeEmail } from "@/lib/email";
import { getSmtpConfig, isSmtpUsable, sendHtmlEmail } from "@/lib/smtp";
import { createPasswordResetToken, getOtpPolicy } from "@/lib/otp";
import { resetOtpMail } from "@/lib/mail/templates";
import { getNewsletterSettings } from "@/lib/newsletter";

/**
 * POST /api/auth/forgot-password
 *
 * Body: { email }. Mengirim kode OTP 6 angka ke email tersebut.
 *
 * Balasan selalu sama (sukses) baik email terdaftar maupun tidak — supaya
 * halaman ini tidak bisa dipakai untuk menebak email mana yang punya akun.
 */
export async function POST(request: Request) {
  let body: { email?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const policy = await getOtpPolicy();

  const user = email
    ? await prisma.user.findUnique({ where: { email } })
    : null;

  // Pesan yang sama untuk semua kasus (email tidak ada / akun nonaktif /
  // SMTP mati) supaya tidak membocorkan informasi akun.
  const genericResponse = Response.json({
    ok: true,
    message: `Jika email tersebut terdaftar, kode OTP sudah dikirim. Berlaku ${policy.expiryMinutes} menit.`,
    expiresInMinutes: policy.expiryMinutes,
  });

  if (!user || !user.isActive) {
    return genericResponse;
  }

  const config = await getSmtpConfig();
  if (!isSmtpUsable(config)) {
    return Response.json(
      { error: "Email reset password belum bisa dikirim. Coba lagi nanti." },
      { status: 503 },
    );
  }

  const { code, expiresAt } = await createPasswordResetToken(user.id);
  const settings = await getNewsletterSettings();
  const mail = resetOtpMail({
    code,
    minutes: policy.expiryMinutes,
    name: user.name,
  });

  const result = await sendHtmlEmail(config, {
    to: user.email,
    subject: `Kode OTP reset password: ${code}`,
    html: mail.html,
    text: mail.text,
    fromName: settings.fromName,
  });

  if (!result.ok) {
    return Response.json(
      { error: "Gagal mengirim kode OTP. Coba lagi nanti." },
      { status: 502 },
    );
  }

  return Response.json({
    ok: true,
    message: `Kode OTP sudah dikirim ke ${user.email}. Berlaku ${policy.expiryMinutes} menit.`,
    expiresInMinutes: policy.expiryMinutes,
    expiresAt: expiresAt.toISOString(),
  });
}
