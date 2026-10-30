/**
 * Uji login admin lewat HTTP (tanpa menulis kredensial ke disk).
 * Membaca email/password dari .env, melakukan flow CSRF → callback credentials,
 * lalu memverifikasi sesi admin dengan GET /admin.
 */
import "dotenv/config";

const BASE = process.env.AUTH_URL ?? "http://localhost:3000";
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) throw new Error("ADMIN_EMAIL/ADMIN_PASSWORD belum di-set");

const jar = new Map<string, string>();

function storeCookies(res: Response) {
  const raw = res.headers.getSetCookie?.() ?? [];
  for (const c of raw) {
    const [pair] = c.split(";");
    const idx = pair.indexOf("=");
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    if (v === "" || /expires=thu, 01 jan 1970/i.test(c)) jar.delete(k);
    else jar.set(k, v);
  }
}

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

// 1. ambil CSRF token
const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
storeCookies(csrfRes);
const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
console.log("csrf token:", csrfToken ? "didapat" : "GAGAL");

// 2. POST credentials
const form = new URLSearchParams({
  csrfToken,
  email,
  password,
  callbackUrl: `${BASE}/admin`,
});
const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
  method: "POST",
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    cookie: cookieHeader(),
  },
  body: form.toString(),
  redirect: "manual",
});
storeCookies(loginRes);
console.log(
  "POST /api/auth/callback/credentials →",
  loginRes.status,
  "location:",
  loginRes.headers.get("location") ?? "-",
);
console.log("cookies sesi:", [...jar.keys()].join(", ") || "(tidak ada)");

// 3. cek sesi + akses /admin
const sessionRes = await fetch(`${BASE}/api/auth/session`, {
  headers: { cookie: cookieHeader() },
});
const session = (await sessionRes.json()) as {
  user?: { email?: string; role?: string };
};
console.log("sesi:", JSON.stringify(session));

const adminRes = await fetch(`${BASE}/admin`, {
  headers: { cookie: cookieHeader() },
  redirect: "manual",
});
console.log("GET /admin →", adminRes.status, adminRes.headers.get("location") ?? "-");
const body = adminRes.status === 200 ? await adminRes.text() : "";
console.log(
  "isi /admin mengandung sidebar:",
  body.includes("Pitaloka") && body.includes("Dashboard") ? "ya" : "tidak",
);
