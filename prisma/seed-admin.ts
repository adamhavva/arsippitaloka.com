/**
 * Seed admin — membuat atau memperbarui satu akun ADMIN.
 *
 * Dipakai terpisah dari `prisma/seed.ts` (yang juga men-seed konten) supaya
 * bisa dijalankan berulang kali tanpa menyentuh data lain.
 *
 * Cara pakai:
 *   npx tsx prisma/seed-admin.ts
 *   npx tsx prisma/seed-admin.ts --email=admin@arsippitaloka.com --password=rahasia123
 *   npx tsx prisma/seed-admin.ts --keep-password        # jangan sentuh password
 *   npx tsx prisma/seed-admin.ts --name="Admin Pitaloka"
 *
 * Sumber nilai (urutan prioritas): argumen CLI → env ADMIN_EMAIL/ADMIN_PASSWORD.
 *
 * Perilaku:
 *   - Idempoten: aman dijalankan berkali-kali.
 *   - Akun yang sudah ada dipaksa jadi ADMIN + aktif + email terverifikasi,
 *     dan lockout (failedAttempts/lockedUntil) dibersihkan.
 *   - Password di-reset hashed baru HANYA bila `--keep-password` tidak dipakai.
 *     Format hash: scrypt$<N>$<r>$<p>$<saltBase64>$<hashBase64> (lihat src/lib/password.ts).
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type Args = {
  email?: string;
  password?: string;
  name?: string;
  keepPassword: boolean;
};

function parseArgs(argv: string[]): Args {
  const args: Args = { keepPassword: false };

  for (const raw of argv) {
    const [flag, ...rest] = raw.split("=");
    const value = rest.join("=");

    switch (flag) {
      case "--email":
        args.email = value;
        break;
      case "--password":
        args.password = value;
        break;
      case "--name":
        args.name = value;
        break;
      case "--keep-password":
        args.keepPassword = true;
        break;
      default:
        if (flag.startsWith("--")) {
          throw new Error(`Argumen tidak dikenal: ${flag}`);
        }
    }
  }

  return args;
}

function fail(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const email = (args.email ?? process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  if (!email) {
    fail(
      "Email admin belum diisi. Pakai --email=... atau set ADMIN_EMAIL di .env.",
    );
  }
  if (!email.includes("@")) {
    fail(`Format email tidak valid: ${email}`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  const password = args.password ?? process.env.ADMIN_PASSWORD ?? "";
  const resetPassword = !args.keepPassword;

  if (resetPassword && password.length < 8) {
    fail(
      "Password minimal 8 karakter. Gunakan --password=... atau set ADMIN_PASSWORD di .env.",
    );
  }
  if (!resetPassword && !existing) {
    fail(
      "Akun belum ada dan --keep-password dipakai, sehingga tidak ada password untuk disimpan.",
    );
  }

  const name = args.name ?? existing?.name ?? "Admin Pitaloka";

  const passwordHash = resetPassword ? await hashPassword(password) : undefined;

  const data = {
    name,
    role: "ADMIN" as const,
    isActive: true,
    emailVerified: existing?.emailVerified ?? new Date(),
    // Bersihkan lockout supaya admin yang terkunci bisa login lagi.
    failedAttempts: 0,
    lockedUntil: null,
    ...(passwordHash ? { passwordHash } : {}),
  };

  const user = await prisma.user.upsert({
    where: { email },
    update: data,
    create: { ...data, email, passwordHash: passwordHash! },
  });
  console.log(`Admin siap: ${user.email} (role=${user.role}, aktif=${user.isActive})`);
  console.log(
    resetPassword
      ? "Password di-reset dengan hash baru."
      : "Password lama dipertahankan.",
  );
  console.log(`ID: ${user.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
