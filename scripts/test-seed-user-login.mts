/**
 * Uji login user seed (pembeli) + isi Pustaka Saya.
 *
 * Jalankan: npx tsx scripts/test-seed-user-login.mts [email] [password]
 */
const email = process.argv[2] ?? "rizky.pratama@example.com";
const password = process.argv[3] ?? "Pitaloka2026!";
const BASE = process.env.BASE_URL ?? "http://localhost:3000";

async function main() {
  let cookie = "";
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
  cookie = (csrfRes.headers.getSetCookie() ?? []).map((c) => c.split(";")[0]).join("; ");
  console.log("csrf token: didapat");

  const form = new URLSearchParams({ csrfToken, email, password, redirect: "false" });
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", cookie },
    body: form.toString(),
    redirect: "manual",
  });
  console.log(`POST /api/auth/callback/credentials → ${res.status}`);
  const setCookies = res.headers.getSetCookie() ?? [];
  cookie = [cookie, ...setCookies.map((c) => c.split(";")[0])].filter(Boolean).join("; ");

  const session = await fetch(`${BASE}/api/auth/session`, { headers: { cookie } });
  const data = await session.json();
  console.log("sesi:", JSON.stringify(data));

  for (const path of ["/akun", "/akun/orders", "/akun/library"]) {
    const page = await fetch(`${BASE}${path}`, { headers: { cookie }, redirect: "manual" });
    console.log(`GET ${path} → ${page.status}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
