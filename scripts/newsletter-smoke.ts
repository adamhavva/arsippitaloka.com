/**
 * Uji coba newsletter + OTP (butuh SMTP yang benar-benar bisa dipakai).
 *
 * Jalankan: npx tsx scripts/newsletter-smoke.ts
 *
 * Yang diuji:
 * 1. Kirim email uji ke kotak masuk admin (bisa dicek visual).
 * 2. Tambah pelanggan newsletter + kirim pengumuman ke pelanggan itu.
 * 3.OTP reset password: buat token, verifikasi kodenya, lalu bersihkan.
 */
import { prisma } from "../src/lib/prisma";
import {
  closeMailTransporters,
  getSmtpConfig,
  isSmtpUsable,
  sendHtmlEmail,
} from "../src/lib/smtp";
import {
  subscribeToNewsletter,
  unsubscribeFromNewsletter,
  broadcastToSubscribers,
} from "../src/lib/newsletter";
import {
  createPasswordResetToken,
  verifyOtpCode,
  getOtpPolicy,
} from "../src/lib/otp";
import { contentAnnouncementMail } from "../src/lib/mail/templates";
import { normalizeEmail } from "../src/lib/email";

/**
 * Override konfigurasi SMTP untuk pengujian lokal (mis. SMTP sink di
 * 127.0.0.1). Isi file JSON ini kalau perlu mengarahkan uji coba ke server
 * SMTP lain tanpa mengubah .env.
 */
const OVERRIDE_FILE = "/tmp/mailsink/smtp-override.json";

function applyOverrides() {
  // Override hanya dipakai kalau SMOKE_USE_OVERRIDE=1 (uji lokal).
  if (process.env.SMOKE_USE_OVERRIDE !== "1") return;

  try {
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    const override = JSON.parse(readFileSync(OVERRIDE_FILE, "utf8")) as Record<
      string,
      string
    >;
    for (const [key, value] of Object.entries(override)) {
      process.env[key] = value;
    }
    console.log("Override SMTP dari", OVERRIDE_FILE);
  } catch {
    /* tidak ada override → pakai .env */
  }
}

const TEST_EMAIL = normalizeEmail(
  process.env.SMOKE_EMAIL ?? "info@arsipitaloka.id",
);

async function main() {
  applyOverrides();

  // Pengaturan SMTP di DB menang atas .env — jadi untuk uji coba lokal,
  // host/port sementara ditulis ke DB lalu dikembalikan seperti semula.
  const previous = await prisma.siteSetting.findMany({
    where: { key: { in: ["contact.smtp.host", "contact.smtp.port"] } },
  });
  const previousValues = new Map(previous.map((row) => [row.key, row.value]));

  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    await prisma.siteSetting.upsert({
      where: { key: "contact.smtp.host" },
      create: { key: "contact.smtp.host", value: process.env.SMTP_HOST },
      update: { value: process.env.SMTP_HOST },
    });
    await prisma.siteSetting.upsert({
      where: { key: "contact.smtp.port" },
      create: { key: "contact.smtp.port", value: process.env.SMTP_PORT },
      update: { value: process.env.SMTP_PORT },
    });
  }

  try {
    await runChecks();
  } finally {
    for (const [key, value] of previousValues) {
      await prisma.siteSetting.update({ where: { key }, data: { value } });
    }
    console.log("Pengaturan SMTP di DB dikembalikan seperti semula.");
    closeMailTransporters();
    await prisma.$disconnect();
  }
}

async function runChecks() {
  const config = await getSmtpConfig();
  console.log("SMTP host:", config.host, "port:", config.port);
  console.log("SMTP bisa dipakai:", isSmtpUsable(config));

  if (!isSmtpUsable(config)) {
    console.error("SMTP belum terkonfigurasi — berhenti.");
    process.exit(1);
  }

  // 1. Email uji ke kotak masuk admin.
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  if (admin) {
    const mail = contentAnnouncementMail({
      eyebrow: "Uji Coba",
      title: "Template email Arsip Pitaloka",
      excerpt:
        "Ini email uji coba. Kalau tampilan di kotak masuk Anda rapi, berarti template dan konfigurasi SMTP sudah benar.",
      url: "https://arsippitaloka.com/buku",
      ctaLabel: "Buka katalog",
    });

    const result = await sendHtmlEmail(config, {
      to: admin.email,
      subject: "Uji coba template email — Arsip Pitaloka",
      html: mail.html,
      text: mail.text,
      fromName: "Arsip Pitaloka",
    });
    console.log("Kirim email uji ke admin:", result);
  }

  // 2. Langganan + pengumuman.
  const existedBefore = await prisma.newsletterSubscriber.findUnique({
    where: { email: TEST_EMAIL },
  });

  const subscribe = await subscribeToNewsletter({
    email: TEST_EMAIL,
    name: "Uji Coba Newsletter",
    source: "manual",
  });
  console.log("Subscribe:", subscribe);

  const broadcast = await broadcastToSubscribers({
    kind: "manual",
    eyebrow: "Uji Coba Newsletter",
    title: "Kabar terbaru dari Arsip Pitaloka",
    excerpt:
      "Kalau email ini masuk, berarti pengumuman otomatis ke daftar pelanggan berjalan.",
    path: "/buku",
    ctaLabel: "Lihat katalog",
  });
  console.log("Broadcast:", broadcast);

  // 3. OTP reset password.
  const policy = await getOtpPolicy();
  console.log("Kebijakan OTP:", policy);

  if (admin) {
    const { code, tokenId } = await createPasswordResetToken(admin.id);
    console.log("Kode OTP (uji):", code);

    const wrong = await verifyOtpCode(admin.id, "000000");
    console.log("Verifikasi kode salah →", wrong.ok ? "LULUS (BUG!)" : "ditolak");

    const right = await verifyOtpCode(admin.id, code);
    console.log("Verifikasi kode benar →", right.ok ? "diterima" : "ditolak");

    await prisma.passwordResetToken.delete({ where: { id: tokenId } });
    console.log("Token uji dibersihkan.");
  }

  // Bersihkan pelanggan uji — kalau pelanggan itu sudah ada sebelumnya,
  // kembalikan saja ke keadaan semula (jangan dihapus).
  if (existedBefore) {
    await prisma.newsletterSubscriber.update({
      where: { email: TEST_EMAIL },
      data: {
        isActive: existedBefore.isActive,
        unsubscribedAt: existedBefore.unsubscribedAt,
        source: existedBefore.source,
      },
    });
    console.log("Pelanggan uji dikembalikan ke keadaan semula.");
  } else {
    await unsubscribeFromNewsletter(TEST_EMAIL);
    await prisma.newsletterSubscriber.deleteMany({
      where: { email: TEST_EMAIL },
    });
    console.log("Pelanggan uji dibersihkan.");
  }
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
