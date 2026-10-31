/**
 * Ubah File (dari input/paste) menjadi data URL base64 di sisi client.
 *
 * Dipakai untuk menyimpan gambar langsung ke DB sebagai string base64
 * (logo, gambar viral, foto admin, gambar di dalam rich text) tanpa perlu
 * endpoint upload tersendiri.
 *
 * Ada guard ukuran supaya kolom DB tidak membengkak — data URL base64 ~33%
 * lebih besar dari ukuran file aslinya.
 */

/** Batas ukuran file sebelum di-encode (byte). Default ~1.5MB. */
export const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

export class FileTooLargeError extends Error {
  constructor(public readonly size: number, public readonly max: number) {
    super(
      `Ukuran gambar ${(size / 1024 / 1024).toFixed(2)}MB melebihi batas ${(
        max /
        1024 /
        1024
      ).toFixed(1)}MB.`,
    );
    this.name = "FileTooLargeError";
  }
}

/**
 * Baca File → data URL base64. Menolak file yang bukan gambar atau yang
 * melebihi `maxBytes`.
 */
export function fileToDataUrl(
  file: File,
  maxBytes: number = MAX_IMAGE_BYTES,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File harus berupa gambar."));
      return;
    }
    if (file.size > maxBytes) {
      reject(new FileTooLargeError(file.size, maxBytes));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Gagal membaca file."));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error("Gagal membaca file."));
    reader.readAsDataURL(file);
  });
}

/** Apakah sebuah string berupa data URL (mis. hasil fileToDataUrl)? */
export function isDataUrl(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith("data:");
}
