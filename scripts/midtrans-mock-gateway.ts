/**
 * Mock gateway Midtrans — KHUSUS PENGUJIAN LOKAL.
 *
 * Meniru sebagian API Midtrans Snap:
 *   POST /snap/v1/transactions  → buat token + redirect_url
 *   GET  /snap/:token           → halaman pembayaran (HTML) dengan tombol bayar
 *   POST /snap/:token/pay       → tandai lunas, KIRIM notifikasi webhook ke
 *                                 aplikasi kita (server-to-server, dengan
 *                                 signature asli), lalu redirect ke callbacks.finish
 *   GET  /v2/:orderId/status    → status transaksi (dipakai polling)
 *
 * Dipakai oleh `scripts/midtrans-mock-flow.ts`. Tidak pernah dipakai di
 * produksi — endpoint aplikasi hanya diarahkan ke sini lewat
 * `MIDTRANS_SNAP_ENDPOINT` / `MIDTRANS_API_ENDPOINT` yang hanya dibaca kalau
 * `NODE_ENV` bukan `production`.
 */
import { createHash, randomUUID } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

export type MockTx = {
  token: string;
  orderId: string;
  grossAmount: number;
  finishUrl?: string;
  cancelUrl?: string;
  paid: boolean;
};

export type MockGateway = {
  url: string;
  port: number;
  transactions: Map<string, MockTx>;
  /** Notifikasi webhook yang benar-benar terkirim ke aplikasi. */
  notifications: { orderId: string; status: number; body: string }[];
  close: () => Promise<void>;
};

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 2_000_000) reject(new Error("body terlalu besar"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

function json(res: ServerResponse, status: number, body: unknown) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

export async function startMockGateway(options: {
  port?: number;
  /** Base URL aplikasi yang menerima notifikasi webhook. */
  appUrl: string;
  /** Server key aplikasi — dipakai menghitung signature notifikasi. */
  serverKey: string;
}): Promise<MockGateway> {
  const port = options.port ?? 4010;
  const transactions = new Map<string, MockTx>();
  const notifications: { orderId: string; status: number; body: string }[] = [];

  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);
    const path = url.pathname;

    // Hanya endpoint API Midtrans yang butuh Authorization. Halaman Snap
    // (`/snap/:token`) dibuka browser → tidak membawa Basic auth.
    const isApiCall =
      path === "/snap/v1/transactions" || path.startsWith("/v2/");
    if (isApiCall) {
      const auth = req.headers.authorization ?? "";
      if (!auth.startsWith("Basic ")) {
        json(res, 401, { error: "Unauthorized" });
        return;
      }
    }

    // --- POST /snap/v1/transactions -------------------------------------
    if (req.method === "POST" && path === "/snap/v1/transactions") {
      let payload: {
        transaction_details?: { order_id?: string; gross_amount?: number };
        callbacks?: { finish?: string; cancel?: string };
        item_details?: { id: string; price: number; quantity: number; name: string }[];
      };
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        json(res, 400, { error: "invalid json" });
        return;
      }

      const orderId = payload.transaction_details?.order_id ?? "";
      const grossAmount = Number(payload.transaction_details?.gross_amount ?? 0);
      if (!orderId || !grossAmount) {
        json(res, 400, {
          error_messages: ["transaction_details is required"],
        });
        return;
      }

      // Midtrans mewajibkan Σ item_details == gross_amount.
      const items = payload.item_details ?? [];
      const sum = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
      if (items.length && Math.round(sum) !== Math.round(grossAmount)) {
        json(res, 400, {
          error_messages: [
            "item_details sum does not match gross_amount",
          ],
        });
        return;
      }

      const token = randomUUID().replace(/-/g, "");
      transactions.set(token, {
        token,
        orderId,
        grossAmount,
        finishUrl: payload.callbacks?.finish,
        cancelUrl: payload.callbacks?.cancel,
        paid: false,
      });

      json(res, 201, {
        token,
        redirect_url: `http://localhost:${port}/snap/${token}`,
      });
      return;
    }

    // --- GET /snap/:token (halaman pembayaran) --------------------------
    if (req.method === "GET" && path.startsWith("/snap/")) {
      const token = path.split("/")[2] ?? "";
      const tx = transactions.get(token);
      if (!tx) {
        json(res, 404, { error: "transaction not found" });
        return;
      }
      const html = `<!doctype html>
<html lang="id"><head><meta charset="utf-8"><title>Snap (Mock)</title>
<style>body{font-family:system-ui;margin:0;background:#f5f5f5;display:grid;place-items:center;min-height:100vh}
.card{background:#fff;padding:32px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.12);max-width:420px}
h1{font-size:18px;margin:0 0 12px}dl{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:14px;margin:0 0 20px}
button{background:#561a1a;color:#fff;border:0;border-radius:999px;padding:12px 20px;font-size:14px;cursor:pointer}
small{color:#666}</style></head><body>
<div class="card">
<h1>Simulasi halaman Snap Midtrans</h1>
<dl>
<dt>Order</dt><dd>${tx.orderId}</dd>
<dt>Total</dt><dd>Rp ${tx.grossAmount.toLocaleString("id-ID")}</dd>
</dl>
<form method="post" action="/snap/${tx.token}/pay">
<button type="submit">Bayar sekarang (simulasi)</button>
</form>
<form method="post" action="/snap/${tx.token}/cancel" style="margin-top:12px">
<button type="submit" style="background:#999">Batalkan</button>
</form>
<p><small>Mock gateway untuk pengujian lokal — tidak ada uang sungguhan.</small></p>
</div></body></html>`;
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    // --- POST /snap/:token/pay (bayar → notifikasi → finish) -----------
    if (req.method === "POST" && path.endsWith("/pay")) {
      const token = path.split("/")[2] ?? "";
      const tx = transactions.get(token);
      if (!tx) {
        json(res, 404, { error: "transaction not found" });
        return;
      }
      tx.paid = true;

      // Notifikasi server-to-server ke aplikasi kita (signature asli).
      const gross = tx.grossAmount.toFixed(2);
      const signature = createHash("sha512")
        .update(`${tx.orderId}200${gross}${options.serverKey}`)
        .digest("hex");

      const body = JSON.stringify({
        transaction_time: new Date().toISOString(),
        transaction_status: "settlement",
        transaction_id: randomUUID(),
        status_code: "200",
        signature_key: signature,
        payment_type: "mock",
        order_id: tx.orderId,
        gross_amount: gross,
        fraud_status: "accept",
        currency: "IDR",
      });

      let status = 0;
      try {
        const notify = await fetch(
          `${options.appUrl}/api/webhook/midtrans`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          },
        );
        status = notify.status;
      } catch (error) {
        status = 0;
        console.error("mock gateway: gagal kirim webhook", error);
      }
      notifications.push({ orderId: tx.orderId, status, body });

      const finish = new URL(tx.finishUrl ?? "/akun/orders");
      finish.searchParams.set("order_id", tx.orderId);
      finish.searchParams.set("transaction_status", "settlement");
      finish.searchParams.set("status_code", "200");
      finish.searchParams.set("gross_amount", gross);
      res.writeHead(302, { Location: finish.toString() });
      res.end();
      return;
    }

    // --- POST /snap/:token/cancel ----------------------------------------
    if (req.method === "POST" && path.endsWith("/cancel")) {
      const token = path.split("/")[2] ?? "";
      const tx = transactions.get(token);
      const target = new URL(tx?.cancelUrl ?? "/keranjang");
      if (tx) target.searchParams.set("order_id", tx.orderId);
      res.writeHead(302, { Location: target.toString() });
      res.end();
      return;
    }

    // --- GET /v2/:orderId/status ----------------------------------------
    const statusMatch = path.match(/^\/v2\/([^/]+)\/status$/);
    if (req.method === "GET" && statusMatch) {
      const orderId = decodeURIComponent(statusMatch[1]);
      const tx = [...transactions.values()].find((t) => t.orderId === orderId);
      if (!tx) {
        json(res, 404, { error_messages: ["transaction not found"] });
        return;
      }
      json(res, 200, {
        transaction_status: tx.paid ? "settlement" : "pending",
        status_code: "200",
        order_id: tx.orderId,
        gross_amount: tx.grossAmount.toFixed(2),
        fraud_status: tx.paid ? "accept" : "",
        transaction_time: new Date().toISOString(),
      });
      return;
    }

    json(res, 404, { error: "not found" });
  });

  await new Promise<void>((resolve) => server.listen(port, resolve));

  return {
    url: `http://localhost:${port}`,
    port,
    transactions,
    notifications,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve());
      }),
  };
}
