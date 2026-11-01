/**
 * Template email Arsip Pitaloka.
 *
 * Semua template memakai satu kerangka (lihat `theme.ts`) supaya tampilan
 * email konsisten dengan tema situs: maroon + kuning aksen.
 *
 * Setiap template mengembalikan `{ html, text }` — `text` dipakai sebagai
 * fallback untuk klien email yang tidak menampilkan HTML.
 */

import {
  MAIL_THEME,
  escapeHtml,
  htmlParagraphs,
  mailLayout,
  siteUrl,
} from "./theme";

export type MailContent = { html: string; text: string };

/** Kartu konten baru (buku / berita / artikel / dokumentasi). */
export function contentAnnouncementMail(options: {
  eyebrow: string;
  title: string;
  excerpt?: string | null;
  url: string;
  ctaLabel?: string;
  coverUrl?: string | null;
  unsubscribeUrl?: string;
}): MailContent {
  const {
    eyebrow,
    title,
    excerpt,
    url,
    ctaLabel = "Baca selengkapnya",
    coverUrl,
    unsubscribeUrl,
  } = options;

  const coverHtml = coverUrl
    ? `<img src="${escapeHtml(coverUrl)}" alt="${escapeHtml(title)}" width="544" style="display:block;width:100%;max-width:544px;height:auto;border:0;border-radius:10px;margin:0 0 20px 0;" />`
    : "";

  const excerptHtml = excerpt
    ? `<p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:${MAIL_THEME.body};">${escapeHtml(excerpt).replace(/\n/g, "<br />")}</p>`
    : "";

  const html = mailLayout({
    preheader: excerpt ? `${title} — ${excerpt}` : title,
    heading: title,
    bodyHtml: `
      <p style="margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${MAIL_THEME.maroonSoft};">${escapeHtml(eyebrow)}</p>
      ${coverHtml}
      ${excerptHtml}
    `,
    cta: { label: ctaLabel, url },
    footerNote: "Ada konten baru untuk Anda",
    unsubscribeUrl,
  });

  const text = [
    eyebrow.toUpperCase(),
    "",
    title,
    "",
    excerpt ?? "",
    "",
    `${ctaLabel}: ${url}`,
    "",
    "Beranda: " + siteUrl("/"),
    "Katalog Buku: " + siteUrl("/buku"),
    unsubscribeUrl ? `Berhenti langganan: ${unsubscribeUrl}` : "",
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  return { html, text };
}

/** Pengumuman manual dari admin (tanpa konten spesifik). */
export function manualAnnouncementMail(options: {
  subject: string;
  body: string;
  url?: string | null;
  ctaLabel?: string;
  unsubscribeUrl?: string;
}): MailContent {
  const { subject, body, url, ctaLabel = "Lihat di situs", unsubscribeUrl } = options;

  const html = mailLayout({
    preheader: body.slice(0, 120),
    heading: subject,
    bodyHtml: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:${MAIL_THEME.body};">${htmlParagraphs(body)}</div>`,
    cta: url ? { label: ctaLabel, url } : undefined,
    footerNote: "Pengumuman dari Arsip Pitaloka",
    unsubscribeUrl,
  });

  const text = [subject, "", body, "", url ? `${ctaLabel}: ${url}` : ""]
    .filter(Boolean)
    .join("\n");

  return { html, text };
}

/** OTP reset password — kode 6 angka, berlaku 5 menit. */
export function resetOtpMail(options: {
  code: string;
  minutes: number;
  name?: string | null;
}): MailContent {
  const { code, minutes, name } = options;

  const html = mailLayout({
    preheader: `Kode OTP reset password: ${code} (berlaku ${minutes} menit)`,
    heading: "Reset password",
    bodyHtml: `
      <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:${MAIL_THEME.body};">
        ${name ? `Halo ${escapeHtml(name)},` : "Halo,"} kami menerima permintaan reset password untuk akun Arsip Pitaloka Anda.
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0;background-color:${MAIL_THEME.cream};border:1px solid ${MAIL_THEME.line};border-radius:12px;">
        <tr>
          <td align="center" style="padding:22px 34px;">
            <p style="margin:0 0 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${MAIL_THEME.body};">Kode OTP Anda</p>
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:46px;font-weight:bold;letter-spacing:8px;color:${MAIL_THEME.maroon};">${escapeHtml(code)}</p>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:${MAIL_THEME.body};">
        Kode ini berlaku <strong style="color:${MAIL_THEME.ink};">${minutes} menit</strong> sejak dikirim, dan hanya bisa dipakai sekali.
      </p>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:${MAIL_THEME.body};">
        Jangan bagikan kode ini kepada siapa pun, termasuk pihak yang mengaku sebagai tim kami. Kalau bukan Anda yang meminta reset password, abaikan email ini — password Anda tidak berubah.
      </p>
    `,
    footerNote: "Arsip Pitaloka — keamanan akun",
  });

  const text = [
    "Reset password — Arsip Pitaloka",
    "",
    `Kode OTP: ${code}`,
    `Berlaku ${minutes} menit, hanya bisa dipakai sekali.`,
    "",
    "Kalau bukan Anda yang meminta, abaikan email ini.",
  ].join("\n");

  return { html, text };
}

/** Email sambutan untuk pelanggan baru (selamat datang). */
export function welcomeMail(options: {
  name?: string | null;
  unsubscribeUrl?: string;
}): MailContent {
  const { name, unsubscribeUrl } = options;
  const greeting = name ? `Halo ${name},` : "Halo,";

  const html = mailLayout({
    preheader: "Selamat datang di Arsip Pitaloka — akun Anda sudah aktif.",
    heading: "Selamat datang di Arsip Pitaloka",
    bodyHtml: `
      <p style="margin:0 0 14px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:${MAIL_THEME.body};">${greeting} akun Anda sudah aktif. Sekarang Anda bisa:</p>
      <ul style="margin:0 0 16px 0;padding:0 0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:26px;color:${MAIL_THEME.body};">
        <li>menjelajah koleksi e-book di katalog Pitaloka,</li>
        <li>menyimpan buku yang sudah dibeli di Pustaka Saya,</li>
        <li>menerima kabar terbaru tentang buku, berita, dan dokumentasi baru.</li>
      </ul>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:${MAIL_THEME.body};">
        Pustaka digital &amp; e-book karya Rieke Diah Pitaloka — disimpan dan lestarkan untuk semua.
      </p>
    `,
    cta: { label: "Jelajahi katalog", url: siteUrl("/buku") },
    footerNote: "Arsip Pitaloka",
    unsubscribeUrl,
  });

  const text = [
    "Selamat datang di Arsip Pitaloka",
    "",
    `${greeting} akun Anda sudah aktif.`,
    "",
    "Jelajahi katalog: " + siteUrl("/buku"),
    "Pustaka Saya: " + siteUrl("/akun"),
  ].join("\n");

  return { html, text };
}
