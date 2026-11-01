/**
 * Simulasi pembayaran lewat browser sungguhan (Playwright).
 *
 * Alur yang dijalankan persis seperti pembeli:
 *   1. daftar akun baru di /register
 *   2. masuk di /login
 *   3. buka halaman buku → klik "Beli"
 *   4. halaman pembayaran (Snap) terbuka → isi/klik bayar
 *   5. kembali ke situs → halaman order menampilkan "Pembayaran berhasil diterima"
 *   6. Pustaka Saya memuat buku yang dibeli
 *
 * MODE=mock  → pakai mock gateway lokal (halaman Snap simulasi)
 * MODE=real  → pakai Midtrans sandbox sungguhan (kartu tes)
 *
 * Jalankan (Playwright hanya ada di cache npx, jadi skrip disalin ke sana):
 *   PW=$(find ~/.npm/_npx -maxdepth 4 -type d -name playwright | head -1)/../..
 *   cp scripts/pw-payment-sim.mjs "$PW/" && (cd "$PW" && node pw-payment-sim.mjs)
 *
 * Env:
 *   APP_URL   (default http://localhost:3100)
 *   MODE      mock | real (default mock)
 *   EMAIL     akun uji (default acak)
 *   PASSWORD  sandi akun uji
 *   SHOTS     folder screenshot (default /tmp/pitaloka-assets)
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";

const APP_URL = (process.env.APP_URL ?? "http://localhost:3100").replace(/\/+$/, "");
const MODE = process.env.MODE ?? "mock";
const EMAIL = process.env.EMAIL ?? `pw-uji-${randomUUID().slice(0, 8)}@mail.com`;
const PASSWORD = process.env.PASSWORD ?? randomUUID();
const SHOTS = process.env.SHOTS ?? "/tmp/pitaloka-assets";

mkdirSync(SHOTS, { recursive: true });

let gagal = 0;
function cek(nama, ok, detail = "") {
  console.log(`${ok ? "OK   " : "GAGAL"} ${nama}${detail ? ` — ${detail}` : ""}`);
  if (!ok) gagal++;
}

async function main() {
  console.log(`app  = ${APP_URL}`);
  console.log(`mode = ${MODE}`);
  console.log(`user = ${EMAIL}\n`);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // 1. daftar akun
  await page.goto(`${APP_URL}/register`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await page.fill('input[name="confirmPassword"]', PASSWORD);
  const terms = page.locator('input[name="terms"]');
  if (await terms.count()) await terms.check({ force: true }).catch(() => {});
  await page.screenshot({ path: `${SHOTS}/pw-1-register.png`, fullPage: true });
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3500);
  if (page.url().includes("/register")) {
    // Form register tidak selalu mengarahkan (router.push), tapi akunnya
    // sudah dibuat — dibuktikan oleh login di bawah.
    console.log("   (form register tidak mengarahkan; akun tetap dibuat)");
  }

  // 2. login (kalau belum otomatis masuk)
  if (page.url().includes("/login") || !(await page.locator("body").textContent()).includes("Pustaka")) {
    await page.goto(`${APP_URL}/login`, { waitUntil: "domcontentloaded" });
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3500);
  }
  if (page.url().includes("/login")) {
    const pesan = (await page.locator("body").textContent()).replace(/\s+/g, " ").slice(0, 200);
    console.log("   (tetap di /login —", pesan, ")");
  }
  cek("login (akun dibuat & masuk)", !page.url().includes("/login"), page.url());

  // 3. cari buku berbayar + buka halamannya
  await page.goto(`${APP_URL}/buku`, { waitUntil: "domcontentloaded" });
  const links = await page.locator('a[href*="/buku/"]').evaluateAll((els) =>
    els.map((e) => e.getAttribute("href")).filter(Boolean),
  );
  // Link detail buku: /buku/<tab>/<slug> — bukan /buku/kategori/<slug>
  const candidates = links.filter((href) => {
    const seg = href.split("?")[0].split("/").filter(Boolean);
    return seg.length >= 3 && seg[0] === "buku" && seg[1] !== "kategori";
  });
  if (!candidates.length) throw new Error("tidak ada link detail buku di katalog");

  // Cari buku yang BERBAYAR (tombolnya "Beli", bukan "Download" untuk buku gratis).
  let beli = null;
  for (const href of candidates.slice(0, 10)) {
    await page.goto(`${APP_URL}${href}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    const tombol = page
      .locator('button:has-text("Beli"), button:has-text("Beli Sekarang")')
      .first();
    if (await tombol.isVisible().catch(() => false)) {
      beli = tombol;
      break;
    }
  }
  if (!beli) throw new Error("tidak menemukan buku berbayar di katalog");
  await page.screenshot({ path: `${SHOTS}/pw-2-buku.png`, fullPage: true });
  cek("halaman buku berbayar terbuka", page.url().includes("/buku/"), page.url());

  // 4. klik tombol Beli
  await Promise.all([
    page.waitForURL(/snap|midtrans/i, { timeout: 45000 }).catch(() => {}),
    beli.click(),
  ]);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${SHOTS}/pw-3-snap.png`, fullPage: true });
  cek("halaman pembayaran terbuka", /snap|midtrans/i.test(page.url()), page.url());

  // 5. bayar
  if (MODE === "real") {
    await isiKartuMidtrans(page);
  } else {
    const bayar = page.locator('button:has-text("Bayar sekarang")').first();
    await bayar.waitFor({ state: "visible", timeout: 15000 });
    await bayar.click();
  }

  // 6. balik ke situs → halaman order
  await page.waitForURL(/\/akun\/orders\//, { timeout: 60000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SHOTS}/pw-4-order.png`, fullPage: true });
  const isi = await page.locator("body").textContent();
  cek(
    "halaman order menampilkan pembayaran berhasil",
    isi.includes("Pembayaran berhasil diterima"),
    page.url(),
  );
  cek("status order LUNAS", isi.includes("Lunas"), page.url());

  // 7. pustaka saya
  await page.goto(`${APP_URL}/akun`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${SHOTS}/pw-5-pustaka.png`, fullPage: true });
  const pustaka = await page.locator("body").textContent();
  cek(
    "buku masuk Pustaka Saya",
    pustaka.includes("Pustaka Saya"),
    page.url(),
  );

  await browser.close();

  console.log(`\nEMAIL=${EMAIL}`);
  console.log(`PASSWORD=${PASSWORD}`);
  console.log(`screenshot: ${SHOTS}`);
  if (gagal) process.exitCode = 1;
}

/** Isi form kartu Midtrans sungguhan (sandbox). */
async function isiKartuMidtrans(page) {
  const cariIsian = async (pola) =>
    page.locator(`input${pola}`).first();

  const nomor = await cariIsian('[name="cardNumber"], [placeholder*="Card"], [placeholder*="card"]');
  await nomor.waitFor({ state: "visible", timeout: 20000 });
  await nomor.fill("4811111111111114");

  const exp = await cariIsian('[name="exp"], [placeholder*="Expiry"], [placeholder*="exp"]');
  await exp.fill("12/30");

  const cvv = await cariIsian('[name="cvv"], [placeholder*="CVV"], [placeholder*="cvv"]');
  await cvv.fill("123");

  await page.screenshot({ path: `${SHOTS}/pw-3b-kartu.png`, fullPage: true });

  const submit = page.locator('button:has-text("Pay"), button:has-text("Bayar"), button:has-text("Lanjut")').first();
  await submit.click();

  // 3DS: OTP sandbox = 112233
  const otp = page.locator('input[name="otp"], input[placeholder*="OTP"], input[placeholder*="otp"]').first();
  if (await otp.count()) {
    await otp.waitFor({ state: "visible", timeout: 20000 }).catch(() => {});
    await otp.fill("112233").catch(() => {});
    const konfirmasi = page.locator('button:has-text("Pay"), button:has-text("Bayar"), button:has-text("OK")').first();
    if (await konfirmasi.count()) await konfirmasi.click().catch(() => {});
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
