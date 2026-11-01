/**
 * Uji end-to-end alur pembayaran TANPA bergantung pada akun Midtrans.
 *
 * Menjalankan mock gateway Midtrans + dev server terpisah (port & distDir
 * sendiri), lalu menjalankan alur persis seperti pembeli sungguhan:
 *
 *   1. login pembeli
 *   2. POST /api/checkout            → order PENDING + transaksi Snap
 *   3. buka halaman Snap (mock)
 *   4. klik "Bayar"                  → mock menandai lunas dan MENGIRIM
 *                                      notifikasi webhook ke aplikasi
 *   5. finish callback mengarahkan ke halaman order
 *   6. order jadi PAID, buku masuk Pustaka Saya, /api/read boleh
 *
 * Semua data uji dibersihkan di akhir; dev server uji & mock gateway dimatikan.
 *
 * Jalankan: `npm run test:midtrans:mock`
 */
import "dotenv/config";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { startMockGateway } from "./midtrans-mock-gateway";

const APP_PORT = Number(process.env.MOCK_APP_PORT ?? 3100);
const GATEWAY_PORT = Number(process.env.MOCK_GATEWAY_PORT ?? 4010);
const APP_URL = `http://localhost:${APP_PORT}`;
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY?.trim() ?? "";

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

