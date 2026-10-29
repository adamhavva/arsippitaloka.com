import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

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

async function main() {
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  for (const t of tabs) {
    await prisma.contentTab.upsert({ where: { slug: t.slug }, update: t, create: t });
  }

  await prisma.book.deleteMany({ where: { tabSlug: "e-book" } });
  await prisma.book.createMany({
    data: Array.from({ length: 6 }, (_, i) => ({
      title: "Bung Karno Aku Arek Suroboyo",
      author: "Purnawan Barsundro",
      coverUrl: i === 0 || i === 3 ? "/images/book-cover-bungkarno.jpg" : null,
      language: "Indonesia",
      pages: 289,
      readCount: 100,
      rating: "4.5",
      priceUsd: "25",
      isNew: true,
      order: i,
      tabSlug: "e-book",
    })),
  });

  await prisma.documentation.deleteMany();
  await prisma.documentation.create({
    data: {
      title: "Demo RUU Perampasan Aset Demi Indonesia Maju",
      lead: "Turun langsung kedepan gedung DPR/MPR RI Untuk Menemui para Demonstrasi. Jakarta, 27 Agustus 2026",
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

  console.log("Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
