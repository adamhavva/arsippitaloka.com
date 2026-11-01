/**
 * SMTP sink minimal (tanpa dependency) untuk menguji pipeline email lokal.
 *
 * Cara pakai:
 *   node scripts/smtp-sink.mjs [port]
 *   SMTP_HOST=127.0.0.1 SMTP_PORT=1025 SMTP_USER=test SMTP_PASS=test \
 *     npx tsx scripts/newsletter-smoke.ts
 *
 * Semua email yang masuk dicatat di /tmp/mailsink/outbox.jsonl
 */
import net from "node:net";
import { appendFileSync, mkdirSync } from "node:fs";

const port = Number(process.argv[2] ?? 1025);
const OUTBOX = "/tmp/mailsink/outbox.jsonl";

mkdirSync("/tmp/mailsink", { recursive: true });

const server = net.createServer((socket) => {
  let buffer = "";
  let inData = false;
  let data = "";
  let from = "";
  let to = [];

  const reply = (line) => socket.write(`${line}\r\n`);

  reply("220 mailsink ESMTP siap");

  socket.on("data", (chunk) => {
    buffer += chunk.toString("utf8");

    while (true) {
      const index = buffer.indexOf("\r\n");
      if (index === -1) break;
      const line = buffer.slice(0, index);
      buffer = buffer.slice(index + 2);

      if (inData) {
        if (line === ".") {
          inData = false;
          const subject = (data.match(/^Subject: (.*)$/m) ?? [])[1] ?? "";
          appendFileSync(
            OUTBOX,
            `${JSON.stringify({
              from,
              to: to.join(", "),
              subject,
              size: data.length,
            })}\n`,
          );
          console.log(`[sink] ${to.join(", ")} — ${subject}`);
          data = "";
          reply("250 2.0.0 Pesan diterima");
        } else {
          data += `${line}\n`;
        }
        continue;
      }

      const command = line.split(":")[0].trim().toUpperCase();

      if (command === "EHLO") {
        reply("250-mailsink");
        reply("250-8BITMIME");
        reply("250 SIZE 10485760");
      } else if (command === "HELO") {
        reply("250 mailsink");
      } else if (command === "MAIL FROM") {
        from = (line.match(/<([^>]*)>/) ?? [])[1] ?? "";
        reply("250 2.1.0 OK");
      } else if (command === "RCPT TO") {
        to.push((line.match(/<([^>]*)>/) ?? [])[1] ?? "");
        reply("250 2.1.5 OK");
      } else if (command === "DATA") {
        inData = true;
        data = "";
        reply("354 Kirim data, akhiri dengan titik");
      } else if (command === "QUIT") {
        reply("221 2.0.0 Bye");
        socket.end();
      } else if (command === "RSET" || command === "NOOP") {
        reply("250 2.0.0 OK");
      } else if (command === "AUTH") {
        reply("235 2.7.0 Accepted");
      } else {
        reply("250 2.0.0 OK");
      }
    }
  });

  socket.on("error", () => {});
});

server.listen(port, "127.0.0.1", () => {
  console.log(`SMTP sink siap di 127.0.0.1:${port} (outbox: ${OUTBOX})`);
});
