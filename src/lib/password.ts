import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { ScryptOptions } from "node:crypto";

// N, r, p — parameter scrypt. Disimpan di dalam hash agar bisa diubah di masa depan.
const N = 16384;
const r = 8;
const p = 1;
const KEYLEN = 64;

/**
 * `promisify(scrypt)` hanya menghasilkan tipe 3 argumen (overload pertama
 * `scrypt` memang yang tanpa `options`), padahal kita butuh 4. Jadi bungkus manual.
 */
function scryptAsync(
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

/**
 * Hash password dengan scrypt (node:crypto, tanpa dependency tambahan).
 * Format: scrypt$<N>$<r>$<p>$<saltBase64>$<hashBase64>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize("NFKC"), salt, KEYLEN, {
    N,
    r,
    p,
  });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${key.toString("base64")}`;
}

/** Verifikasi password terhadap hash tersimpan. Selalu false bila format tidak dikenal. */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, nRaw, rRaw, pRaw, saltB64, keyB64] = parts;
  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(keyB64, "base64");
  if (expected.length === 0) return false;

  let key: Buffer;
  try {
    key = await scryptAsync(
      password.normalize("NFKC"),
      salt,
      expected.length,
      {
        N: Number(nRaw),
        r: Number(rRaw),
        p: Number(pRaw),
      },
    );
  } catch {
    return false;
  }

  return key.length === expected.length && timingSafeEqual(key, expected);
}
