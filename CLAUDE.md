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
- `DATABASE_URL` memakai `sslmode=verify-full` secara sengaja; jangan turunkan ke `require`.

## Cache Components (Next.js 16)

`cacheComponents: true` aktif. Setiap Server Component yang query database **wajib** punya `"use cache"` di baris pertama fungsi, kalau tidak build/prerender gagal dengan "uncached data during prerendering".

Jangan pakai `export const instant = false` — itu membuat route jadi blocking. Dengan `"use cache"`, route `/` tetap statis dengan revalidate 15 menit.

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

Patokan: tinggi halaman penuh **4234 px**. Kalau berubah tanpa alasan jelas, ada regresi layout.

## Setelah mengubah UI

1. `./node_modules/.bin/tsc --noEmit`
2. `npm run build`
3. Restart dev bersih, screenshot, bandingkan dengan PDF
4. Cek log dev server bersih dari warning (`sizes` pada `<Image fill>`, dll.)

## Perintah yang menyentuh database

`prisma migrate dev`, `prisma db seed`, dan `prisma db push` mengubah **database remote bersama**. Minta izin pengguna dulu sebelum menjalankannya.

## Bahasa

Komunikasi dengan pengguna memakai Bahasa Indonesia. Identifier kode tetap bahasa Inggris. Copy di UI mengikuti PDF persis (campuran Indonesia–Inggris).
