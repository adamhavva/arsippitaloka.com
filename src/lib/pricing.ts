import { getSettings } from "@/lib/site-settings";

/**
 * Perhitungan harga order.
 *
 * Buku disimpan dengan harga USD; penagihan ke Midtrans memakai IDR.
 * Kurs dan aturan pajak diambil dari pengaturan admin dan di-snapshot
 * ke order supaya harga historis tidak berubah setelah pengaturan diubah.
 */
export type PriceBreakdown = {
  rate: number;
  subtotal: number;
  taxType: string | null;
  taxAmount: number;
  total: number;
};

export async function calculatePrice(priceUsd: number): Promise<PriceBreakdown> {
  const settings = await getSettings();

  const rate = Number(settings["payment.usdToIdr"]) || 16000;
  const subtotal = Math.round(priceUsd * rate);

  let taxType: string | null = null;
  let taxAmount = 0;

  if (settings["tax.enabled"] === "true") {
    taxType = (settings["tax.type"] || "percentage").toLowerCase();

    if (taxType === "fixed") {
      taxAmount = Math.round(Number(settings["tax.fixedAmount"]) || 0);
    } else {
      const percentage = Number(settings["tax.percentage"]) || 0;
      taxAmount = Math.round((subtotal * percentage) / 100);
      taxType = "percentage";
    }
  }

  return {
    rate,
    subtotal,
    taxType,
    taxAmount,
    total: subtotal + taxAmount,
  };
}
