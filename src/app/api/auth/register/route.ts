import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { normalizeEmail, isValidEmail } from "@/lib/email";
import { subscribeToNewsletter } from "@/lib/newsletter";

/**
 * Registrasi — NextAuth tidak menyediakan provider "register",
 * jadi route ini dibuat manual. Setelah berhasil, client memanggil
 * signIn("credentials", ...) untuk masuk.
 */
export async function POST(req: Request) {
  let body: {
    name?: string;
    email?: string;
    password?: string;
    /** Ikut berlangganan newsletter (default: ya). */
    newsletter?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid" }, { status: 400 });
  }

  const email = normalizeEmail(body.email);
  const password = body.password ?? "";

  // Form register mengikuti desain PDF dan tidak punya field "Name",
  // jadi nama diturunkan dari bagian email sebelum "@".
  const name =
    (body.name ?? "").trim() || email.split("@")[0] || email;

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Format email tidak valid" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password minimal 8 karakter" },
      { status: 400 },
    );
  }

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { error: "Email sudah terdaftar" },
      { status: 409 },
    );
  }

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
        role: "CUSTOMER",
      },
    });
  } catch (error) {
    // P2002 = unique constraint. Bisa terjadi kalau dua request registrasi
    // dengan email sama lolos dari pengecekan di atas pada saat bersamaan.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 409 },
      );
    }
    throw error;
  }

  // Langganan newsletter: ikutkan email baru ke daftar penerima kabarnya.
  // Kegagalan di sini tidak boleh menggagalkan pendaftaran.
  if (body.newsletter !== false) {
    try {
      await subscribeToNewsletter({
        email,
        name,
        source: "register",
      });
    } catch (error) {
      console.error("Gagal|langganan newsletter saat register", error);
    }
  }

  return NextResponse.json({ ok: true });
}
