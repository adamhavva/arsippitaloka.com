import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/admin/require-admin";
import { parsePdfMeta } from "@/lib/pdf-meta";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const IMAGE_MAX = 5 * 1024 * 1024; // 5 MB
const PDF_MAX = 50 * 1024 * 1024; // 50 MB

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
};

/**
 * POST /api/admin/upload — unggah sampul (image) atau file e-book (PDF).
 *
 * Gambar disimpan di `public/uploads` supaya bisa dipakai `<Image>`.
 * PDF disimpan di `storage/private` (TIDAK ikut dilayani Next.js) supaya
 * halamannya hanya bisa diakses lewat route download yang memverifikasi
 * hak akses pembeli.
 *
 * Balasan memuat metadata file supaya form admin bisa mengisi kolom
 * otomatis (format, ukuran, jumlah kata, jumlah halaman).
 */
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const rawKind = String(form.get("kind") ?? "image");
  // "file" dipakai field e-book (PDF) oleh komponen upload.
  const kind = rawKind === "pdf" || rawKind === "file" ? "pdf" : "image";

  if (!(file instanceof File)) {
    return Response.json({ error: "File tidak ditemukan" }, { status: 400 });
  }

  const maxSize = kind === "pdf" ? PDF_MAX : IMAGE_MAX;
  if (file.size > maxSize) {
    return Response.json(
      { error: `Ukuran maksimal ${Math.round(maxSize / 1024 / 1024)} MB` },
      { status: 413 },
    );
  }

  if (kind === "image" && !IMAGE_TYPES.includes(file.type)) {
    return Response.json(
      { error: "Format gambar harus JPEG, PNG, WEBP, atau AVIF" },
      { status: 415 },
    );
  }
  if (kind === "pdf" && file.type !== "application/pdf") {
    return Response.json(
      { error: "File e-book harus PDF" },
      { status: 415 },
    );
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = EXT[file.type] ?? (kind === "pdf" ? ".pdf" : ".bin");
  const filename = `${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let url: string;
  if (kind === "pdf") {
    const dir = path.join(process.cwd(), "storage", "private", year, month);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    url = `/files/${year}/${month}/${filename}`;
  } else {
    const dir = path.join(process.cwd(), "public", "uploads", year, month);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
    url = `/uploads/${year}/${month}/${filename}`;
  }

  if (kind === "pdf") {
    const meta = parsePdfMeta(buffer);
    return Response.json({
      url,
      size: buffer.length,
      format: "PDF",
      words: meta.words,
      pages: meta.pages,
    });
  }

  return Response.json({
    url,
    size: buffer.length,
    format: ext.replace(".", "").toUpperCase(),
  });
}
