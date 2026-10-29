import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt$16384$8$1$${salt.toString("base64")}$${key.toString("base64")}`;
}

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
  "company.name": "Pitaloka",
  "company.tagline": "Pustaka digital & e-book",
  "company.description":
    "Arsip Pitaloka adalah pustaka digital yang membuat akses pengetahuan lebih mudah.",
  "company.vision": "Menjadikan ilmu dan karya Rieke Diah Pitaloka tersedia untuk semua.",
  "company.mission": "Menyimpan dan lestarkan karya melalui media digital.",
  "company.address": "Jakarta, Indonesia",
  "company.phone": "",
  "company.email": "halo@arsippitaloka.com",
  "company.social.tiktok": "",
  "company.social.youtube": "",
  "company.social.instagram": "",
  "company.copyright": "©2026 Pitaloka. All Rights Reserved.",
  "company.logoUrl": "/images/logo-pitaloka.png",
  "payment.usdToIdr": "16000",
  "tax.enabled": "false",
  "tax.type": "percentage",
  "tax.percentage": "11",
  "tax.fixedAmount": "5000",
};

const tiktokPosts = [
  { videoId: "7234567890123456789", title: "#ViralForJustice", caption: "Contoh embed TikTok", author: "@pitaloka", highlight: true, order: 0 },
  { videoId: "7234567890123456790", title: "Pitaloka Documentary", caption: "Contoh embed TikTok", author: "@pitaloka", highlight: false, order: 1 },
];

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

  for (const p of tiktokPosts) {
    await prisma.tiktokPost.upsert({
      where: { videoId: p.videoId },
      update: p,
      create: { ...p, published: true },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: "ADMIN" },
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
