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
- Setelah sign-in, pembeli diarahkan ke `/akun` dan admin ke `/admin`
  (`src/components/auth/LoginForm.tsx`), kecuali ada `?callbackUrl=` eksplisit.

### Pustaka pembeli harus lengkap

`getLibrary()` (`src/lib/library.ts`) mengembalikan **semua** buku yang
relevan dengan user — tidak ada yang disembunyikan:

- semua item order apa pun statusnya (PAID/SHIPPED/PENDING/CANCELLED), digabung
  per buku jadi satu kartu + riwayat pembelanjaannya;
- buku gratis yang belum pernah dibeli (dan belum diarsipkan).

Status `SHIPPED` **memberi hak akses** — artinya sudah dibayar lalu dikirim.
Hanya PENDING (belum dibayar) dan CANCELLED yang belum memberi akses.
`ACCESS_STATUSES` di `src/lib/library.ts` adalah satu sumber kebenaran untuk
aturan ini; `canAccessBook()` memakainya untuk `/api/read` dan `/api/download`.

### Katalog publik & tab yang bisa diklik

URL katalog memakai **path**, bukan query string:

| URL | Isi |
| --- | --- |
| `/buku` | katalog semua buku |
| `/buku/<slug-tab>` | katalog per tab (mis. `/buku/berita-terkini`) |
| `/buku/kategori/<slug>` | katalog per kategori (mis. `/buku/kategori/biografi`) |
| `/buku/<slug-buku>` | detail buku (metadata lengkap, tombol Baca/Unduh bila pemili, CTA Beli bila belum login) |

`/buku/[slug]` menerima dua jenis slug: kalau slug-nya cocok **tab** → katalog
tab; kalau cocok **buku** → detail buku (tab menang kalau slug-nya sama).
Kategori memakai prefiks `/buku/kategori/` karena ada tab dan kategori yang
namanya sama ("blog", "e-book").

Tampilan katalog dipakai bersama oleh ketiga route lewat
`src/components/books/CatalogView.tsx` (server component) dan detail buku
dipindah ke `src/components/books/BookDetailView.tsx`. Paginasi tetap memakai
query `?page=` & `?per=` (aturan pagination proyek). URL lama
(`/buku?tab=…` / `/buku?kategori=…`) otomatis di-redirect ke path baru oleh
`src/proxy.ts`.

- Baris tab di beranda **bisa diklik**: `CoursesBrowser` (client) menyaring
  buku sesuai tab yang dipilih, dan menampilkan empty state kalau tabnya belum
  ada buku. Tab & kategori dikelola di admin → **Tab Konten** (`/admin/tab`) dan
  **Kategori** (`/admin/category`); buku diberi tab lewat field "Tab Konten"
  di `/admin/book`.
- Kartu kategori di beranda dan tautan "Browse" di footer menuju katalog
  (`/buku?kategori=…` / `/buku?tab=…`). `Hero.tsx` tidak diubah, jadi overlay
  nav "Books" masih menuju `#`.

### Fixture pembeli

`npx tsx scripts/buyer-library-fixture.ts create` membuat pembeli sementara
dengan order PAID/SHIPPED/PENDING/CANCELLED + buku gratis, untuk menguji
kelengkapan pustaka. Bersihkan dengan `... cleanup`.

CRUD admin generik: konfigurasi entitas ada di `src/lib/admin/entities.ts` (satu sumber kebenaran untuk label, kolom tabel, field form). Server action generik di `src/lib/admin/actions.ts` — nama model wajib ada di allowlist `ENTITY_MODELS`, jangan pakai string model dari URL.

## Pembayaran (Midtrans Snap)

Pembayaran e-book memakai **Midtrans Snap** (REST, tanpa SDK — `fetch` langsung
ke `app.sandbox.midtrans.com` / `app.midtrans.com`). Helper: `src/lib/midtrans.ts`.

Konfigurasi ada di tabel `SiteSetting` grup **"Midtrans"**, dikelola dari
`/admin/profile`:

| Key | Arti |
| --- | --- |
| `payment.midtrans.enabled` | Aktif/nonaktifkan pembayaran online |
| `payment.midtrans.mode` | `sandbox` atau `production` |
| `payment.midtrans.serverKey` | Rahasia (field bertipe `secret`) |
| `payment.midtrans.clientKey` | Boleh tampil di browser (tetap `secret`) |

- Nilai di **DB (diubah admin) menang**; kalau dikosongkan, dipakai fallback
  environment variable `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY` /
  `MIDTRANS_MODE` / `MIDTRANS_ENABLED` dari `.env` (tidak pernah di-commit).
