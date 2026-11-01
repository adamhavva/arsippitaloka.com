import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { getSettingsSafe } from "@/lib/site-settings";
import { getSmtpConfig, isSmtpUsable, sendHtmlEmail } from "@/lib/smtp";
import { normalizeEmail, isValidEmail } from "@/lib/email";
import {
  contentAnnouncementMail,
  manualAnnouncementMail,
  welcomeMail,
  type MailContent,
} from "@/lib/mail/templates";
import { siteUrl } from "@/lib/mail/theme";
import { BOOK_TAB_SLUG } from "@/lib/site-tabs";

/**
 * Newsletter Arsip Pitaloka.
 *
 * - Pelanggan disimpan di tabel `NewsletterSubscriber`.
 * - Saat admin memuat konten baru (buku / berita / artikel / dokumentasi),
 *   email berisi ringkasan + tautan ke detail konten dikirim ke semua
 *   pelanggan aktif.
 * - Setiap email punya tautan "unsubscribe" ber-token supaya penerima bisa
 *   berhenti sendiri tanpa perlu hubungi admin.
 */

export type NewsletterSettings = {
  enabled: boolean;
  fromName: string;
  /** Kirim email selamat datang saat pelanggan baru subscribe. */
  sendWelcome: boolean;
};

export async function getNewsletterSettings(): Promise<NewsletterSettings> {
  const s = await getSettingsSafe();
  return {
    enabled: s["newsletter.enabled"] !== "false",
    fromName: s["newsletter.fromName"]?.trim() || "Arsip Pitaloka",
    sendWelcome: s["newsletter.sendWelcome"] !== "false",
  };
}

/**
 * Token unsubscribe — HMAC dari email + AUTH_SECRET.
 *
 * Mengganti email di URL tidak bisa dipakai untuk unsubscribe orang lain,
 * karena tokennya tidak akan cocok.
 */
export function unsubscribeToken(email: string): string {
  const secret = process.env.AUTH_SECRET || "arsip-pitaloka";
  return createHmac("sha256", secret)
    .update(normalizeEmail(email))
    .digest("hex")
    .slice(0, 24);
}

export function unsubscribeUrl(email: string): string {
  const normalized = normalizeEmail(email);
  return siteUrl(
    `/api/newsletter/unsubscribe?email=${encodeURIComponent(normalized)}&token=${unsubscribeToken(normalized)}`,
  );
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(String(token ?? ""));
  if (expected.length !== given.length) return false;
  return timingSafeEqual(expected, given);
}

export type SubscribeResult =
  | { ok: true; message: string; alreadySubscribed: boolean }
  | { ok: false; error: string };

/** Tambah (atau aktifkan kembali) pelanggan newsletter. */
export async function subscribeToNewsletter(options: {
  email: string;
  name?: string | null;
  source?: string;
  /** Kirim email sambutan (dipakai saat subscribe via form/registrasi). */
  sendWelcome?: boolean;
}): Promise<SubscribeResult> {
  const email = normalizeEmail(options.email);
  if (!isValidEmail(email)) {
    return { ok: false, error: "Format email tidak valid." };
  }

  const settings = await getNewsletterSettings();
  if (!settings.enabled) {
    return { ok: false, error: "Langganan newsletter sedang dinonaktifkan." };
  }

  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
  });

  const alreadySubscribed = Boolean(existing?.isActive);

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: {
      email,
      name: options.name?.trim() || null,
      source: options.source ?? "footer",
      isActive: true,
      unsubscribedAt: null,
    },
    update: {
      isActive: true,
      unsubscribedAt: null,
      name: options.name?.trim() || existing?.name || null,
      source: options.source ?? existing?.source ?? "footer",
    },
  });

  const sendWelcome =
    options.sendWelcome ?? (settings.sendWelcome && !alreadySubscribed);

  if (sendWelcome) {
    await sendWelcomeEmail(email, options.name ?? existing?.name ?? null);
  }

  return {
    ok: true,
    alreadySubscribed,
    message: alreadySubscribed
      ? "Anda sudah terdaftar di daftar newsletter kami."
      : "Berhasil! Silakan cek email Anda untuk konfirmasi.",
  };
}

