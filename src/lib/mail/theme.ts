/**
 * Konstanta tema + helper kecil untuk email HTML.
 *
 * Email harus tampil baik di Outlook/Gmail yang tidak mendukung CSS modern,
 * jadi semua style ditulis inline (atribut style) dan layout memakai tabel.
 * Warna diambil dari tema situs: maroon `#561a1a`, maroon gelap `#3a1012`,
 * kuning aksen `#ffee33`, abu-abu teks `#606261`.
 */

export const MAIL_THEME = {
  maroon: "#561a1a",
  maroonDark: "#3a1012",
  maroonSoft: "#7a3232",
  accent: "#ffee33",
  ink: "#202124",
  body: "#606261",
  line: "#ece7e3",
  bg: "#f6f1ee",
  white: "#ffffff",
  cream: "#fbf7f5",
} as const;

/** URL dasar situs — dipakai untuk link di dalam email. */
export function siteUrl(path = "/"): string {
  const base = (
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000"
  )
    .trim()
    .replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

/** Logo putih (untuk header maroon). */
export function mailLogoUrl(): string {
  return siteUrl("/images/logo-pitaloka.png");
}

export function escapeHtml(value: string): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Teks polos → paragraf HTML (baris baru jadi <br />). */
export function htmlParagraphs(text: string): string {
  return (text ?? "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 14px 0;">${escapeHtml(p).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

/**
 * Kerangka email: header maroon + kartu konten + footer.
 *
 * `preheader` adalah teks yang sebenarnya terlihat di inbox (preview) tapi
 * disembunyikan di badan email.
 */
export function mailLayout(options: {
  preheader: string;
  heading: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
  footerNote?: string;
  unsubscribeUrl?: string;
}): string {
  const { preheader, heading, bodyHtml, cta, footerNote, unsubscribeUrl } = options;

  const ctaHtml = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px 0;">
        <tr>
          <td align="center" bgcolor="${MAIL_THEME.maroon}" style="border-radius:8px;">
            <a href="${escapeHtml(cta.url)}" target="_blank" style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(cta.label)}</a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MAIL_THEME.body};text-align:center;">
        <a href="${escapeHtml(cta.url)}" target="_blank" style="color:${MAIL_THEME.maroon};text-decoration:underline;">${escapeHtml(cta.url)}</a>
      </p>`
    : "";

  const unsubscribeHtml = unsubscribeUrl
    ? `<p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MAIL_THEME.body};">
        You are receiving this email because you subscribed to Arsip Pitaloka updates.
        <a href="${escapeHtml(unsubscribeUrl)}" target="_blank" style="color:${MAIL_THEME.maroon};text-decoration:underline;">Unsubscribe</a>
      </p>`
    : "";

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background-color:${MAIL_THEME.bg};">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${MAIL_THEME.bg};">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:${MAIL_THEME.white};border-radius:16px;overflow:hidden;border:1px solid ${MAIL_THEME.line};">
          <tr>
            <td bgcolor="${MAIL_THEME.maroon}" style="padding:22px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;">
                    <img src="${escapeHtml(mailLogoUrl())}" alt="Arsip Pitaloka" width="150" style="display:block;width:150px;max-width:150px;height:auto;border:0;" />
                  </td>
                  <td align="right" valign="middle" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${MAIL_THEME.accent};">
                    Pustaka digital<br />&amp; e-book karya Rieke Diah Pitaloka
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:30px 28px 8px 28px;">
              <h1 style="margin:0 0 14px 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:34px;color:${MAIL_THEME.ink};">${escapeHtml(heading)}</h1>
              ${bodyHtml}
              ${ctaHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 28px 26px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${MAIL_THEME.line};">
                <tr>
                  <td style="padding-top:16px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:20px;color:${MAIL_THEME.body};">
                    <p style="margin:0 0 8px 0;font-weight:bold;color:${MAIL_THEME.maroon};">${escapeHtml(footerNote ?? "Arsip Pitaloka")}</p>
                    <p style="margin:0 0 8px 0;">
                      <a href="${escapeHtml(siteUrl("/"))}" target="_blank" style="color:${MAIL_THEME.body};text-decoration:underline;">Beranda</a>
                      &nbsp;·&nbsp;
                      <a href="${escapeHtml(siteUrl("/buku"))}" target="_blank" style="color:${MAIL_THEME.body};text-decoration:underline;">Katalog Buku</a>
                      &nbsp;·&nbsp;
                      <a href="${escapeHtml(siteUrl("/news-and-views"))}" target="_blank" style="color:${MAIL_THEME.body};text-decoration:underline;">News &amp; Views</a>
                      &nbsp;·&nbsp;
                      <a href="${escapeHtml(siteUrl("/about"))}" target="_blank" style="color:${MAIL_THEME.body};text-decoration:underline;">About</a>
                      &nbsp;·&nbsp;
                      <a href="${escapeHtml(siteUrl("/kontak"))}" target="_blank" style="color:${MAIL_THEME.body};text-decoration:underline;">Kontak</a>
                    </p>
                    ${unsubscribeHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:14px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#9b8d88;text-align:center;">
          © ${new Date().getFullYear()} Arsip Pitaloka. All Rights Reserved.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
