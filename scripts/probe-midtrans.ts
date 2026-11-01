/**
 * Diagnosa kredensial Midtrans — cek server key & client key satu per satu
 * lewat jalur otorisasi yang berbeda:
 *
 *   Server Key → GET /v2/<order>/status  (Basic auth)
 *                404 "transaction not found" = KEY VALID
 *                401                          = KEY TIDAK DITERIMA
 *   Client Key → GET /v2/token?client_key=… (query param)
 *                200 + token_id               = KEY VALID
 *                401                          = KEY TIDAK DITERIMA
 *
 * Jalankan: `npm run probe:midtrans`
 */
import "dotenv/config";

const mode =
  process.env.MIDTRANS_MODE?.trim().toLowerCase() === "production"
    ? "production"
    : "sandbox";
const host = mode === "production" ? "api.midtrans.com" : "api.sandbox.midtrans.com";

const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim() ?? "";
const clientKey = process.env.MIDTRANS_CLIENT_KEY?.trim() ?? "";

let rusak = 0;

async function cekServerKey() {
  if (!serverKey) {
    console.log("Server Key : KOSONG");
    rusak++;
    return;
  }
  const auth = Buffer.from(`${serverKey}:`).toString("base64");
  const res = await fetch(`https://${host}/v2/cek-kunci/status`, {
    headers: { Accept: "application/json", Authorization: `Basic ${auth}` },
  });
  const valid = res.status === 404; // key diterima, order memang tidak ada
  if (!valid) rusak++;
  console.log(
    `Server Key : ${valid ? "VALID ✓" : `DITOLAK (HTTP ${res.status}) ✗`}` +
      (valid
        ? ""
        : "  ← salin ulang Server Key dari dashboard.sandbox.midtrans.com → Settings → Access Keys"),
  );
}

async function cekClientKey() {
  if (!clientKey) {
    console.log("Client Key : KOSONG");
    rusak++;
    return;
  }
  const url = new URL(`https://${host}/v2/token`);
  url.searchParams.set("client_key", clientKey);
  url.searchParams.set("card_cvv", "123");
  url.searchParams.set("gross_amount", "20000");
  url.searchParams.set("currency", "IDR");
  url.searchParams.set("card_number", "4811111111111114");
  url.searchParams.set("card_exp_month", "02");
  url.searchParams.set("card_exp_year", "2030");

  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const valid = res.status === 200;
  if (!valid) rusak++;
  console.log(
    `Client Key : ${valid ? "VALID ✓" : `DITOLAK (HTTP ${res.status}) ✗`}`,
  );
}

async function main() {
  console.log(`mode = ${mode} (host ${host})\n`);
  await cekServerKey();
  await cekClientKey();

  if (rusak) {
    console.log(
      `\n${rusak} kredensial tidak diterima Midtrans — transaksi tidak bisa dibuat sampai diperbaiki.`,
    );
    process.exitCode = 1;
  } else {
    console.log("\nSemua kredensial valid — siap transaksi.");
  }
}

main();
