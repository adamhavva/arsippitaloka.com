/**
 * Konten seed — data NYATA tentang Rieke Diah Pitaloka.
 *
 * Sumber fakta:
 * - Wikipedia bahasa Indonesia, "Rieke Diah Pitaloka"
 * - Open Library, author "Rieke Diah Pitaloka" (author key OL1545969A)
 * - Pemberitaan: Kompas.com, Tribunnews, ntvnews.id, Metro TV, TRANS7,
 *   TRANS TV, KOMPASTV, StarPro, Hype, Akbar Faizal Uncensored, dan lainnya.
 *
 * Gambar sampul diambil dari Wikimedia Commons dan disimpan lokal di
 * `public/images/seed/`. Atribusi lisensi tiap gambar ada di
 * `public/images/seed/CREDITS.md` dan di paragraf kredit pada artikel.
 */

/** Kategori konten (dipakai untuk facet katalog). */
export const CATEGORIES = [
  { name: "E-Book", slug: "e-book", icon: "BookOpen", highlight: false, order: 1 },
  { name: "Penulis", slug: "penulis", icon: "User", highlight: false, order: 2 },
  { name: "Biografi", slug: "biografi", icon: "Monitor", highlight: false, order: 3 },
  { name: "Blog", slug: "blog", icon: "Building2", highlight: false, order: 4 },
  { name: "Social Media", slug: "social-media", icon: "Wifi", highlight: false, order: 5 },
  { name: "#ViralForJustice", slug: "viral-for-justice", icon: "Flame", highlight: true, order: 6 },
];

/**
 * Buku — karya nyata Rieke Diah Pitaloka.
 *
 * Judul, tahun, penerbit, dan ISBN diambil dari katalog Open Library.
 * `pages` memakai `number_of_pages_median` dari katalog yang sama.
 */
export const BOOKS = [
  {
    id: "seed-book-renungan-kloset",
    slug: "renungan-kloset-dari-cengkeh-sampai-utrecht",
    title: "Renungan Kloset: Dari Cengkeh Sampai Utrecht",
    author: "Rieke Diah Pitaloka",
    publisher: "Gramedia Pustaka Utama",
    publishedYear: 2003,
    isbn: "9792202676",
    pages: 106,
    language: "Indonesia",
    priceUsd: "55000",
    rating: "4.6",
    readCount: 1284,
    isNew: false,
    isFree: false,
    coverUrl: "/images/seed/book-renungan-kloset.jpg",
    description:
      "Kumpulan esai dan renungan pribadi Rieke Diah Pitaloka. Perjalanan batin seorang perempuan Sunda, dari rumah nenek di Garut sampai ke kehidupan akademik di Eropa.",
  },
  {
    id: "seed-book-ups",
    slug: "ups",
    title: "Ups!",
    author: "Rieke Diah Pitaloka",
    publisher: "Gramedia Pustaka Utama",
    publishedYear: 2005,
    isbn: "9792217746",
    pages: 113,
    language: "Indonesia",
    priceUsd: "50000",
    rating: "4.4",
    readCount: 876,
    isNew: false,
    isFree: false,
    coverUrl: "/images/seed/book-ups.jpg",
    description:
      "Esai pendek dengan nada ringan dan reflektif, ditulis pada masa pertama Rieke Diah Pitaloka duduk di DPR RI.",
  },
  {
    id: "seed-book-kekerasan-negara",
    slug: "kekerasan-negara-menular-ke-masyarakat",
    title: "Kekerasan Negara Menular ke Masyarakat",
    author: "Rieke Diah Pitaloka",
    publisher: "Galang Press",
    publishedYear: 2004,
    isbn: "9793627247",
    pages: 210,
    language: "Indonesia",
    priceUsd: "75000",
    rating: "4.7",
    readCount: 1543,
    isNew: false,
    isFree: false,
    coverUrl: "/images/seed/book-kekerasan-negara.jpg",
    description:
      "Buku yang menerbitkan tesis magisternya tentang kekerasan negara, dengan telaah HAM Hannah Arendt sebagai pisau analisis.",
  },
  {
    id: "seed-book-banalitas-kekerasan",
    slug: "banalitas-kekerasan",
    title: "Banalitas Kekerasan",
    author: "Rieke Diah Pitaloka",
    publisher: "Koekoesan",
    publishedYear: 2010,
    isbn: "9791442398",
    pages: 133,
    language: "Indonesia",
    priceUsd: "65000",
    rating: "4.5",
    readCount: 942,
    isNew: false,
    isFree: false,
    coverUrl: "/images/seed/book-banalitas-kekerasan.jpg",
    description:
      "Telaah mengenai bagaimana kekerasan menjadi hal yang biasa dan dengan cepat merampas ruang gerak orang.",
  },
  {
    id: "seed-book-sumpah-saripah",
    slug: "sumpah-saripah",
    title: "Sumpah Saripah",
    author: "Rieke Diah Pitaloka",
    publisher: "Penerbit Koekoesan",
    publishedYear: 2011,
    isbn: "9791442401",
    pages: 99,
    language: "Indonesia",
    priceUsd: "60000",
    rating: "4.3",
    readCount: 731,
    isNew: false,
    isFree: false,
    coverUrl: "/images/seed/book-sumpah-saripah.jpg",
    description:
      "Kumpulan tulisan yang menyuarakan kembali kecemasan, tentang perpindahan, dan tentang mebel kayu yang dibangun perlahan.",
  },
  {
    id: "seed-book-panduan-arsip",
    slug: "panduan-arsip-digital",
    title: "Panduan Arsip Digital",
    author: "Tim Pitaloka",
    publisher: "Arsip Pitaloka",
    publishedYear: 2026,
    isbn: "",
    pages: 24,
    language: "Indonesia",
    priceUsd: "0",
    rating: "4.8",
    readCount: 3120,
    isNew: true,
    isFree: true,
    isDownloadable: true,
    coverUrl: "/images/seed/book-panduan-arsip.jpg",
    description:
      "Panduan singkat cara merapikan arsip keluarga: memindai surat, menamai berkas, membuat salinan cadangan, dan menata folder yang tetap bisa dicari bertahun-tahun kemudian.",
  },
];
