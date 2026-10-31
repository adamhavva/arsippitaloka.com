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

const books = [
  { id: "seed-book-0", slug: "bung-karno-aku-arek-suroboyo", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: "/images/book-cover-bungkarno.jpg", pages: 289, readCount: 100, rating: "4.5", priceUsd: "150000", isNew: true, order: 0 },
  { id: "seed-book-1", slug: "bung-karno-aku-arek-suroboyo-2", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: null, pages: 289, readCount: 100, rating: "4.5", priceUsd: "150000", isNew: true, order: 1 },
  { id: "seed-book-2", slug: "bung-karno-aku-arek-suroboyo-3", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: null, pages: 289, readCount: 100, rating: "4.5", priceUsd: "150000", isNew: true, order: 2 },
  { id: "seed-book-3", slug: "bung-karno-aku-arek-suroboyo-4", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: "/images/book-cover-bungkarno.jpg", pages: 289, readCount: 100, rating: "4.5", priceUsd: "150000", isNew: true, order: 3 },
  { id: "seed-book-4", slug: "bung-karno-aku-arek-suroboyo-5", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: null, pages: 289, readCount: 100, rating: "4.5", priceUsd: "150000", isNew: true, order: 4 },
  { id: "seed-book-5", slug: "bung-karno-aku-arek-suroboyo-6", title: "Bung Karno Aku Arek Suroboyo", author: "Purnawan Barsundro", coverUrl: null, pages: 289, readCount: 100, rating: "4.5", priceUsd: "150000", isNew: true, order: 5 },
  // Buku GRATIS — di kartu tampil tombol "Download" (bukan Beli/keranjang).
  { id: "seed-book-free", slug: "panduan-arsip-digital-gratis", title: "Panduan Arsip Digital (Gratis)", author: "Tim Pitaloka", coverUrl: "/images/seed/ebook-gratis.jpg", pages: 24, readCount: 320, rating: "4.8", priceUsd: "0", isFree: true, isDownloadable: true, isNew: true, order: 6 },
];

/** Artikel (Berita Terkini / Blog / UMKM) — bukan produk, bebas baca. */
const articles = [
  {
    id: "seed-art-berita-1",
    slug: "pitaloka-dorong-transparansi-publik",
    title: "Pitaloka Dorong Transparansi Informasi Publik",
    type: "berita-terkini",
    excerpt: "Gerakan arsip digital menuntut keterbukaan data demi keadilan.",
    coverUrl: "/images/seed/berita-1.jpg",
    order: 0,
  },
  {
    id: "seed-art-berita-2",
    slug: "diskusi-ruu-perlindungan-data",
    title: "Diskusi Publik: RUU Perlindungan Data Pribadi",
    type: "berita-terkini",
    excerpt: "Catatan dari forum diskusi lintas komunitas sipil.",
    coverUrl: "/images/seed/berita-2.jpg",
    order: 1,
  },
  {
    id: "seed-art-berita-3",
    slug: "kolaborasi-literasi-digital-daerah",
    title: "Kolaborasi Literasi Digital hingga ke Daerah",
    type: "berita-terkini",
    excerpt: "Program bersama komunitas untuk memperluas akses pengetahuan.",
    coverUrl: "/images/seed/berita-3.jpg",
    order: 2,
  },
  {
    id: "seed-art-blog-1",
    slug: "cara-merawat-arsip-keluarga",
    title: "Cara Merawat Arsip Keluarga agar Awet",
    type: "blog",
    excerpt: "Tips sederhana mendigitalkan dan menyimpan dokumen keluarga.",
    coverUrl: "/images/seed/blog-1.jpg",
    order: 0,
  },
  {
    id: "seed-art-blog-2",
    slug: "mengapa-arsip-itu-penting",
    title: "Mengapa Arsip Itu Penting untuk Demokrasi",
    type: "blog",
    excerpt: "Arsip adalah ingatan kolektif — menjaga akuntabilitas publik.",
    coverUrl: "/images/seed/blog-2.jpg",
    order: 1,
  },
  {
    id: "seed-art-umkm-1",
    slug: "umkm-naik-kelas-lewat-digitalisasi",
    title: "UMKM Naik Kelas Lewat Digitalisasi",
    type: "umkm",
    excerpt: "Kisah pelaku usaha kecil yang berkembang dengan arsip digital.",
    coverUrl: "/images/seed/umkm-1.jpg",
    order: 0,
  },
  {
    id: "seed-art-umkm-2",
    slug: "strategi-pemasaran-umkm-lokal",
    title: "Strategi Pemasaran untuk UMKM Lokal",
    type: "umkm",
    excerpt: "Langkah praktis memasarkan produk UMKM ke pasar yang lebih luas.",
    coverUrl: "/images/seed/umkm-2.jpg",
    order: 1,
  },
];

const ARTICLE_BODY =
  "<h2>Ringkasan</h2><p>Ini adalah artikel contoh untuk mengisi kanal konten Arsip Pitaloka. Isi sebenarnya bisa Anda ubah dari menu admin.</p><h3>Poin penting</h3><ul><li>Konten bebas baca, tanpa harga.</li><li>Mendukung heading, daftar, dan gambar.</li><li>Dikelola lewat editor seperti Microsoft Word.</li></ul><p>Terima kasih sudah membaca.</p>";

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

  // Buku seed ikut diberi kategori, kalau kategorinya belum diisi manual di
  // admin. Tanpa ini, filter /buku/kategori/e-book tidak menampilkan apa pun.
  const ebookCategory = await prisma.category.findUnique({
    where: { slug: "e-book" },
  });
  if (!ebookCategory) throw new Error("Category e-book tidak ditemukan");

  // Upsert per buku — JANGAN deleteMany, karena OrderItem.book pakai onDelete: Restrict
  for (const b of books) {
    const { id, ...rest } = b;
    const current = await prisma.book.findUnique({
      where: { id },
      select: { categoryId: true },
    });
    const categoryId = current?.categoryId ?? ebookCategory.id;

    await prisma.book.upsert({
      where: { id },
      update: { ...rest, categoryId, language: "Indonesia" },
      create: { id, ...rest, categoryId, language: "Indonesia" },
    });
  }

  // Artikel (berita/blog/umkm) — upsert idempoten dengan id deterministik.
  for (const a of articles) {
    const { id, ...rest } = a;
    const data = {
      ...rest,
      body: ARTICLE_BODY,
      published: true,
      publishedAt: new Date("2026-08-01"),
    };
    await prisma.article.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  await prisma.documentation.deleteMany();
  await prisma.documentation.create({
    data: {
      slug: "demo-ruu-perampasan-aset-demi-indonesia-maju",
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
