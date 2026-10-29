# Arsip Pitaloka

Platform arsip digital, dokumentasi, dan e-book milik **Rieke Diah Pitaloka**. Halaman welcome direplikasi 1:1 dari desain UI resmi (`references/layouts/26102026_UI_PITALOKA_MENU.pdf`, halaman 1), dengan konten digerakkan database.

## Stack

| Bagian | Teknologi |
|---|---|
| Framework | Next.js 16.4 (App Router, Turbopack, React Compiler) |
| UI | React 19.3, Tailwind CSS v4 (CSS-first config), lucide-react |
| Font | Baloo 2 (heading), Inter (body) via `next/font/google` |
| ORM | Prisma 7.10 + `@prisma/adapter-pg` |
| Database | Prisma Postgres (`pooled.db.prisma.io`) |

Fitur Next.js yang aktif (lihat `next.config.ts`): `cacheComponents`, `partialPrefetching`, `reactCompiler`.

## Memulai

```bash
npm install
```

Buat `.env` di root:

```env
DATABASE_URL="postgres://...?sslmode=verify-full"
```

> Gunakan `sslmode=verify-full` secara eksplisit. `sslmode=require` masih jalan, tapi memicu peringatan deprecation dan akan melemah semantiknya di `pg` v9.

Siapkan database lalu jalankan dev server:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Buka http://localhost:3000.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Build produksi |
| `npm start` | Jalankan hasil build |
| `npx prisma migrate dev` | Buat & terapkan migrasi |
| `npx prisma db seed` | Isi data awal sesuai desain PDF |
| `npx prisma studio` | GUI database |

## Struktur

```
prisma/
  schema.prisma          # 4 model konten
  seed.ts                # data awal sesuai PDF
  migrations/            # 20261028202441_init_content
  generated/prisma/      # Prisma Client hasil generate
public/images/           # aset diturunkan dari PDF desain
src/
  app/
    layout.tsx           # font Baloo 2 + Inter
    globals.css          # token tema Tailwind v4
    page.tsx             # merangkai 8 section
  components/home/
    Hero.tsx             # gambar PDF + overlay interaktif
    FeatureCategories.tsx   # dari DB
    FeaturedCourses.tsx     # dari DB
    ViralForJustice.tsx
    DocumentationSection.tsx # dari DB
    CtaBanner.tsx        # gambar PDF + overlay interaktif
    Footer.tsx
  lib/prisma.ts          # singleton PrismaClient + PrismaPg
```

## Model Data

| Model | Kegunaan |
|---|---|
| `Category` | 6 kartu section "Feature of Pitaloka" (`icon` = nama ikon lucide, `highlight` untuk kartu #ViralForJustice) |
| `ContentTab` | 7 tab: E-Book, Berita Terkini, YouTube, TikTok, Blog, UMKM, Dokumentasi |
| `Book` | Kartu buku; `coverUrl` null ⇒ fallback kotak coklat `#3d2b2e` sesuai desain |
| `Documentation` | Section "Dokumentasi & Arsip Digital" beserta `checklist` (array) |

## Aset Gambar

Semua gambar di `public/images/` **diturunkan dari PDF desain**, bukan stok eksternal:

| File | Asal |
|---|---|
| `hero-full.jpg` | Section hero utuh dari PDF (nav, judul, search bar sudah menyatu) |
| `cta-full.jpg` | Banner CTA utuh dari PDF (judul + tombol Biografi menyatu) |
| `logo-pitaloka.png` | Logo diekstrak jadi PNG transparan (alpha dari latar maroon footer) |
| `book-cover-bungkarno.jpg`, `doc-demo-photo.jpg`, `viral-justice-poster.jpg` | Crop foto dari PDF |

**Kenapa hero & CTA dipakai sebagai gambar utuh:** teks desain sudah "terbakar" di dalam foto dan tidak bisa dihapus bersih (inpainting menyisakan noda, blur+overlay tidak menutupi teks putih besar). Merender ulang teks sebagai HTML di atasnya menghasilkan teks dobel. Memakai render PDF apa adanya memberi kecocokan 100% tanpa tumpang tindih. Interaktivitas tetap ada lewat overlay transparan (nav links, search field, tombol Biografi).

## Status & Rencana

**Selesai**
- Replikasi 1:1 halaman welcome dari PDF (8 section)
- Aset gambar diturunkan presisi dari PDF, termasuk logo transparan
- Skema Prisma + migrasi + seed sesuai konten desain
- Section Kategori, Buku, dan Dokumentasi dibaca dari database
- `"use cache"` sehingga route `/` tetap statis (revalidate 15 menit)
- Bersih dari warning: TypeScript, build, dan runtime

**Berikutnya**
- Halaman lain dari PDF: Books, About, News & Views (lihat `references/layouts/`)
- Fungsikan pencarian, tab filter, dan tombol "View More" / "Read Now"
- Autentikasi untuk "Sign In" / "Join Us"
- Panel admin / CMS untuk kelola buku, kategori, dan dokumentasi
- Upload gambar (cover buku, foto dokumentasi) ke object storage
- Halaman detail buku dan pembayaran langganan
