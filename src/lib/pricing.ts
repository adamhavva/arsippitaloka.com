import { getSettings } from "@/lib/site-settings";

/**
 * Perhitungan harga order.
 *
 * Harga buku disimpan langsung dalam Rupiah (IDR) — Midtrans tidak mendukung
 * USD, jadi tidak ada konversi lagi. Field `rate` tetap ada di breakdown
 * (selalu 1) agar snapshot `Order.usdToIdrRate` & tipe data tetap kompatibel.
 * Aturan pajak diambil dari pengaturan admin dan di-snapshot ke order supaya
 * harga historis tidak berubah setelah pengaturan diubah.
 */
export type PriceBreakdown = {
  rate: number;
  subtotal: number;
  taxType: string | null;
  taxAmount: number;
  total: number;
};

export type CartPriceBreakdown = PriceBreakdown & {
  /** Subtotal IDR per buku (index sejajar dengan input priceUsds). */
  lines: number[];
};

/**
 * Pajak atas subtotal mengikuti pengaturan admin.
 * Dipisah agar perhitungan satu-buku dan keranjang memakai aturan sama.
 */
function computeTax(
  subtotal: number,
  settings: Awaited<ReturnType<typeof getSettings>>,
): { taxType: string | null; taxAmount: number } {
  if (settings["tax.enabled"] !== "true") {
    return { taxType: null, taxAmount: 0 };
  }

  const taxType = (settings["tax.type"] || "percentage").toLowerCase();
  if (taxType === "fixed") {
    return {
      taxType: "fixed",
      taxAmount: Math.round(Number(settings["tax.fixedAmount"]) || 0),
    };
  }

  const percentage = Number(settings["tax.percentage"]) || 0;
  return {
    taxType: "percentage",
    taxAmount: Math.round((subtotal * percentage) / 100),
  };
}

export async function calculatePrice(priceIdr: number): Promise<PriceBreakdown> {
  const settings = await getSettings();

  // Harga sudah dalam Rupiah → tidak ada konversi (rate = 1).
  const rate = 1;
  const subtotal = Math.round(priceIdr);
  const { taxType, taxAmount } = computeTax(subtotal, settings);

  return {
    rate,
    subtotal,
    taxType,
    taxAmount,
    total: subtotal + taxAmount,
  };
}

/**
 * Perhitungan harga untuk banyak buku (checkout keranjang).
 *
 * Subtotal = jumlah harga IDR tiap buku (dibulatkan per buku agar cocok
 * dengan `item_details` Midtrans), pajak dihitung sekali atas total subtotal.
 */
export async function calculateCartPrice(
  priceIdrs: number[],
): Promise<CartPriceBreakdown> {
  const settings = await getSettings();

  // Harga sudah dalam Rupiah → tidak ada konversi (rate = 1).
  const rate = 1;
  const lines = priceIdrs.map((idr) => Math.round(idr));
  const subtotal = lines.reduce((sum, line) => sum + line, 0);
  const { taxType, taxAmount } = computeTax(subtotal, settings);

  return {
    rate,
    subtotal,
    taxType,
    taxAmount,
    total: subtotal + taxAmount,
    lines,
  };
}
