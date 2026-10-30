# CLAUDE.md

Panduan kerja untuk proyek **Arsip Pitaloka**. Lihat `README.md` untuk gambaran umum, stack, dan cara menjalankan.

## Prinsip utama: desain harus cocok dengan PDF

Sumber kebenaran desain adalah `references/layouts/26102026_UI_PITALOKA_MENU.pdf`. Halaman 1 = welcome page. Jangan mengarang layout, warna, atau teks — ambil dari PDF.

Cara membaca PDF (file besar, ~76MB):

```bash
pdftoppm -f 1 -l 1 -r 150 -png references/layouts/26102026_UI_PITALOKA_MENU.pdf /tmp/page
```

Render 150 DPI menghasilkan 4000×14050 px untuk halaman 1. PIL butuh `Image.MAX_IMAGE_PIXELS = None` agar tidak kena proteksi decompression bomb.

## JANGAN ubah Hero.tsx dan CtaBanner.tsx

Keduanya sengaja menampilkan **render PDF utuh** (`hero-full.jpg`, `cta-full.jpg`) yang teksnya sudah menyatu dalam gambar, plus overlay transparan untuk interaktivitas.

Jangan merender ulang judul/subjudul/tombol section itu sebagai teks HTML. Pendekatan berikut sudah dicoba dan **gagal**:

- Overlay gelap + blur → teks putih besar yang terbakar tetap terbaca sebagai bayangan
- Inpainting (cv2 Telea/NS) → menyisakan noda dan band blur pada teks tebal
- Crop region bebas teks → komposisi jadi berbeda dari PDF

Kalau butuh ubah teks hero/CTA, ubah di sumber desain lalu render ulang gambarnya.

## Saat menurunkan aset dari PDF

- Potong tepat di batas section. Cari baris putih margin halaman dengan memindai kecerahan baris (`np.array(img)[y].mean() > 250`) — menyisakan 1 baris putih saja akan muncul sebagai garis/band abu-abu setelah kena overlay.
- Jangan memasukkan elemen UI yang juga dirender HTML (badge, kartu caption), nanti dobel.
- Logo: ekstrak alpha dari latar maroon footer (`min(RGB) > 120` → alpha), bukan dari navbar yang latarnya foto.

## Halaman auth (login / register / forgot) dan 404

Berbeda dari hero beranda, panel form **dibangun sebagai HTML sungguhan** (harus bisa diisi), dan hanya **foto kolom kiri** yang diambil dari PDF. Halaman 404 mengikuti pola hero: gambar PDF utuh + overlay transparan, dengan `Footer` yang sudah ada.

Desain auth memakai kanvas 1920x1080; 1 px desain = 2.0833 px render pada 150 DPI. Posisi diambil dari PDF lalu dikunci lewat prop `contentLeft`/`contentTop` di `AuthShell`, bukan dengan rata tengah — rata tengah menimbulkan drift kumulatif.

Verifikasi posisi pakai `getBoundingClientRect` lewat Playwright, bukan pemindaian piksel: bandingkan `top`/`left` tiap elemen dengan angka PDF (toleransi ~1px). Pemindaian piksel mengukur batas tinta, bukan batas kotak, jadi menyesatkan untuk mengatur margin.

Teks mengikuti desain apa adanya, termasuk yang terlihat seperti salah tik: **"Fotget password"**, **"Forget password"**, dan spasi ganda pada **"Reset  password"**. Jangan "diperbaiki" tanpa persetujuan pengguna.

## Cache gambar Next.js

Menimpa file di `public/images/` **tidak cukup** — optimizer tetap menyajikan versi lama, bahkan setelah `rm -rf .next/cache/images`. Yang berhasil:

```bash
pkill -f "next dev"; rm -rf .next; npm run dev
```

Selalu lakukan ini setelah mengganti gambar, sebelum verifikasi visual.

## Prisma 7

- `url` **tidak boleh** ada di `schema.prisma` — letakkan di `prisma.config.ts` pada `datasource.url`, dan `import "dotenv/config"` di atas file itu.
- Perintah seed harus `npx tsx prisma/seed.ts`; tanpa `npx` gagal `spawn tsx ENOENT`.
- Client digenerate ke `prisma/generated/prisma`, bukan `node_modules`. Import via `src/lib/prisma.ts`.
- `prisma/generated/` **di-gitignore** dan di-generate ulang otomatis oleh `postinstall` (`prisma generate`). Kalau `prisma.user` / enum undefined saat runtime → jalankan `./node_modules/.bin/prisma generate`.
- Nama delegate Prisma hanya menurunkan huruf pertama model: `TiktokPost` → `prisma.tiktokPost`, `TikTokPost` → `prisma.tikTokPost` (jangan-Jangan). Karena itu model ditulis `TiktokPost`.
- `DATABASE_URL` lokal memakai `sslmode=disable` (Postgres di Docker tidak punya TLS). Untuk DB remote (Prisma Postgres) tetap `sslmode=verify-full` — jangan turunkan ke `require`.
- Seed **idempotent**: pakai `upsert` dengan id deterministik (`seed-book-0`, dst). Jangan `deleteMany` Book — `OrderItem.book` memakai `onDelete: Restrict`.

