import nodemailer from "nodemailer";
import { getSettingsSafe } from "@/lib/site-settings";

/**
 * Pengiriman email lewat SMTP untuk formulir kontak.
 *
 * Konfigurasi dibaca dari pengaturan admin (grup "Kontak / SMTP") dengan
 * fallback ke environment variable. Fitur bisa dimatikan dari admin
 * (`contact.smtp.enabled`). Kredensial SMTP TIDAK pernah dikirim ke browser.
 */

export type SmtpConfig = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  /** Alamat tujuan pesan kontak (inbox pemilik situs). */
  to: string;
  /**
   * Nama yang dipakai untuk verifikasi sertifikat TLS.
   *
   * Diperlukan kalau `host` diisi alamat IP: koneksi tetap ke IP, tapi
   * sertifikat dicek terhadap nama domain aslinya (mis. mail.arsipitaloka.id).
   */
  servername?: string;
};

export async function getSmtpConfig(): Promise<SmtpConfig> {
  const s = await getSettingsSafe();

  const host = s["contact.smtp.host"]?.trim() || process.env.SMTP_HOST?.trim() || "";
  const portRaw = s["contact.smtp.port"]?.trim() || process.env.SMTP_PORT?.trim() || "587";
  const user = s["contact.smtp.user"]?.trim() || process.env.SMTP_USER?.trim() || "";
  const pass = s["contact.smtp.pass"]?.trim() || process.env.SMTP_PASS?.trim() || "";
  const from =
    s["contact.smtp.from"]?.trim() ||
    process.env.SMTP_FROM?.trim() ||
    user ||
    "no-reply@arsippitaloka.com";
  const to =
    s["contact.smtp.to"]?.trim() ||
    process.env.SMTP_TO?.trim() ||
    s["company.email"]?.trim() ||
    user;
  const servername =
    s["contact.smtp.servername"]?.trim() ||
    process.env.SMTP_SERVERNAME?.trim() ||
    "";

  const port = Number.parseInt(portRaw, 10) || 587;
  const enabledRaw =
    s["contact.smtp.enabled"] || process.env.SMTP_ENABLED || "false";

  return {
    enabled: enabledRaw === "true" || enabledRaw === "1",
    host,
    port,
    // Port 465 = implicit TLS; selain itu STARTTLS.
    secure: port === 465,
    user,
    pass,
    from,
    to,
    servername: servername || undefined,
  };
}

export function isSmtpConfigured(config: SmtpConfig): boolean {
  return Boolean(config.host && config.user && config.pass && config.to);
}

/** SMTP siap dipakai untuk kirim email apa pun (tanpa perlu inbox tujuan). */
export function isSmtpUsable(config: SmtpConfig): boolean {
  return Boolean(config.host && config.user && config.pass);
}

export type ContactMessage = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export type SendResult = { ok: true } | { ok: false; error: string };

/**
 * Transporter di-cache per kombinasi host/port/user — supaya newsletter ke
 * ratusan penerima tidak membuat koneksi TLS baru untuk tiap email.
 */
const transporterCache = new Map<string, nodemailer.Transporter>();

function getTransporter(config: SmtpConfig): nodemailer.Transporter {
  const key = `${config.host}:${config.port}:${config.user}:${config.pass}:${config.servername ?? ""}`;
  const cached = transporterCache.get(key);
  if (cached) return cached;

  // Kalau host berupa alamat IP, nama domain asli dipakai untuk SNI +
  // verifikasi sertifikat TLS. Tanpa ini, koneksi TLS ke IP ditolak
  // (sertifikatnya dibuat untuk domain, bukan IP).
  const isIpHost = /^\d{1,3}(\.\d{1,3}){3}$/.test(config.host);
  const tls: Record<string, unknown> = {};
  if (config.servername) {
    tls.servername = config.servername;
  } else if (isIpHost) {
    console.warn(
      `SMTP: host ${config.host} berupa alamat IP tanpa "SMTP_SERVERNAME" — verifikasi sertifikat TLS dimatikan untuk host ini.`,
    );
    tls.rejectUnauthorized = false;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    // Batas waktu koneksi longgar: server Exim (rumahweb) kadang lambat
    // menjawab banner karena melakukan reverse-DNS lookup.
    connectionTimeout: 45_000,
    greetingTimeout: 45_000,
    socketTimeout: 60_000,
    ...(Object.keys(tls).length > 0 ? { tls } : {}),
    // Catatan: TIDAK memakai `pool: true`. Connection pool nodemailer
    // timeout saat setup koneksi ke server Exim (rumahweb) — tiap email
    // membuka koneksi sendiri, dikirim per batch 10 email.
  });

  transporterCache.set(key, transporter);
  return transporter;
}

/**
 * Tutup semua koneksi SMTP yang di-cache.
 *
 * Dipakai skrip CLI supaya proses langsung berhenti (koneksi pool yang
 * terbuka membuat Node tidak exit).
 */
export function closeMailTransporters(): void {
  for (const transporter of transporterCache.values()) {
    transporter.close();
  }
  transporterCache.clear();
}

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Nama pengirim yang ditampilkan — mis. "Arsip Pitaloka". */
  fromName?: string;
  replyTo?: string;
};

/**
 * Kirim satu email HTML. Tidak melempar error — kegagalan dikembalikan
 * sebagai `{ ok: false }` supaya pemanggil bisa Decide sendiri.
 */
export async function sendHtmlEmail(
  config: SmtpConfig,
  message: MailMessage,
): Promise<SendResult> {
  if (!isSmtpUsable(config)) {
    return { ok: false, error: "SMTP belum dikonfigurasi." };
  }

  const from = message.fromName
    ? `"${message.fromName.replace(/"/g, "")}" <${config.from}>`
    : config.from;

  try {
    await getTransporter(config).sendMail({
      from,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    return { ok: true };
  } catch (error) {
    console.error("SMTP send error", error);
    return { ok: false, error: "Gagal mengirim email." };
  }
}

/** Kirim pesan kontak ke inbox pemilik situs. */
export async function sendContactEmail(
  config: SmtpConfig,
  msg: ContactMessage,
): Promise<SendResult> {
  if (!config.enabled) {
    return { ok: false, error: "Formulir kontak sedang dinonaktifkan." };
  }
  if (!isSmtpConfigured(config)) {
    return { ok: false, error: "SMTP belum dikonfigurasi oleh admin." };
  }

  try {
    const transporter = getTransporter(config);

    const subject = msg.subject?.trim()
      ? `[Kontak] ${msg.subject.trim()}`
      : "[Kontak] Pesan baru dari situs";

    await transporter.sendMail({
      from: config.from,
      to: config.to,
      replyTo: msg.email,
      subject,
      text: `Nama: ${msg.name}\nEmail: ${msg.email}\n\n${msg.message}`,
      html: `
        <p><strong>Nama:</strong> ${escapeHtml(msg.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
        ${msg.subject ? `<p><strong>Subjek:</strong> ${escapeHtml(msg.subject)}</p>` : ""}
        <hr />
        <p>${escapeHtml(msg.message).replace(/\n/g, "<br />")}</p>
      `,
    });

    return { ok: true };
  } catch (error) {
    console.error("SMTP send error", error);
    return { ok: false, error: "Gagal mengirim pesan. Coba lagi nanti." };
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