let failed = false;
function log(step: string, ok: boolean, detail = "") {
  console.log(`${ok ? "OK   " : "GAGAL"} ${step}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed = true;
}

async function waitFor(url: string, timeoutMs = 180_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) return true;
    } catch {
      // belum hidup
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  if (!SERVER_KEY) throw new Error("MIDTRANS_SERVER_KEY belum di-set di .env");

  // 1. mock gateway
  const gateway = await startMockGateway({
    port: GATEWAY_PORT,
    appUrl: APP_URL,
    serverKey: SERVER_KEY,
  });
  console.log(`mock gateway  : ${gateway.url}`);
  console.log(`dev server uji: ${APP_URL}`);

  // 2. dev server khusus uji (distDir sendiri supaya tidak bentrok)
  const child = spawn(
    "npx",
    ["next", "dev", "-p", String(APP_PORT)],
    {
      env: {
        ...process.env,
        NEXT_DIST_DIR: ".next-mock",
        MIDTRANS_SNAP_ENDPOINT: `${gateway.url}/snap/v1/transactions`,
        MIDTRANS_API_ENDPOINT: `${gateway.url}/v2`,
        MIDTRANS_ENABLED: "true",
        MIDTRANS_MODE: "sandbox",
        SITE_URL: APP_URL,
        NEXT_PUBLIC_SITE_URL: APP_URL,
      },
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
    },
  );

  // Simpan output dev server uji untuk diagnostik.
  const serverLog: string[] = [];
  child.stdout?.on("data", (d) => serverLog.push(String(d)));
  child.stderr?.on("data", (d) => serverLog.push(String(d)));
  const dumpLog = () => {
    if (serverLog.length) {
      console.log("--- output dev server uji ---");
      console.log(serverLog.join("").slice(-2000));
    }
  };

  const buyerEmail = `midtrans-mock-${randomUUID().slice(0, 8)}@mail.com`;
  const buyerPassword = randomUUID();
  let buyerId = "";

  try {
    const up = await waitFor(`${APP_URL}/api/webhook/midtrans`);
    if (!up) {
      dumpLog();
      throw new Error("dev server uji tidak siap");
    }
    log("dev server uji siap", true);

    // pembeli sementara
    const buyer = await prisma.user.create({
      data: {
        name: "Uji Mock Midtrans",
        email: buyerEmail,
        passwordHash: await hashPassword(buyerPassword),
        role: "CUSTOMER",
        isActive: true,
      },
    });
    buyerId = buyer.id;

    // login
    const csrfRes = await fetch(`${APP_URL}/api/auth/csrf`);
    storeCookies(csrfRes);
    const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };
    const loginRes = await fetch(`${APP_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        cookie: cookieHeader(),
      },
      body: new URLSearchParams({
        csrfToken,
        email: buyerEmail,
        password: buyerPassword,
        callbackUrl: `${APP_URL}/akun`,
      }).toString(),
      redirect: "manual",
    });
    storeCookies(loginRes);
    log("login pembeli", loginRes.status < 400);

    // buku uji
    const book = await prisma.book.findFirst({
      where: { archived: false, isFree: false, priceUsd: { gt: 0 } },
      orderBy: { order: "asc" },
    });
    if (!book) throw new Error("tidak ada buku berbayar untuk diuji");

    // checkout
    const checkoutRes = await fetch(`${APP_URL}/api/checkout`, {
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
      "POST /api/checkout (transaksi Snap dibuat)",
      checkoutRes.status === 200 && Boolean(checkout.orderId && checkout.redirectUrl),
      checkout.error ?? checkout.redirectUrl ?? "-",
    );
    if (!checkout.orderId || !checkout.redirectUrl) return;

    // halaman Snap
    const snapRes = await fetch(checkout.redirectUrl, { redirect: "follow" });
    const snapHtml = await snapRes.text();
    log(
      "halaman Snap terbuka",
      snapRes.ok && snapHtml.includes("Simulasi halaman Snap"),
      `HTTP ${snapRes.status}`,
    );

    // bayar → mock kirim webhook ke aplikasi
    const token = checkout.redirectUrl.split("/snap/")[1] ?? "";
    const payRes = await fetch(`${gateway.url}/snap/${token}/pay`, {
      method: "POST",
      redirect: "manual",
    });
    const finishLocation = payRes.headers.get("location") ?? "";
    log(
      "pembayaran diproses + webhook terkirim",
      payRes.status === 302 &&
        gateway.notifications.length === 1 &&
        gateway.notifications[0].status === 200,
      `webhook HTTP ${gateway.notifications[0]?.status ?? "-"} → ${finishLocation}`,
    );

    // finish callback (ikut redirect browser)
    const finishRes = await fetch(finishLocation, {
      redirect: "manual",
      headers: { cookie: cookieHeader() },
    });
    const orderLocation = finishRes.headers.get("location") ?? "";
    log(
      "finish callback → halaman order",
      finishRes.status >= 300 &&
        finishRes.status < 400 &&
        orderLocation.includes(`/akun/orders/${checkout.orderId}`),
      `${finishRes.status} → ${orderLocation}`,
    );

    // status order
    const statusRes = await fetch(
      `${APP_URL}/api/payment/status/${checkout.orderId}`,
      { headers: { cookie: cookieHeader() }, cache: "no-store" },
    );
    const status = (await statusRes.json()) as { status?: string };
    log("status order = PAID", status.status === "PAID", status.status ?? "-");

    // pustaka + akses baca
    const libraryHtml = await (
      await fetch(`${APP_URL}/akun`, { headers: { cookie: cookieHeader() } })
    ).text();
    log(
      "buku masuk Pustaka Saya",
      libraryHtml.includes(book.title.slice(0, 18)),
      book.title,
    );

    const readRes = await fetch(`${APP_URL}/api/read/${book.id}`, {
      headers: { cookie: cookieHeader() },
      redirect: "manual",
    });
    const readBody = await readRes.text().catch(() => "");
    const aksesOk =
      readRes.status === 200 ||
      readRes.status === 302 ||
      (readRes.status === 404 && /file/i.test(readBody));
    log(
      "akses baca buku (/api/read)",
      aksesOk,
      readRes.status === 404
        ? "HTTP 404 — file e-book belum dilampirkan (akses benar)"
        : `HTTP ${readRes.status}`,
    );

    // order detail
    const detailRes = await fetch(`${APP_URL}/akun/orders/${checkout.orderId}`, {
      headers: { cookie: cookieHeader() },
    });
    log("halaman detail order terbuka", detailRes.status === 200, `HTTP ${detailRes.status}`);
  } finally {
    if (buyerId) {
      await prisma.order.deleteMany({ where: { userId: buyerId } });
      await prisma.user.delete({ where: { id: buyerId } });
    }
    await gateway.close();
    // Matikan seluruh process group (npx → next), biar tidak ada proses yatim.
    try {
      if (child.pid) process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
    await prisma.$disconnect();
    console.log("data uji dibersihkan");
  }

  if (failed) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
