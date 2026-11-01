/**
 * Uji coba pembayaran Midtrans end-to-end.
 *
 * Yang diuji:
 *   1. POST /api/checkout            → order dibuat + transaksi Snap dibuat
 *   2. GET  halaman Snap              → bisa dibuka
 *   3. GET  /api/payment/callback/finish → callback pembeli memverifikasi
 *                                      status ke Midtrans lalu mengarahkan
 *                                      ke halaman order
 *   4. POST /api/webhook/midtrans     → notifikasi server-to-server (lewat
 *                                      URL publik / ngrok) dengan signature
 *                                      sah → order jadi lunas
 *   5. signature salah                → ditolak 403
 *   6. status order                   → PAID
 *   7. Pustaka Saya                   → buku muncul, /api/read bisa dibuka
 *
 * Kalau Midtrans menolak pembuatan transaksi (mis. server key belum benar),
 * skrip tetap menguji sisi penerimaan pembayaran dengan membuat order
 * PENDING secara langsung, lalu mengirim notifikasi ke webhook publik.
 *
 * Env:
 *   BASE_URL     – alamat aplikasi (default http://localhost:3000)
 *   PUBLIC_URL   – alamat publik aplikasi (tunnel ngrok) untuk uji webhook
 *   SERVER_KEY   – override server key (default dari .env)
 */
import "dotenv/config";
import { createHash, randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const BASE = process.env.BASE_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
const PUBLIC_URL = process.env.PUBLIC_URL?.replace(/\/+$/, "") ?? "";
const SERVER_KEY = process.env.SERVER_KEY ?? process.env.MIDTRANS_SERVER_KEY ?? "";

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
  console.log(`${ok ? "OK   " : "GAGAL"} ${step}${detail ? ` — ${detail}` : ""}`);
  if (!ok) process.exitCode = 1;
}

