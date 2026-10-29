import { readFile } from "node:fs/promises";
import { resolveBookFile } from "./library";

/**
 * Kirim file buku ke klien.
 * `disposition`: "attachment" (unduh) atau "inline" (baca di browser).
 */
export async function serveBookFile(
  fileUrl: string,
  filename: string,
  disposition: "attachment" | "inline",
): Promise<Response> {
  const source = resolveBookFile(fileUrl);

  if (!source) {
    return Response.json(
      { error: "File buku belum tersedia" },
      { status: 404 },
    );
  }

  if ("external" in source) {
    return Response.redirect(source.external, 302);
  }

  try {
    const buffer = await readFile(source.path);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": source.contentType,
        "Content-Length": String(buffer.byteLength),
        "Content-Disposition": `${disposition}; filename="${filename.replace(/["\\]/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "File buku tidak ditemukan di server" },
      { status: 404 },
    );
  }
}
