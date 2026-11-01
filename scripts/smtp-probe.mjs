/**
 * Probe server SMTP: cek koneksi TLS, sertifikat, dan banner greeting.
 *
 *   node scripts/smtp-probe.mjs [host] [port] [servername]
 */
import tls from "node:tls";

const host = process.argv[2] ?? "202.10.43.86";
const port = Number(process.argv[3] ?? 465);
const servername = process.argv[4] ?? "mail.arsipitaloka.id";

console.log(`Menghubungkan ke ${host}:${port} (TLS, SNI/verifikasi: ${servername})`);

const socket = tls.connect({ host, port, servername }, () => {
  console.log("TLS handshake OK");
  console.log("protokol:", socket.getProtocol());
  const cert = socket.getPeerCertificate();
  console.log("sertifikat subject:", JSON.stringify(cert.subject));
  console.log("sertifikat issuer :", JSON.stringify(cert.issuer));
  console.log("valid dari        :", cert.valid_from);
  console.log("valid sampai      :", cert.valid_to);
  console.log("verified          :", socket.authorized, socket.authorizationError ?? "");
  socket.once("data", (chunk) => {
    console.log("banner:", JSON.stringify(chunk.toString()));
    socket.write("EHLO tester\r\n");
    socket.once("data", (chunk2) => {
      console.log("EHLO:", JSON.stringify(chunk2.toString()));
      socket.end();
      process.exit(0);
    });
  });
});

socket.setTimeout(30_000);
socket.on("timeout", () => {
  console.log("TIMEOUT — tidak ada banner dari server");
  socket.destroy();
  process.exit(1);
});
socket.on("error", (error) => {
  console.log("ERROR:", error.code, error.message);
  process.exit(1);
});
