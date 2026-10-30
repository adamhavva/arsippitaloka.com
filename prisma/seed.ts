import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";
import { hashPassword } from "../src/lib/password";
import { DEFAULT_SETTINGS } from "../src/lib/site-settings-defaults";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const categories = [
  { name: "E-Book", slug: "e-book", icon: "BookOpen", highlight: false, order: 1 },
  { name: "Penulis", slug: "penulis", icon: "User", highlight: false, order: 2 },
  { name: "Biografi", slug: "biografi", icon: "Monitor", highlight: false, order: 3 },
  { name: "Blog", slug: "blog", icon: "Building2", highlight: false, order: 4 },
  { name: "Social Media", slug: "social-media", icon: "Wifi", highlight: false, order: 5 },
  { name: "#ViralForJustice", slug: "viral-for-justice", icon: "Flame", highlight: true, order: 6 },
];

const tabs = [
  { label: "E-Book", slug: "e-book", order: 1 },
  { label: "Berita Terkini", slug: "berita-terkini", order: 2 },
  { label: "YouTube", slug: "youtube", order: 3 },
  { label: "TikTok", slug: "tiktok", order: 4 },
  { label: "Blog", slug: "blog", order: 5 },
  { label: "UMKM", slug: "umkm", order: 6 },
  { label: "Dokumentasi", slug: "dokumentasi", order: 7 },
];

const books = [
  { id: "seed-book-0", slug: "bung-karno-aku-arek-suroboyo", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: "/images/book-cover-bungkarno.jpg", pages: 289, readCount: 100, rating: "4.5", priceUsd: "25", isNew: true, order: 0 },
  { id: "seed-book-1", slug: "bung-karno-aku-arek-suroboyo-2", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: null, pages: 289, readCount: 100, rating: "4.5", priceUsd: "25", isNew: true, order: 1 },
  { id: "seed-book-2", slug: "bung-karno-aku-arek-suroboyo-3", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: null, pages: 289, readCount: 100, rating: "4.5", priceUsd: "25", isNew: true, order: 2 },
  { id: "seed-book-3", slug: "bung-karno-aku-arek-suroboyo-4", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: "/images/book-cover-bungkarno.jpg", pages: 289, readCount: 100, rating: "4.5", priceUsd: "25", isNew: true, order: 3 },
  { id: "seed-book-4", slug: "bung-karno-aku-arek-suroboyo-5", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: null, pages: 289, readCount: 100, rating: "4.5", priceUsd: "25", isNew: true, order: 4 },
  { id: "seed-book-5", slug: "bung-karno-aku-arek-suroboyo-6", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: null, pages: 289, readCount: 100, rating: "4.5", priceUsd: "25", isNew: true, order: 5 },
];

const settings: Record<string, string> = {
  ...DEFAULT_SETTINGS,
  // Nilai ini sama dengan default; ditulis eksplisit agar mudah diubah.
  "company.copyright": "@2026 Pitaloka. All Rights Reserved.",
};

// Tidak ada seed untuk TiktokPost: id video harus milik Pitaloka dan tidak
// bisa dikarang. Admin menambahkan lewat /admin/tiktok (tempel share link),
// lalu mencentang "Tayang" supaya videonya tampil di beranda.

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  for (const t of tabs) {
    await prisma.contentTab.upsert({ where: { slug: t.slug }, update: t, create: t });
  }

  // Upsert per buku — JANGAN deleteMany, karena OrderItem.book pakai onDelete: Restrict
  const ebookTab = await prisma.contentTab.findUnique({ where: { slug: "e-book" } });
  if (!ebookTab) throw new Error("ContentTab e-book tidak ditemukan");
  for (const b of books) {
    const { id, ...rest } = b;
    await prisma.book.upsert({
      where: { id },
      update: { ...rest, tabId: ebookTab.id, language: "Indonesia" },
      create: { id, ...rest, tabId: ebookTab.id, language: "Indonesia" },
    });
  }

  await prisma.documentation.deleteMany();
  await prisma.documentation.create({
    data: {
      title: "Demo RUU Perampasan Aset Demi Indonesia Maju",
      lead: "Turun langsung ke gedung DPR/MPR RI Untuk Menemui para Demonstrasi. Jakarta, 27 Agustus 2026",
      photoUrl: "/images/doc-demo-photo.jpg",
      eventDate: new Date("2026-08-27"),
      checklist: [
        "Viral For Justice",
        "Indonesia Bebas Korupsi",
        "Sejahterakan Rakyat Indonesia",
        "Bersatu Kita Bisa",
      ],
      published: true,
    },
  });

  for (const [key, value] of Object.entries(settings)) {
    await prisma.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }


  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        role: "ADMIN",
        isActive: true,
        failedAttempts: 0,
        lockedUntil: null,
      },
      create: {
        name: "Admin Pitaloka",
        email: adminEmail,
        passwordHash: await hashPassword(adminPassword),
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log(`Admin dibuat: ${adminEmail}`);
  }

  console.log("Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
