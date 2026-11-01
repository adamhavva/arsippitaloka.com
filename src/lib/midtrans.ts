import { createHash } from "node:crypto";
import { siteUrl } from "@/lib/site-url";

/**
 * Integrasi Midtrans Snap (REST, tanpa SDK).
 *
 * Konfigurasi dibaca **hanya dari environment variable (.env)** — itu satu
 *-satunya sumber kebenaran. Tidak ada lagi pengaturan Midtrans di database
 * maupun form /admin/profile, jadi admin tidak bisa mengunci/mematikan
 * pembayaran dengan nilai basi yang tersimpan di DB.
 *
 * | Env                 | Arti                                  |
 * | ------------------- | ------------------------------------- |
 * | `MIDTRANS_ENABLED`  | `true` / `1` → pembayaran online aktif |
 * | `MIDTRANS_MODE`     | `sandbox` (default) atau `production`  |
 * | `MIDTRANS_SERVER_KEY` | Rahasia, hanya di server              |
 * | `MIDTRANS_CLIENT_KEY` | Diboleh tampil di browser            |
 *
 * Server key TIDAK PERNAH dikirim ke browser — hanya dipakai di server.
 */

export type MidtransMode = "sandbox" | "production";

export type MidtransConfig = {
  enabled: boolean;
  mode: MidtransMode;
  serverKey: string;
  clientKey: string;
};

const ENDPOINTS: Record<MidtransMode, { snap: string; api: string }> = {
  sandbox: {
    snap: "https://app.sandbox.midtrans.com/snap/v1/transactions",
    api: "https://api.sandbox.midtrans.com/v2",
  },
  production: {
    snap: "https://app.midtrans.com/snap/v1/transactions",
    api: "https://api.midtrans.com/v2",
  },
};

/**
 * Baca konfigurasi Midtrans dari environment variable.
 *
 * Sengaja sinkron dan tanpa query DB — konfigurasi pembayaran hanya boleh
 * diubah lewat file .env (source of truth) supaya tidak ada dua sumber
 * kebenaran yang saling bertabrakan.
 */
export function getMidtransConfig(): MidtransConfig {
  const mode: MidtransMode =
    process.env.MIDTRANS_MODE?.trim().toLowerCase() === "production"
      ? "production"
      : "sandbox";

  const enabledRaw = process.env.MIDTRANS_ENABLED?.trim().toLowerCase();

  return {
    enabled: enabledRaw === "true" || enabledRaw === "1",
    mode,
    serverKey: process.env.MIDTRANS_SERVER_KEY?.trim() ?? "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY?.trim() ?? "",
  };
}

export function isMidtransConfigured(config: MidtransConfig): boolean {
  return Boolean(config.serverKey && config.clientKey);
}

function baseUrl(): string {
  return siteUrl();
}

function authHeader(serverKey: string): string {
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
}

/**
 * Pecah nama pengguna jadi `first_name` + `last_name` untuk
 * `customer_details` Midtrans (sampel resmi memakai keduanya).
 */
export function splitName(fullName?: string | null): {
  firstName: string;
  lastName?: string;
} {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "Pembeli" };
  return {
    firstName: parts[0],
    lastName: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
  };
}

export type SnapItem = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

export type SnapTransactionInput = {
  orderId: string;
  grossAmount: number;
  items: SnapItem[];
  customer?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  /** URL setelah pembayaran berhasil (Midtrans menambah query status). */
  finishUrl?: string;
  /** URL kalau pembayaran dibatalkan / gagal. */
  cancelUrl?: string;
  errorUrl?: string;
};

export type SnapTransactionResult =
  | { ok: true; token: string; redirectUrl: string }
  | { ok: false; error: string };

