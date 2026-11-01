/**
 * Cek konfigurasi Midtrans — sekarang HANYA dari environment variable (.env).
 *
 * Nilai tidak ditampilkan (server key tidak boleh bocor ke log); hanya
 * panjang karakternya supaya kelihatan terisi atau tidak.
 *
 * Sekalian membersihkan baris `payment.midtrans.*` yang masih tertinggal di
 * tabel SiteSetting (lama ada pengaturan Midtrans di DB; sekarang sudah
 * dihapus dan tidak dibaca lagi).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function show(label: string, value: string | undefined) {
  const v = value?.trim() ?? "";
  console.log(
    `${label.padEnd(22)} = ${v ? `(terisi, ${v.length} karakter)` : "(KOSONG)"}`,
  );
}

async function main() {
  console.log("— Konfigurasi dari .env —");
  show("MIDTRANS_ENABLED", process.env.MIDTRANS_ENABLED);
  show("MIDTRANS_MODE", process.env.MIDTRANS_MODE);
  show("MIDTRANS_SERVER_KEY", process.env.MIDTRANS_SERVER_KEY);
  show("MIDTRANS_CLIENT_KEY", process.env.MIDTRANS_CLIENT_KEY);

  const mode = process.env.MIDTRANS_MODE?.trim().toLowerCase();
  console.log(
    `endpoint             = ${mode === "production" ? "app.midtrans.com" : "app.sandbox.midtrans.com"}`,
  );

  console.log("\n— Sisa baris lama di DB (dibaca refresh, tapi tidak dipakai lagi) —");
  const rows = await prisma.siteSetting.findMany({
    where: { key: { startsWith: "payment.midtrans" } },
    orderBy: { key: "asc" },
  });

  if (rows.length === 0) {
    console.log("(bersih — tidak ada sisa)");
  } else {
    for (const row of rows) {
      console.log(`${row.key} = (${row.value?.trim() ? "terisi" : "kosong"})`);
    }
    if (process.argv.includes("--bersihkan")) {
      const deleted = await prisma.siteSetting.deleteMany({
        where: { key: { startsWith: "payment.midtrans" } },
      });
      console.log(`\n${deleted.count} baris lama dihapus dari SiteSetting.`);
    } else {
      console.log("\nJalankan dengan --bersihkan untuk menghapus baris lama.");
    }
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