/** Berhenti langganan (dipakai link di email & admin). */
export async function unsubscribeFromNewsletter(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!normalized) return;
  await prisma.newsletterSubscriber.updateMany({
    where: { email: normalized },
    data: { isActive: false, unsubscribedAt: new Date() },
  });
}

async function sendWelcomeEmail(
  email: string,
  name: string | null,
): Promise<void> {
  const config = await getSmtpConfig();
  if (!isSmtpUsable(config)) return;

  const settings = await getNewsletterSettings();
  const mail = welcomeMail({ name, unsubscribeUrl: unsubscribeUrl(email) });

  await sendHtmlEmail(config, {
    to: email,
    subject: "Selamat datang di Arsip Pitaloka",
    html: mail.html,
    text: mail.text,
    fromName: settings.fromName,
  });
}

/**
 * URL gambar untuk email.
 *
 * Gambar yang diunggah admin disimpan sebagai data URL (base64) — data URL
 * tidak bisa dimuat oleh email client, jadi dilewati. URL relatif
 * (`/images/...`) diubah jadi absolut.
 */
export function absoluteMediaUrl(
  url: string | null | undefined,
): string | null {
  const value = (url ?? "").trim();
  if (!value || value.startsWith("data:")) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return siteUrl(value.startsWith("/") ? value : `/${value}`);
}

export type BroadcastKind = "book" | "article" | "documentation" | "manual";

/** Data konten yang bisa dijadikan pengumuman newsletter. */
export type ContentRecord = {
  title: string;
  slug: string;
  excerpt?: string | null;
  lead?: string | null;
  /** Buku memakai `description` sebagai ringkasan. */
  description?: string | null;
  coverUrl?: string | null;
  /** Dokumentasi memakai `photoUrl`, bukan `coverUrl`. */
  photoUrl?: string | null;
  published?: boolean;
  /** Untuk artikel: "berita-terkini" | "blog" | "umkm". */
  type?: string | null;
};

/** Buang tag HTML (mis. isi richtext) supaya ringkasan email tetap bersih. */
function stripHtml(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Susun pengumuman newsletter dari sebuah konten (buku / artikel /
 * dokumentasi). `null` kalau jenisnya tidak ikut dikirim lewat newsletter.
 */
export function buildContentBroadcast(
  key: string,
  record: ContentRecord,
): BroadcastInput | null {
  if (key === "book") {
    return {
      kind: "book",
      eyebrow: "E-Book Baru",
      title: record.title,
      excerpt: stripHtml(record.excerpt ?? record.description).slice(0, 320),
      path: `/buku/${BOOK_TAB_SLUG}/${record.slug}`,
      ctaLabel: "Lihat buku",
      coverUrl: absoluteMediaUrl(record.coverUrl),
    };
  }

  if (key === "article") {
    const label =
      record.type === "blog"
        ? "Blog Baru"
        : record.type === "umkm"
          ? "UMKM Baru"
          : "Berita Terkini";
    return {
      kind: "article",
      eyebrow: label,
      title: record.title,
      excerpt: stripHtml(record.excerpt).slice(0, 320),
      path: `/artikel/${record.slug}`,
      ctaLabel: "Baca artikel",
      coverUrl: absoluteMediaUrl(record.coverUrl),
    };
  }

  if (key === "documentation") {
    return {
      kind: "documentation",
      eyebrow: "Dokumentasi Baru",
      title: record.title,
      excerpt: stripHtml(record.lead).slice(0, 320),
      path: `/dokumentasi/${record.slug}`,
      ctaLabel: "Lihat dokumentasi",
      coverUrl: absoluteMediaUrl(record.photoUrl ?? record.coverUrl),
    };
  }

  return null;
}


export type BroadcastInput = {
  kind: BroadcastKind;
  eyebrow: string;
  title: string;
  excerpt?: string | null;
  /** Path relatif di situs, mis. "/artikel/judul-artikel". */
  path: string;
  ctaLabel?: string;
  coverUrl?: string | null;
};

export type BroadcastResult = {
  ok: boolean;
  sent: number;
  failed: number;
  total: number;
  message: string;
};

/**
 * Kirim pengumuman ke semua pelanggan newsletter yang aktif.
 *
 * Dikirim per-batch (10 email per batch, 5 koneksi paralel) supaya tidak
 * membanjiri server SMTP. Kegagalan satu email tidak menggagalkan yang lain.
 */
export async function broadcastToSubscribers(
  input: BroadcastInput,
): Promise<BroadcastResult> {
  const settings = await getNewsletterSettings();
  if (!settings.enabled) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      total: 0,
      message: "Newsletter dinonaktifkan di pengaturan.",
    };
  }

  const config = await getSmtpConfig();
  if (!isSmtpUsable(config)) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      total: 0,
      message: "SMTP belum dikonfigurasi.",
    };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  if (subscribers.length === 0) {
    return {
      ok: true,
      sent: 0,
      failed: 0,
      total: 0,
      message: "Belum ada pelanggan newsletter.",
    };
  }

  const url = siteUrl(input.path);
  const subject = `${input.eyebrow}: ${input.title}`;

  let sent = 0;
  let failed = 0;

  const BATCH = 10;
  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH);
    // eslint-disable-next-line no-await-in-loop
    const results = await Promise.all(
      batch.map(async (subscriber) => {
        const mail = contentAnnouncementMail({
          eyebrow: input.eyebrow,
          title: input.title,
          excerpt: input.excerpt ?? null,
          url,
          ctaLabel: input.ctaLabel ?? "Baca selengkapnya",
          coverUrl: input.coverUrl ?? null,
          unsubscribeUrl: unsubscribeUrl(subscriber.email),
        });

        return sendHtmlEmail(config, {
          to: subscriber.email,
          subject,
          html: mail.html,
          text: mail.text,
          fromName: settings.fromName,
        });
      }),
    );

    for (const result of results) {
      if (result.ok) sent += 1;
      else failed += 1;
    }
  }

  await prisma.newsletterCampaign.create({
    data: {
      subject,
      kind: input.kind,
      url,
      recipients: sent,
    },
  });

  return {
    ok: true,
    sent,
    failed,
    total: subscribers.length,
    message:
      failed === 0
        ? `Terkirim ke ${sent} pelanggan newsletter.`
        : `Terkirim ke ${sent} pelanggan, ${failed} gagal.`,
  };
}

