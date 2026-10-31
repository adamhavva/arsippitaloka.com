import nodemailer from "nodemailer";
import { getSettings } from "@/lib/site-settings";

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
};

export async function getSmtpConfig(): Promise<SmtpConfig> {
  const s = await getSettings();

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
  };
}

export function isSmtpConfigured(config: SmtpConfig): boolean {
  return Boolean(config.host && config.user && config.pass && config.to);
}

export type ContactMessage = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export type SendResult = { ok: true } | { ok: false; error: string };

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
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });

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
