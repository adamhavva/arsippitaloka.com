import { createHash } from "node:crypto";
import { getSettings } from "@/lib/site-settings";
import { SECRET_MASK } from "@/lib/site-settings-defaults";

export { SECRET_MASK };

/**
 * Integrasi Midtrans Snap (REST, tanpa SDK).
 *
 * Konfigurasi dibaca dari pengaturan admin (group "Midtrans") dengan fallback
 * ke environment variable. Nilai di DB (yang diubah admin) menang; kalau
 * dikosongkan, environment variable yang dipakai.
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

/** Nilai dummy untuk field bertipe secret yang sudah tersimpan di DB. */

export function getMidtransConfig(): Promise<MidtransConfig> {
  return getSettings().then((settings) => {
    const mode: MidtransMode =
      settings["payment.midtrans.mode"] === "production" ? "production" : "sandbox";

    const serverKey =
      settings["payment.midtrans.serverKey"]?.trim() ||
      process.env.MIDTRANS_SERVER_KEY?.trim() ||
      "";

    const clientKey =
      settings["payment.midtrans.clientKey"]?.trim() ||
      process.env.MIDTRANS_CLIENT_KEY?.trim() ||
      "";

    const enabledRaw =
      settings["payment.midtrans.enabled"] || process.env.MIDTRANS_ENABLED || "false";

    return {
      enabled: enabledRaw === "true" || enabledRaw === "1",
      mode,
      serverKey,
      clientKey,
    };
  });
}

export function isMidtransConfigured(config: MidtransConfig): boolean {
  return Boolean(config.serverKey && config.clientKey);
}

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function authHeader(serverKey: string): string {
  return `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`;
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
    email?: string;
    phone?: string;
  };
  finishUrl?: string;
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
    customer_details: {
      first_name: input.customer?.firstName?.slice(0, 40) || "Pembeli",
      email: input.customer?.email || undefined,
      phone: input.customer?.phone || undefined,
    },
    callbacks: {
      finish: input.finishUrl || `${baseUrl()}/akun/orders`,
    },
  };

  try {
    const res = await fetch(ENDPOINTS[config.mode].snap, {
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
      return {
        ok: false,
        error: messages?.join(" ") || `Midtrans menolak transaksi (HTTP ${res.status}).`,
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
    const res = await fetch(`${ENDPOINTS[config.mode].api}/${encodeURIComponent(orderId)}/status`, {
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
 * Verifikasi signature notifikasi Midtrans:
 * sha512(order_id + status_code + gross_amount + serverKey).
 */
export function verifyMidtransSignature(
  payload: { order_id?: string; status_code?: string; gross_amount?: string },
  signature: string | null | undefined,
  serverKey: string,
): boolean {
  if (!signature || !serverKey) return false;

  const raw = `${payload.order_id ?? ""}${payload.status_code ?? ""}${payload.gross_amount ?? ""}${serverKey}`;
  const expected = createHash("sha512").update(raw).digest("hex");

  // bandingkan panjang sama dulu agar timingSafeEqual tidak melempar
  if (expected.length !== signature.length) return false;
  return expected === signature;
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