/** Pengumuman manual dari admin (subjek + isi bebas). */
export async function broadcastManualAnnouncement(options: {
  subject: string;
  body: string;
  path?: string | null;
  ctaLabel?: string;
}): Promise<BroadcastResult> {
  const settings = await getNewsletterSettings();
  if (!settings.enabled) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      total: 0,
      message: "Newsletter dinonaktifkan di pengaturan.",
    };
  }

  const config = await getSmtpConfig();
  if (!isSmtpUsable(config)) {
    return {
      ok: false,
      sent: 0,
      failed: 0,
      total: 0,
      message: "SMTP belum dikonfigurasi.",
    };
  }

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { isActive: true },
    select: { email: true },
    orderBy: { createdAt: "asc" },
  });

  if (subscribers.length === 0) {
    return {
      ok: true,
      sent: 0,
      failed: 0,
      total: 0,
      message: "Belum ada pelanggan newsletter.",
    };
  }

  const url = options.path ? siteUrl(options.path) : null;

  let sent = 0;
  let failed = 0;

  const BATCH = 10;
  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH);
    // eslint-disable-next-line no-await-in-loop
    const results = await Promise.all(
      batch.map(async (subscriber) => {
        const mail: MailContent = manualAnnouncementMail({
          subject: options.subject,
          body: options.body,
          url,
          ctaLabel: options.ctaLabel ?? "Lihat di situs",
          unsubscribeUrl: unsubscribeUrl(subscriber.email),
        });

        return sendHtmlEmail(config, {
          to: subscriber.email,
          subject: options.subject,
          html: mail.html,
          text: mail.text,
          fromName: settings.fromName,
        });
      }),
    );

    for (const result of results) {
      if (result.ok) sent += 1;
      else failed += 1;
    }
  }

  await prisma.newsletterCampaign.create({
    data: {
      subject: options.subject,
      kind: "manual",
      url,
      recipients: sent,
    },
  });

  return {
    ok: true,
    sent,
    failed,
    total: subscribers.length,
    message:
      failed === 0
        ? `Terkirim ke ${sent} pelanggan newsletter.`
        : `Terkirim ke ${sent} pelanggan, ${failed} gagal.`,
  };
}
