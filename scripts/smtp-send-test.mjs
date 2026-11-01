/**
 * Uji kirim email langsung lewat nodemailer (diagnostik).
 *
 *   node scripts/smtp-send-test.mjs
 *
 * Membaca kredensial dari .env, tidak mencetak password.
 */
import { readFileSync } from "node:fs";
import nodemailer from "nodemailer";

const env = Object.fromEntries(
  readFileSync(".env", "utf8")
    .split("\n")
    .filter((line) => line.includes("=") && !line.trim().startsWith("#"))
    .map((line) => {
      const idx = line.indexOf("=");
      return [
        line.slice(0, idx).trim(),
        line.slice(idx + 1).trim().replace(/^"|"$/g, ""),
      ];
    }),
);

const host = env.SMTP_HOST ?? "202.10.43.86";
const port = Number(env.SMTP_PORT ?? 465);
const servername = env.SMTP_SERVERNAME ?? "";

const transport = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  ...(servername ? { tls: { servername } } : {}),
  connectionTimeout: 30_000,
  greetingTimeout: 30_000,
  socketTimeout: 60_000,
});

try {
  const info = await transport.sendMail({
    from: `"Arsip Pitaloka" <${env.SMTP_FROM ?? env.SMTP_USER}>`,
    to: env.SMTP_TO ?? env.SMTP_USER,
    subject: "Uji kirim — Arsip Pitaloka",
    text: "Ini email uji coba dari server aplikasi.",
    html: "<p>Ini email uji coba dari server aplikasi.</p>",
  });
  console.log("BERHASIL:", info.response, "| id:", info.messageId);
} catch (error) {
  console.log("GAGAL:", error.code ?? "", error.message);
  console.log("detail:", error.responseCode ?? "", error.command ?? "");
}

transport.close();

// Variasi dengan pool (dipakai di src/lib/smtp.ts) untuk membandingkan.
const pooled = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  ...(servername ? { tls: { servername } } : {}),
  connectionTimeout: 20_000,
  greetingTimeout: 20_000,
  socketTimeout: 30_000,
  pool: true,
  maxConnections: 5,
});

try {
  const info = await pooled.sendMail({
    from: `"Arsip Pitaloka" <${env.SMTP_FROM ?? env.SMTP_USER}>`,
    to: env.SMTP_TO ?? env.SMTP_USER,
    subject: "Uji kirim (pool) — Arsip Pitaloka",
    text: "Uji kirim dengan connection pool.",
    html: "<p>Uji kirim dengan connection pool.</p>",
  });
  console.log("BERHASIL (pool):", info.response);
} catch (error) {
  console.log("GAGAL (pool):", error.code ?? "", error.message);
}
pooled.close();
process.exit(0);
