/**
 * Uji coba pembayaran Midtrans SANDBOX secara lokal.
 *
 * Alur:
 *   1. buat pembeli sementara + login lewat HTTP
 *   2. POST /api/checkout → memastikan Midtrans sandbox menerima transaksi
 *      dan mengembalikan redirect_url Snap
 *   3. GET /api/payment/status → status masih pending
 *   4. POST notifikasi (webhook) dengan signature yang dihitung dari server key
 *      milik sendiri → order jadi lunas
 *   5. GET /api/payment/status → lunas, dan buku muncul di Pustaka Saya
 *
 * Semua data uji dibersihkan di akhir. Tidak ada kredensial yang ditulis ke disk.
 */
import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const BASE = process.env.AUTH_URL ?? "http://localhost:3000";
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY ?? "";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

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

function log(step: string, ok: boolean, detail = "") {
  console.log(`${ok ? "OK  " : "GAGAL"} ${step}${detail ? ` — ${detail}` : ""}`);
  if (!ok) process.exitCode = 1;
}

async function main() {
  if (!SERVER_KEY) throw new Error("MIDTRANS_SERVER_KEY belum di-set di .env");

  // 1. pembeli sementara
  const email = `midtrans-uji-${randomUUID().slice(0, 8)}@mail.com`;
  const password = randomUUID();
  const user = await prisma.user.create({
    data: {
      name: "Uji Midtrans",
      email,
      passwordHash: await hashPassword(password),
      role: "CUSTOMER",
      isActive: true,
    },
  });

  try {
    // 2. login
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
        callbackUrl: `${BASE}/akun`,
      }).toString(),
      redirect: "manual",
    });
    storeCookies(loginRes);
    log("login pembeli", loginRes.status < 400);

    // 3. pilih buku berbayar yang belum dimiliki pembeli ini
    const book = await prisma.book.findFirst({
      where: { archived: false, isFree: false, priceUsd: { gt: 0 } },
      orderBy: { order: "asc" },
    });
    if (!book) throw new Error("Tidak ada buku berbayar untuk diuji");
    console.log(`     buku uji: ${book.title}`);

    // 4. checkout
    const checkoutRes = await fetch(`${BASE}/api/checkout`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: cookieHeader() },
      body: JSON.stringify({ bookId: book.id }),
    });
    const checkout = (await checkoutRes.json()) as {
      orderId?: string;
      redirectUrl?: string;
      error?: string;
    };
    log(
      "POST /api/checkout",
      checkoutRes.status === 200 && Boolean(checkout.redirectUrl),
      checkout.error ?? checkout.redirectUrl ?? "-",
    );
    if (!checkout.orderId || !checkout.redirectUrl) return;

    log(
      "redirect ke host sandbox Midtrans",
      checkout.redirectUrl.includes("app.sandbox.midtrans.com"),
      checkout.redirectUrl.split("?")[0],
    );

    const snapRes = await fetch(checkout.redirectUrl, { redirect: "follow" });
    log("halaman Snap terbuka", snapRes.ok, `HTTP ${snapRes.status}`);

    // 5. status sebelum lunas
    const pendingRes = await fetch(`${BASE}/api/payment/status/${checkout.orderId}`, {
      headers: { cookie: cookieHeader() },
      cache: "no-store",
    });
    const pending = (await pendingRes.json()) as { status?: string };
    log("status sebelum lunas = PENDING", pending.status === "PENDING", pending.status ?? "-");

    // 6. notifikasi dengan signature sah (dihitung dari server key sendiri)
    const order = await prisma.order.findUnique({
      where: { id: checkout.orderId },
      select: { total: true },
    });
    const gross = String(Number(order?.total ?? 0));
    const raw = `${checkout.orderId}200${gross}${SERVER_KEY}`;
    const signature = createHash("sha512").update(raw).digest("hex");

    const notify = await fetch(`${BASE}/api/webhook/midtrans`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        order_id: checkout.orderId,
        status_code: "200",
        gross_amount: gross,
        transaction_status: "settlement",
        signature,
      }),
    });
    log("POST webhook (signature sah)", notify.ok, `HTTP ${notify.status}`);

    // 7. signature salah harus ditolak
    const badRes = await fetch(`${BASE}/api/webhook/midtrans`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        order_id: checkout.orderId,
        status_code: "200",
        gross_amount: gross,
        transaction_status: "settlement",
        signature: "a".repeat(128),
      }),
    });
    log("POST webhook (signature salah) ditolak", badRes.status === 403, `HTTP ${badRes.status}`);

    // 8. status setelah lunas + cek pustaka
    const paidRes = await fetch(`${BASE}/api/payment/status/${checkout.orderId}`, {
      headers: { cookie: cookieHeader() },
      cache: "no-store",
    });
    const paid = (await paidRes.json()) as { status?: string };
    log("status setelah lunas = PAID", paid.status === "PAID", paid.status ?? "-");

    const libraryRes = await fetch(`${BASE}/akun`, { headers: { cookie: cookieHeader() } });
    const libraryHtml = await libraryRes.text();
    log(
      "buku masuk Pustaka Saya",
      libraryHtml.includes(book.title.slice(0, 18)),
      book.title,
    );

    const detailRes = await fetch(`${BASE}/akun/orders/${checkout.orderId}`, {
      headers: { cookie: cookieHeader() },
    });
    log(
      "halaman detail order terbuka",
      detailRes.status === 200,
      `HTTP ${detailRes.status}`,
    );
  } finally {
    await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
    console.log("data uji dibersihkan");
  }
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