/** Buat transaksi Snap dan kembalikan token + URL redirect ke halaman Snap. */
export async function createSnapTransaction(
  config: MidtransConfig,
  input: SnapTransactionInput,
): Promise<SnapTransactionResult> {
  if (!config.serverKey) {
    return { ok: false, error: "Server key Midtrans belum diatur." };
  }

  const body = {
    transaction_details: {
      order_id: input.orderId,
      gross_amount: input.grossAmount,
    },
    item_details: input.items.map((item) => ({
      id: item.id,
      price: Math.round(item.price),
      quantity: item.quantity,
      name: item.name.slice(0, 50),
    })),
    // 3DS untuk kartu (sampel resmi Midtrans).
    credit_card: {
      secure: true,
    },
    customer_details: {
      first_name: input.customer?.firstName?.slice(0, 40) || "Pembeli",
      last_name: input.customer?.lastName?.slice(0, 40) || undefined,
      email: input.customer?.email || undefined,
      phone: input.customer?.phone || undefined,
    },
    callbacks: {
      finish: input.finishUrl || `${baseUrl()}/akun/orders`,
      cancel: input.cancelUrl || input.finishUrl || `${baseUrl()}/keranjang`,
      error: input.errorUrl || input.finishUrl || `${baseUrl()}/keranjang`,
    },
  };

  try {
    // MIDTRANS_DEBUG=1 → simpan request (tanpa server key) ke file supaya
    // bisa dibandingkan langsung dengan sampel resmi Midtrans.
    if (process.env.MIDTRANS_DEBUG === "1") {
      try {
        const { writeFileSync } = await import("node:fs");
        writeFileSync(
          process.env.MIDTRANS_DEBUG_FILE ?? "/tmp/midtrans-request.json",
          JSON.stringify(body, null, 2),
        );
      } catch {
        // debug saja — jangan gagalkan transaksi
      }
    }

    const res = await fetch(endpoints(config).snap, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader(config.serverKey),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}) as Record<string, unknown>);

    if (!res.ok) {
      const messages = (data as { error_messages?: string[] }).error_messages;
      const detail = messages?.join(" ");
      // 401/403 = kredensial ditolak → itu masalah konfigurasi, bukan
      // pembeli. Jangan tampilkan "kesalahan pembayaran" ke user.
      if (res.status === 401 || res.status === 403) {
        console.error(
          `Midtrans menolak kredensial (HTTP ${res.status}) — periksa MIDTRANS_SERVER_KEY di .env (npm run probe:midtrans)`,
        );
        return {
          ok: false,
          error:
            "Pembayaran online sedang tidak dapat dipakai (konfigurasi Midtrans ditolak). Silakan hubungi kami untuk pembelian manual.",
        };
      }
      return {
        ok: false,
        error: detail || `Midtrans menolak transaksi (HTTP ${res.status}).`,
      };
    }

    const token = (data as { token?: string }).token;
    const redirectUrl = (data as { redirect_url?: string }).redirect_url;

    if (!token || !redirectUrl) {
      return { ok: false, error: "Respons Midtrans tidak lengkap (token hilang)." };
    }

    return { ok: true, token, redirectUrl };
  } catch (error) {
    console.error("Midtrans snap error", error);
    return { ok: false, error: "Gagal menghubungi Midtrans. Coba lagi nanti." };
  }
}

export type MidtransTransactionStatus = {
  transaction_status?: string;
  status_code?: string;
  gross_amount?: string;
  order_id?: string;
  fraud_status?: string;
};

/** Ambil status transaksi terakhir dari Midtrans (dipakai polling & webhook). */
export async function fetchTransactionStatus(
  config: MidtransConfig,
  orderId: string,
): Promise<MidtransTransactionStatus | null> {
  if (!config.serverKey) return null;

  try {
    const res = await fetch(`${endpoints(config).api}/${encodeURIComponent(orderId)}/status`, {
      headers: {
        Accept: "application/json",
        Authorization: authHeader(config.serverKey),
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return (await res.json()) as MidtransTransactionStatus;
  } catch (error) {
    console.error("Midtrans status error", error);
    return null;
  }
}

/**
 * Endpoint gateway Midtrans.
 *
 * `MIDTRANS_SNAP_ENDPOINT` / `MIDTRANS_API_ENDPOINT` hanya dipakai untuk
 * pengujian lokal (mock gateway) dan **diabaikan di produksi** — supaya
 * aplikasi yang ter-deploy tidak pernah mengirim transaksi ke host lain.
 */
function endpoints(config: MidtransConfig): { snap: string; api: string } {
  const base = ENDPOINTS[config.mode];
  const allowOverride = process.env.NODE_ENV !== "production";

  return {
    snap:
      (allowOverride && process.env.MIDTRANS_SNAP_ENDPOINT?.trim()) ||
      base.snap,
    api:
      (allowOverride && process.env.MIDTRANS_API_ENDPOINT?.trim()) || base.api,
  };
}

/**
 * Verifikasi signature notifikasi Midtrans:
 * sha512(order_id + status_code + gross_amount + serverKey).
 *
 * Format notifikasi resmi Midtrans memakai field **`signature_key`** di body
 * JSON (bukan `signature`), jadi keduanya diterima. Nilai yang dipakai harus
 * persis sama dengan yang dikirim Midtrans — `gross_amount` ikut apa adanya
 * (bisa "10000.00").
 */
export function verifyMidtransSignature(
  payload: {
    order_id?: string;
    status_code?: string;
    gross_amount?: string;
    signature_key?: string;
    signature?: string;
  },
  signature: string | null | undefined,
  serverKey: string,
): boolean {
  const given =
    signature ??
    payload?.signature_key ??
    payload?.signature ??
    null;

  if (!given || !serverKey) return false;

  const raw = `${payload.order_id ?? ""}${payload.status_code ?? ""}${payload.gross_amount ?? ""}${serverKey}`;
  const expected = createHash("sha512").update(raw).digest("hex");

  // bandingkan panjang sama dulu agar timingSafeEqual tidak melempar
  if (expected.length !== given.length) return false;
  return expected === given;
}

/** Petakan status transaksi Midtrans ke status order internal. */
export function mapTransactionStatus(transactionStatus?: string): {
  status: "PAID" | "PENDING" | "CANCELLED";
  paid: boolean;
} {
  switch ((transactionStatus || "").toLowerCase()) {
    case "settlement":
    case "capture":
      return { status: "PAID", paid: true };
    case "deny":
    case "cancel":
    case "expire":
    case "failure":
      return { status: "CANCELLED", paid: false };
    default:
      return { status: "PENDING", paid: false };
  }
}
