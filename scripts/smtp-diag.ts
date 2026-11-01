/**
 * Diagnostik jalur kirim email versi aplikasi (src/lib/smtp.ts).
 *
 *   npx tsx scripts/smtp-diag.ts [penerima]
 */
import "dotenv/config";
import { getSmtpConfig, sendHtmlEmail } from "../src/lib/smtp";

async function main() {
  const config = await getSmtpConfig();
  console.log("host      :", config.host);
  console.log("port      :", config.port, "| secure:", config.secure);
  console.log("servername:", config.servername ?? "(kosong)");
  console.log("user terisi:", Boolean(config.user), "| pass terisi:", Boolean(config.pass));
  console.log("from      :", config.from, "| to:", config.to);

  const target = process.argv[2] ?? config.to;
  console.log("mengirim ke:", target);

  const started = Date.now();
  const result = await sendHtmlEmail(config, {
    to: target,
    subject: "Diagnostik kirim email — Arsip Pitaloka",
    html: "<p>Diagnostik kirim email.</p>",
    text: "Diagnostik kirim email.",
    fromName: "Arsip Pitaloka",
  });
  console.log(`hasil (${Math.round((Date.now() - started) / 1000)} dtk):`, result);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => process.exit(0));
