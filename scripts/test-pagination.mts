/**
 * Uji pagination: login admin via HTTP, lalu cek setiap tabel/list punya
 * paginasi dan jumlah baris per halaman sesuai ?per=.
 */
import "dotenv/config";

const BASE = process.env.AUTH_URL ?? "http://localhost:3000";
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) throw new Error("ADMIN_EMAIL/ADMIN_PASSWORD belum di-set");

const jar = new Map<string, string>();

function storeCookies(res: Response) {
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const idx = pair.indexOf("=");
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    if (v === "") jar.delete(k);
    else jar.set(k, v);
  }
}

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passed++;
    console.log(`OK   ${name}`);
  } else {
    failed++;
    console.log(`GAGAL ${name} ${detail}`);
  }
}

// login
const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
storeCookies(csrfRes);
const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
  method: "POST",
  headers: {
    "content-type": "application/x-www-form-urlencoded",
    cookie: cookieHeader(),
  },
  body: new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${BASE}/admin`,
  }).toString(),
  redirect: "manual",
});
storeCookies(loginRes);
check(
  "login admin",
  loginRes.status === 302 && (loginRes.headers.get("location") ?? "").endsWith("/admin"),
  `${loginRes.status} ${loginRes.headers.get("location")}`,
);

async function get(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { cookie: cookieHeader() },
    redirect: "manual",
  });
  return { status: res.status, html: await res.text() };
}

/** Hitung baris <tbody> dari markup tabel. */
function countRows(html: string): number {
  const tbody = html.split("<tbody")[1]?.split("</tbody>")[0] ?? "";
  return (tbody.match(/<tr/g) ?? []).length;
}

const tables: { path: string; label: string; per: number }[] = [
  { path: "/admin/book", label: "buku", per: 5 },
  { path: "/admin/category", label: "kategori", per: 5 },
  { path: "/admin/tab", label: "tab konten", per: 5 },
  { path: "/admin/users", label: "user", per: 5 },
  { path: "/admin/orders", label: "order", per: 5 },
];

for (const t of tables) {
  const p1 = await get(`${t.path}?per=${t.per}`);
  const rows1 = countRows(p1.html);
  const hasPager = p1.html.includes('aria-label="Paginasi"');
  check(
    `${t.label}: ?per=${t.per} → ${rows1} baris (≤ ${t.per})`,
    p1.status === 200 && rows1 > 0 && rows1 <= t.per,
    `${p1.status} rows=${rows1}`,
  );
  check(`${t.label}: kontrol paginasi ada`, hasPager);

  // Halaman 2 (kalau ada baris lebih dari per)
  const p2 = await get(`${t.path}?per=${t.per}&page=2`);
  const rows2 = countRows(p2.html);
  check(
    `${t.label}: halaman 2 → ${rows2} baris`,
    p2.status === 200 && rows2 > 0 && rows2 <= t.per,
    `${p2.status} rows=${rows2}`,
  );

  // per=1 harus ditolak (minimal 5) → sama dengan default 10
  const bad = await get(`${t.path}?per=1`);
  const rowsBad = countRows(bad.html);
  const def = await get(`${t.path}?per=10`);
  const rowsDef = countRows(def.html);
  check(
    `${t.label}: per=1 diabaikan → ${rowsBad} baris (sama dengan default ${rowsDef})`,
    rowsBad === rowsDef,
    `per1=${rowsBad} default=${rowsDef}`,
  );
}

// Halaman edit harus tetap berfungsi walau barisnya berada di halaman lain.
const edit = await get("/admin/book?edit=seed-book-0&per=5&page=2");
check(
  "edit entitas tetap termuat (bisa di halaman lain)",
  edit.status === 200 && edit.html.includes('name="title"'),
  `${edit.status}`,
);

console.log(`\n${passed}/${passed + failed} lolos`);
if (failed > 0) process.exitCode = 1;