- **Server key tidak pernah dikirim ke browser**: sebelum dirender, nilainya
  diganti `SECRET_MASK` (`src/lib/site-settings-defaults.ts`). Field secret
  yang tidak diubah (masih berupa mask) **tidak ditimpa** saat disimpan.
- Setting bertipe boolean mengirim hidden `0` + checkbox `1` — di server harus
  pakai `formData.getAll()`, bukan `get()` (kalau `get()`, nilainya selalu
  `"0"` sehingga checkbox tidak pernah tersimpan).

Route terkait:

- `POST /api/checkout` — body `{ bookId }`. Membuat order `PENDING` (harga
  IDR = `priceUsd × payment.usdToIdr`, pajak ikut sebagai item terpisah
  karena Midtrans mensyaratkan jumlah `item_details` = `gross_amount`), lalu
  membuat transaksi Snap dan mengembalikan `redirectUrl`. Buku gratis →
  order langsung `PAID` tanpa gateway. Sudah punya akses → `alreadyOwned`.
- `POST /api/webhook/midtrans` — notifikasi status; signature
  `sha512(order_id + status_code + gross_amount + serverKey)` diverifikasi
  dulu (dari body `signature` atau header `x-signature`), signature salah → 403.
- `GET /api/payment/status/[orderId]` — cek status ke Midtrans (dipakai
  polling di `/akun/orders/[id]`; sandbox lokal tidak punya webhook publik).
  Order hanya boleh dicek pemiliknya atau admin.

Uji coba end-to-end (butuh dev server jalan):

```bash
npm run test:midtrans       # transaksi sandbox sungguhan + webhook + cek pustaka
npm run db:check:midtrans   # status isi pengaturan Midtrans di DB
```

`scripts/midtrans-smoke.ts` membuat pembeli sementara, login, checkout ke
sandbox sungguhan, memastikan halaman Snap terbuka, mengesampingkan signature
(payload settlement buatan sendiri dari server key milik sendiri), lalu
memastikan order jadi lunas dan bukunya masuk Pustaka Saya. Data uji
dibersihkan di akhir.

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

## Konten halaman utama dari konfigurasi admin

Teks/konten beranda (judul section, tombol, paragraf #ViralForJustice, isi
footer, dan lain-lain) **bukan hardcoded** — diambil dari tabel `SiteSetting`
lewat `getSettings()` di `src/lib/site-settings.ts`.

- Nilai bawaan ada di `src/lib/site-settings-defaults.ts` (sengaja tanpa
  import `next/cache`/Prisma supaya bisa dipakai `prisma/seed.ts` juga).
  Kalau nilai di DB kosong, halaman publik memakai nilai bawaan.
- Tambah key baru → tambahkan **di `DEFAULT_SETTINGS` sekaligus di
  `SETTINGS_SCHEMA`** (form admin membaca `SETTINGS_SCHEMA`).
- Setelah simpan di admin, `updateTag("content")` meng-invalidate cache →
  beranda langsung ikut berubah.
- Katalog ikon lucide hanya boleh dimuat di client. Resolusi nama ikon
  (`Building2` → `building-2`) ada di `src/components/icons/CatalogIcon.tsx`
  (komponen client). `src/lib/icon.ts` hanya berisi helper string, aman
  dipakai di Server Component.

## Video TikTok di beranda

Section `#ViralForJustice` (`src/components/home/ViralForJustice.tsx`) memuat
maksimal **3** video TikTok dari tabel `TiktokPost`:

- hanya baris `published = true`, urut `order` lalu `createdAt` terbaru;
- tiap slot menampilkan `<iframe src="https://www.tiktok.com/embed/v2/{videoId}">`
  + overlay caption (judul/author) yang menuju `https://www.tiktok.com/@i/video/{videoId}`;
- slot yang tidak terisi memakai poster `home.viral.image` dari SiteSetting.

Peng administeringannya lewat `/admin/tiktok` (CRUD generik, entitas `tiktok`).
Admin cukup menempelkan share link atau kode embed; `videoId`, `judul`, dan
`author` diambil otomatis (`src/lib/tiktok-oembed.ts` → `checkTikTokVideo`).
`TiktokPost` **tidak di-seed** — id video asli milik Pitaloka.

Pengecekan keberadaan video bersifat *best effort*: TikTok sering membatasi
akses (balasan 5xx / halaman shell), jadi statusnya bisa `unknown` — posting
tetap disimpan dan admin diberi tahu videonya belum bisa dicek. Hanya status
`notfound` (TikTok jelas menyatakan video tidak ada) yang ditolak.

Tambahan: field boolean pada CRUD admin generik harus dibaca dengan
`formData.getAll()` — memakai `get()` selalu mengembalikan hidden `"0"` dan
checkbox jadi selalu tersimpan `false`.

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