function logInfo(step: string, detail = "") {
  console.log(`INFO  ${step}${detail ? ` — ${detail}` : ""}`);
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

  let orderId = "";
  let bookId = "";

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
    bookId = book.id;
    logInfo("buku uji", book.title);

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

    if (checkoutRes.status === 200 && checkout.orderId && checkout.redirectUrl) {
      orderId = checkout.orderId;
      log("POST /api/checkout", true, checkout.redirectUrl.split("?")[0]);

      const snapRes = await fetch(checkout.redirectUrl, { redirect: "follow" });
      log("halaman Snap terbuka", snapRes.ok, `HTTP ${snapRes.status}`);

    } else {
      log("POST /api/checkout", false, checkout.error ?? "-");
      logInfo(
        "melewati uji transaksi Snap; sisi penerimaan tetap diuji dengan order PENDING lokal",
      );

      // Order PENDING buatan sendiri supaya sisi penerimaan tetap teruji.
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: "PENDING",
          deliveryMethod: "DOWNLOAD",
          subtotal: Number(book.priceUsd),
          taxAmount: 0,
          total: Number(book.priceUsd),
          usdToIdrRate: 1,
          paymentProvider: "midtrans",
          paymentMethod: "SNAP",
          items: {
            create: {
              bookId: book.id,
              title: book.title,
              priceUsd: book.priceUsd,
              qty: 1,
            },
          },
        },
      });
      orderId = order.id;
    }

    // 4b. callback pembeli harus mengarahkan ke halaman order.
    const cbRes = await fetch(
      `${BASE}/api/payment/callback/finish?order_id=${orderId}&transaction_status=settlement&status_code=200`,
      { redirect: "manual", headers: { cookie: cookieHeader() } },
    );
    const cbLocation = cbRes.headers.get("location") ?? "";
    log(
      "GET /api/payment/callback/finish",
      cbRes.status >= 300 &&
        cbRes.status < 400 &&
        cbLocation.includes(`/akun/orders/${orderId}`),
      `${cbRes.status} → ${cbLocation || "-"}`,
    );

    // Total order (dipakai untuk signature & pencocokan nominal).
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { total: true },
    });
    const gross = String(Number(order?.total ?? 0));
    // Notifikasi Midtrans mengirim gross_amount bertitik (mis. "10000.00") —
    // signature dihitung dari nilai yang PERSIS dikirim, jadi ikut bertitik.
    const grossFormatted = `${Number(order?.total ?? 0).toFixed(2)}`;

    // 5. status sebelum lunas
    const pendingRes = await fetch(`${BASE}/api/payment/status/${orderId}`, {
      headers: { cookie: cookieHeader() },
      cache: "no-store",
    });
    const pending = (await pendingRes.json()) as { status?: string };
    log("status sebelum lunas = PENDING", pending.status === "PENDING", pending.status ?? "-");

    // 5b. fraud_status bukan "accept" → order TIDAK boleh dilunasi.
    //     (best practice Midtrans: settlement + fraud_status=accept)
    const challengeGross = `${Number(order?.total ?? 0).toFixed(2)}`;
    const challengeRaw = `${orderId}200${challengeGross}${SERVER_KEY}`;
    const challengeRes = await fetch(`${BASE}/api/webhook/midtrans`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        status_code: "200",
        gross_amount: challengeGross,
        transaction_status: "settlement",
        fraud_status: "challenge",
        signature_key: createHash("sha512").update(challengeRaw).digest("hex"),
      }),
    });
    const afterChallenge = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    log(
      "fraud_status=challenge tidak menandai lunas",
      afterChallenge?.status === "PENDING",
      `status=${afterChallenge?.status ?? "-"} (HTTP ${challengeRes.status})`,
    );

    // 6. notifikasi dengan signature sah (dihitung dari server key sendiri)
    const raw = `${orderId}200${grossFormatted}${SERVER_KEY}`;
    const signature = createHash("sha512").update(raw).digest("hex");
    // Format resmi notifikasi Midtrans: field signature_key + fraud_status,
    // gross_amount bertitik (mis. "10000.00").
    const body = JSON.stringify({
      order_id: orderId,
      status_code: "200",
      gross_amount: grossFormatted,
      transaction_status: "settlement",
      fraud_status: "accept",
      signature_key: signature,
    });

    // Kalau ada URL publik (tunnel), notifikasi dikirim ke sana — persis
    // seperti yang dilakukan Midtrans dari server mereka.
    const webhookBase = PUBLIC_URL || BASE;
    if (PUBLIC_URL) {
      logInfo("target webhook", `${webhookBase}/api/webhook/midtrans`);
    }

    const notify = await fetch(`${webhookBase}/api/webhook/midtrans`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
    });
    log("POST webhook (signature sah)", notify.ok, `HTTP ${notify.status}`);

    // 6b. notifikasi dalam format form-encoded (format lain yang dipakai Midtrans)
    const formNotify = await fetch(`${webhookBase}/api/webhook/midtrans`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        order_id: orderId,
        status_code: "200",
        gross_amount: grossFormatted,
        transaction_status: "settlement",
        fraud_status: "accept",
        signature_key: signature,
      }).toString(),
    });
    log("POST webhook (form-encoded)", formNotify.ok, `HTTP ${formNotify.status}`);

    // 7. signature salah harus ditolak
    const badRes = await fetch(`${webhookBase}/api/webhook/midtrans`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        order_id: orderId,
        status_code: "200",
        gross_amount: grossFormatted,
        transaction_status: "settlement",
        fraud_status: "accept",
        signature_key: "a".repeat(128),
      }),
    });
    log("POST webhook (signature salah) ditolak", badRes.status === 403, `HTTP ${badRes.status}`);

    // 8. status setelah lunas + cek pustaka
    const paidRes = await fetch(`${BASE}/api/payment/status/${orderId}`, {
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

    const detailRes = await fetch(`${BASE}/akun/orders/${orderId}`, {
      headers: { cookie: cookieHeader() },
    });
    log(
      "halaman detail order terbuka",
      detailRes.status === 200,
      `HTTP ${detailRes.status}`,
    );

    const readRes = await fetch(`${BASE}/api/read/${book.id}`, {
      headers: { cookie: cookieHeader() },
      redirect: "manual",
    });
    // 200/302 = file tersedia. 404 = akses OK tapi file e-book belum
    // dilampirkan ke buku uji. 401/403 = akses ditolak → gagal.
    const readBody = await readRes.text().catch(() => "");
    const aksesDiterima =
      readRes.status === 200 ||
      readRes.status === 302 ||
      (readRes.status === 404 && /file/i.test(readBody));
    log(
      "akses baca buku aktif (/api/read)",
      aksesDiterima,
      readRes.status === 404
        ? "HTTP 404 — file e-book belum dilampirkan (akses sudah benar)"
        : `HTTP ${readRes.status}`,
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
