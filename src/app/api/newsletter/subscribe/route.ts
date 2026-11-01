import { subscribeToNewsletter } from "@/lib/newsletter";

/**
 * POST /api/newsletter/subscribe
 *
 * Body: { email, name?, source? }. Dipakai form subscribe di footer dan
 * checkbox langganan di halaman register.
 */
export async function POST(request: Request) {
  let body: { email?: string; name?: string; source?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const email = (body.email ?? "").trim();
  const name = (body.name ?? "").trim();
  const source = (body.source ?? "footer").trim();

  if (!email) {
    return Response.json({ error: "Email wajib diisi." }, { status: 400 });
  }

  const result = await subscribeToNewsletter({
    email,
    name: name || null,
    source,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({
    ok: true,
    message: result.message,
    alreadySubscribed: result.alreadySubscribed,
  });
}
