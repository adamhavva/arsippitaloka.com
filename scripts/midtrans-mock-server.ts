/**
 * Nyalakan mock gateway Midtrans + dev server uji, lalu TETAP hidup sampai
 * proses dihentikan (Ctrl+C / SIGTERM).
 *
 * Dipakai skrip Playwright (`scripts/pw-payment-sim.mjs`) agar browser bisa
 * menjalankan alur bayar sungguhan di UI.
 *
 * Jalankan: `npx tsx scripts/midtrans-mock-server.ts`
 */
import "dotenv/config";
import { spawn } from "node:child_process";
import { startMockGateway } from "./midtrans-mock-gateway";

const APP_PORT = Number(process.env.MOCK_APP_PORT ?? 3100);
const GATEWAY_PORT = Number(process.env.MOCK_GATEWAY_PORT ?? 4010);
const APP_URL = `http://localhost:${APP_PORT}`;
const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY?.trim() ?? "";

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

  const gateway = await startMockGateway({
    port: GATEWAY_PORT,
    appUrl: APP_URL,
    serverKey: SERVER_KEY,
  });

  const child = spawn("npx", ["next", "dev", "-p", String(APP_PORT)], {
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
    stdio: "ignore",
    detached: true,
  });

  const up = await waitFor(`${APP_URL}/api/webhook/midtrans`);
  if (!up) {
    console.error("dev server uji tidak siap");
    process.exit(1);
  }

  console.log(`READY app=${APP_URL} gateway=${gateway.url}`);

  const stop = async () => {
    try {
      if (child.pid) process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
    await gateway.close();
    process.exit(0);
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  setInterval(() => {}, 1 << 30);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