## Cache Components (Next.js 16)

`cacheComponents: true` aktif. Setiap Server Component yang query database **wajib** punya `"use cache"` di baris pertama fungsi, kalau tidak build/prerender gagal dengan "uncached data during prerendering".

Jangan pakai `export const instant = false` — itu membuat route jadi blocking. Dengan `"use cache"`, route `/` tetap statis dengan revalidate 15 menit.

Halaman yang membaca cookie/params (area admin & area pembeli) **tidak** bisa memakai `"use cache"`. Polanya: komponen default synchronously membungkus isi dinamis dengan `<Suspense>`, lalu komponen async di dalamnya memanggil `await connection()`. Tanpa boundary itu build gagal dengan "uncached data during prerendering". `await connection()` di dalam boundary tetap wajib — `connection()` tidak bisa di-cache.

## Dua area terpisah: admin vs pembeli

- **Area admin (`/admin`)** — back-office untuk mengelola konten: buku, kategori, tab konten, dokumentasi, TikTok, order, user, dan profil perusahaan. Guard: `src/proxy.ts` (lapis 1, JWT) + `requireAdmin()` (lapis 2, cek role ke DB).
- **Area pembeli (`/akun`)** — untuk user yang login biasa: Pustaka Saya (buku yang sudah dibeli), Riwayat Order, dan Profil. Guard: `src/proxy.ts` mensyaratkan sesi (role apa pun), `requireUser()` memverifikasi user masih aktif.

CRUD admin generik: konfigurasi entitas ada di `src/lib/admin/entities.ts` (satu sumber kebenaran untuk label, kolom tabel, field form). Server action generik di `src/lib/admin/actions.ts` — nama model wajib ada di allowlist `ENTITY_MODELS`, jangan pakai string model dari URL.

## Pagination

Setiap tabel/list di area admin dan area pembeli wajib memakai komponen
`src/components/Pagination.tsx` (query `?page=` dan `?per=`). Ukuran baris per
halaman: **5, 10, 25, 50** (default 10, minimal 5 — nilai lain diabaikan).
Helper parsing ada di `src/lib/pagination.ts` (`parsePage`, `parsePerPage`,
`clampPage`).

Paginasi dilakukan di server (Prisma `skip`/`take` + `count`), bukan di client.
Halaman yang sudah punya filter harus meneruskan filter itu ke `Pagination`
lewat prop `params` supaya tidak hilang saat pindah halaman. Baris yang sedang
diedit diambil terpisah dengan `findUnique` — bukan dari daftar baris halaman
sekarang — supaya edit tetap jalan walau barisnya ada di halaman lain.

Prisma `orderBy` menerima `{ field, dir }`, bukan `{ [field]: dir }` — ubah dulu sebelum meneruskan ke Prisma.

Hak akses file e-book (`/api/download/[bookId]`, `/api/read/[bookId]`): user harus punya order berstatus **PAID atau COMPLETED** untuk buku tersebut, atau buku itu `isFree` dan belum diarsipkan. File e-book hasil upload disimpan di `storage/private/` (di luar `public/`) supaya tidak bisa diakses langsung lewat URL — hanya lewat route di atas.

## CRUD admin generik

Definisi entitas ada di `src/lib/admin/entities.ts` — satu sumber kebenaran
label, kolom tabel, dan field form. Field bertipe khusus:

- `icon` — picker lucide-react (`src/components/admin/IconPicker.tsx`). Nilai
  disimpan PascalCase (mis. `BookOpen`). Resolusi nama ikon pakai
  `resolveIconName` di `src/lib/icon.ts`; nama kanonik lucide memakai
  kebab-case dan **bisa mengandung angka** (`building-2`), jadi konversi
  Pascal→kebab wajib memecah angka (`Building2` → `building-2`).
- `category` — kartu kategori + ikon (`src/components/admin/CategoryPicker.tsx`).
- `tiktok` — textarea + preview iframe (`src/components/admin/TikTokField.tsx`).

Field `slugFrom` diisi otomatis dari field sumber (live saat mengetik) dan
dibuat unik di server (`src/lib/admin/actions.ts` → `slugTaken`, suffix `-2`,
`-3`). Field `auto`/`autoFrom` terisi dari file yang diunggah: `format`,
`size`, `words`, `pages` (parser PDF tanpa dependency: `src/lib/pdf-meta.ts`).

