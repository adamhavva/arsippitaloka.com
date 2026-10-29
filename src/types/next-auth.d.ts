import type { DefaultSession } from "next-auth";

/**
 * Augmentasi tipe NextAuth v5.
 *
 * `Session.user` bawaan hanya punya name/email/image. Kita tambahkan `id`
 * dan `role` supaya server component bisa melakukan authorization tanpa
 * query DB tambahan.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "CUSTOMER";
    } & DefaultSession["user"];
  }

  interface User {
    role?: "ADMIN" | "CUSTOMER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "CUSTOMER";
  }
}

/**
 * `next-auth/jwt` hanyalah `export * from "@auth/core/jwt"`, jadi interface JWT
 * yang asli ada di `@auth/core/jwt`. Augmentasi harus menyasar modul itu —
 * augmentasi "next-auth/jwt" tidak akan merged ke interface aslinya.
 */
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "CUSTOMER";
  }
}
