import { unsubscribeFromNewsletter, verifyUnsubscribeToken } from "@/lib/newsletter";
import { normalizeEmail } from "@/lib/email";
import { siteUrl } from "@/lib/mail/theme";

/**
 * GET /api/newsletter/unsubscribe?email=…&token=…
 *
 * Link berhenti langganan yang ada di footer setiap email newsletter.
 * Token HMAC memastikan orang lain tidak bisa berhentikan langganan
 * subscription dengan menebak alamat email.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get("email"));
  const token = url.searchParams.get("token") ?? "";

  const valid = Boolean(email) && verifyUnsubscribeToken(email, token);

  if (valid) {
    await unsubscribeFromNewsletter(email);
  }

  const title = valid ? "Berhenti langganan berhasil" : "Tautan tidak valid";
  const body = valid
    ? "Email ini tidak akan menerima kabar terbaru dari Arsip Pitaloka lagi. Kalau berubah pikiran, kamu bisa berlangganan lagi kapan saja."
    : "Tautan berhenti langganan ini tidak valid atau sudah kadaluarsa. Silakan|langganan lagi dari footer situs.";

  const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title} — Arsip Pitaloka</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f1ee;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f1ee;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background-color:#ffffff;border:1px solid #ece7e3;border-radius:16px;overflow:hidden;">
          <tr>
            <td bgcolor="#561a1a" style="padding:22px 28px;">
              <img src="${siteUrl("/images/logo-pitaloka.png")}" alt="Arsip Pitaloka" width="150" style="display:block;width:150px;max-width:150px;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:30px 28px;">
              <h1 style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',serif;font-size:24px;line-height:32px;color:#202124;">${title}</h1>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:24px;color:#606261;">${body}</p>
              <a href="${siteUrl("/")}" style="display:inline-block;padding:12px 24px;background-color:#561a1a;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:bold;">Kembali ke beranda</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return new Response(html, {
    status: valid ? 200 : 400,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
