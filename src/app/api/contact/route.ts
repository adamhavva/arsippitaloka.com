import { getSmtpConfig, sendContactEmail } from "@/lib/smtp";
import { isValidEmail } from "@/lib/email";

/**
 * POST /api/contact — kirim pesan dari formulir kontak lewat SMTP.
 *
 * Body: { name, email, subject?, message }. Fitur bisa dimatikan admin
 * (setting `contact.smtp.enabled`) → balas 503.
 */
export async function POST(request: Request) {
  let body: {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
  };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const subject = body.subject?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !message) {
    return Response.json(
      { error: "Nama, email, dan pesan wajib diisi." },
      { status: 400 },
    );
  }
  if (!isValidEmail(email)) {
    return Response.json({ error: "Email tidak valid." }, { status: 400 });
  }
  if (message.length > 5000) {
    return Response.json({ error: "Pesan terlalu panjang." }, { status: 400 });
  }

  const config = await getSmtpConfig();
  if (!config.enabled) {
    return Response.json(
      { error: "Formulir kontak sedang dinonaktifkan." },
      { status: 503 },
    );
  }

  const result = await sendContactEmail(config, { name, email, subject, message });
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 502 });
  }

  return Response.json({ ok: true });
}