Kolom yang **wajib di DB** harus punya `defaultValue` di definisi field,
dan `pruneEmpty` membuang nilai `null` supaya kolom wajib tidak gagal
disimpan. Contoh: `Category.order`, `ContentTab.order`, `Book.readCount`
wajib `defaultValue: 0`.

## Tailwind v4

Token tema didefinisikan di `src/app/globals.css` (`:root` + `@theme inline`). Hati-hati tabrakan nama dengan utilitas bawaan — token bernama `cover` menghasilkan `bg-cover` yang bentrok dengan `background-size: cover`. Itu sebabnya token warna sampul bernama `bookcover`, dan kartu buku memakai nilai literal `bg-[#3d2b2e]`.

Warna kunci: maroon `#561a1a`, maroon gelap `#3a1012`, sampul buku `#3d2b2e`.

## Verifikasi visual

Hook `rtk` di lingkungan ini rusak (`rtk: No such file or directory`), jadi panggil binary lokal langsung: `./node_modules/.bin/prisma`, `./node_modules/.bin/tsc`.

Screenshot halaman penuh pakai Playwright. Playwright **tidak** terpasang sebagai dependency proyek — hanya ada di cache npx, jadi script harus dijalankan dari dalam direktori cache itu (Node me-resolve `node_modules` dari lokasi script):

```bash
PW=$(find ~/.npm/_npx -maxdepth 4 -type d -name playwright | head -1)/../..
cp /tmp/pitaloka-assets/shot.mjs "$PW/shot.mjs"
(cd "$PW" && node shot.mjs http://localhost:3000)
rm -f "$PW/shot.mjs"
```

Script `shot.mjs` (viewport 1440×900, `fullPage: true`) menulis hasil ke `/tmp/pitaloka-assets/fullpage.png`. Kalau browser-nya belum ada, install versi yang cocok dari dalam direktori itu: `node node_modules/playwright-core/cli.js install chromium-headless-shell`.

Build bisa gagal dengan `Module not found: @vercel/turbopack-next/internal/font/google/font` setelah banyak rebuild beruntun — itu rate-limit unduhan Google Fonts, bukan bug kode. Tunggu sebentar lalu build ulang.

Patokan: tinggi halaman beranda **4234 px**. Kalau berubah tanpa alasan jelas, ada regresi layout.

## Setelah mengubah UI

1. `./node_modules/.bin/tsc --noEmit`
2. `npm run build`
3. Restart dev bersih, screenshot, bandingkan dengan PDF
4. Cek log dev server bersih dari warning (`sizes` pada `<Image fill>`, dll.)

## Database

DB dev = PostgreSQL 16 di Docker, container `postgres-local`, **host port 5433** →
container 5432. Database: `riekeu_dyah_pitaloka_dev`, user `postgres`, password `postgres`.

```bash
docker ps                       # pastikan postgres-local jalan
./node_modules/.bin/prisma migrate dev   # apply migration
./node_modules/.bin/prisma db seed       # isi data + admin
npm run db:seed:admin           # seed/reset akun admin saja (idempotent)
npm run db:check                # tampilkan user + verifikasi hash password admin
npm run db:sample-book          # pasang file contoh ke seed-book-0 (unduh/baca)
npm run test:login-admin        # uji login admin lewat HTTP (csrf → callback → /admin)
```

Penting: **password admin harus selalu sinkron dengan `ADMIN_PASSWORD` di `.env`**.
Kalau hash di DB tidak cocok dengan `.env`, login gagal dengan `CredentialsSignin`
(lihat `scripts/check-db.ts` → bagian "UJI LOGIN ADMIN"). Perbaikan:
`npm run db:seed:admin` (membaca `.env`) — atau `npm run db:seed:admin -- --password=...`
kalau ingin password lain (perintah ini menimpa isi `.env`, jadi samakan keduanya).

`prisma/seed-admin.ts` membuat atau memperbarui satu akun ADMIN tanpa menyentuh
data lain. Urutan nilai: argumen CLI (`--email`, `--password`, `--name`,
`--keep-password`) → env `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Password di-reset hashed
baru (format `scrypt$N$r$p$salt$hash`) kecuali `--keep-password` dipakai.

Kredensial di `.env` (gitignored). Salinan tanpa nilai rahasia di `.env.example` (di-commit).

`prisma migrate dev`, `prisma db seed`, dan `prisma db push` menghapus/menulis data.
DB ini **milik sendiri** (bukan shared), jadi boleh dijalankan tanpa izin — tapi kalau
nanti `DATABASE_URL` diarahkan ke DB remote/shared, izin pengguna dulu.

## Bahasa

Komunikasi dengan pengguna memakai Bahasa Indonesia. Identifier kode tetap bahasa Inggris. Copy di UI mengikuti PDF persis (campuran Indonesia–Inggris).
