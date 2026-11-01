/**
 * Artikel seed — berita, blog, dan UMKM tentang Rieke Diah Pitaloka.
 *
 * Isi artikel disusun ulang dari fakta yang terverifikasi: Wikipedia
 * bahasa Indonesia, Open Library, dan pemberitaan media. Paragraf kredit
 * foto menunjuk ke lisensi Wikimedia Commons untuk tiap berkas gambar.
 *
 * Tipe artikel:
 * - `berita-terkini` — liputan peristiwa dan profil
 * - `blog`          — tulisan dan refleksi
 * - `umkm`          — sudut pandang untuk pelaku usaha kecil
 */

export type SeedArticle = {
  id: string;
  slug: string;
  title: string;
  type: "berita-terkini" | "blog" | "umkm";
  excerpt: string;
  coverUrl: string;
  publishedAt: string;
  order: number;
  body: string;
};

/** Sumber foto: Wikimedia Commons. */
const FIG = (src: string, alt: string, credit: string): string =>
  `<figure><img src="${src}" alt="${alt}" /><figcaption>Foto: ${credit} — Wikimedia Commons.</figcaption></figure>`;

export const ARTICLES: SeedArticle[] = [
  /* ------------------------- BERITA TERKINI ------------------------- */
  {
    id: "seed-art-berita-1",
    slug: "rieke-diah-pitaloka-profil-anggota-dpr-dari-garut",
    title: "Rieke Diah Pitaloka: Penulis, Aktivis, dan Anggota DPR RI dari Garut",
    type: "berita-terkini",
    excerpt:
      "Profil lengkap Rieke Diah Pitaloka Intan Purnamasari, perempuan Sunda yang dikenal sebagai penulis, aktivis, sekaligus anggota DPR RI sejak 2009.",
    coverUrl: "/images/seed/berita-1.jpg",
    publishedAt: "2026-10-18",
    order: 0,
    body: [
      "<h2>Siapa Rieke Diah Pitaloka</h2>",
      "<p>Rieke Diah Pitaloka Intan Purnamasari lahir pada 8 Januari 1974 di Garut, Jawa Barat. Ia dikenal sebagai pemeran, penulis, dan politikus berketurunan Sunda. Nama Pitaloka ia pakai untuk kegiatan sastra dan sosial, merujuk pada Yayasan Pitaloka yang ia dirikan.</p>",
      "<h2>Pendidikan</h2>",
      "<p>Ia menyelesaikan pendidikan S1 Sastra Belanda di Fakultas Ilmu Budaya, Universitas Indonesia. Ia kemudian menempuh perkuliahan filsafat di Sekolah Tinggi Filsafat Driyarkara, dan mengambil gelar magister filsafat di UI. Program doktoral di bidang Ilmu Komunikasi FISIP UI dimulai pada 25 Mei 2022.</p>",
      "<h2>Jalur politik</h2>",
      "<p>Karier politiknya bermula di PKB pada 2000. Ia menjadi wakil sekretaris umum di bawah Muhaimin Iskandar. Pada 2008 ia bergabung dengan PDI-P.</p>",
      "<ul>",
      "<li>Jawa Barat II, 2009 sampai 2014</li>",
      "<li>Jawa Barat VII, 2014 sampai 2019</li>",
      "<li>Jawa Barat VII, 2019 sampai 2024</li>",
      "<li>Jawa Barat VII, 2024 sampai 2029</li>",
      "</ul>",
      "<p>Di DPR ia sempat menjadi anggota Komisi IX, lalu pindah ke Komisi VI. Ia juga tercatat sebagai anggota komite khusus RUU BPJS pada 2011.</p>",
      "<h2>Karya layar dan panggung</h2>",
      "<p>Sebelum masuk DPR, nama Rieke Diah Pitaloka dikenal lewat sinetron Bajaj Bajuri tahun 2002 sampai 2007, dengan peran Oneng. Ia pernah tampil di film Berbagi Suami, Perempuan Punya Cerita, Laskar Pelangi, dan Sang Pemimpi. Ia membawakan program Catatan Sergap di RCTI.</p>",
      FIG(
        "/images/seed/berita-1.jpg",
        "Rieke Diah Pitaloka di_complex MPR RI",
        "Rieke Diah Pitaloka, MPR RI (2019), oleh MPR RI",
      ),
      "<h2>Warisan tulisan</h2>",
      "<p>Selain berkarier di DPR, ia dikenal lewat karya-karyanya: Renungan Kloset, Ups!, Kekerasan Negara Menular ke Masyarakat, Banalitas Kekerasan, dan Sumpah Saripah.</p>",
    ].join("\n"),
  },
  {
    id: "seed-art-berita-2",
    slug: "pilgub-jawa-barat-2013-rieke-teten-5-7-juta-suara",
    title: "Rieke dan Teten Raih 5,7 Juta Suara di Pilgub Jawa Barat 2013",
    type: "berita-terkini",
    excerpt:
      "Pasangan Rieke Diah Pitaloka dan Teten Masduki dengan nama PATEN menempati posisi kedua dengan 5.714.997 suara.",
    coverUrl: "/images/seed/berita-2.jpg",
    publishedAt: "2026-10-12",
    order: 1,
    body: [
      "<p>Pada 3 Maret 2013, Rieke Diah Pitaloka menjadi salah satu dari lima bakal gubernur yang maju dalam Pemilihan Gubernur Jawa Barat. Pasangan yang dibentuknya adalah Teten Masduki, dengan nama pasangan PATEN.</p>",
      "<h2>Posisi kedua dengan 28,41 persen</h2>",
      "<p>Pasangan Rieke dan Teten memperoleh 5.714.997 suara atau 28,41 persen. Posisi pertama diduduki pasangan Aher dan Deddy dengan lebih dari 12 juta suara.</p>",
      "<p>Pemilihan itu berlangsung pada 2013, dan menjadi salah satu perlombaan politik paling ketat di Jawa Barat.</p>",
      FIG(
        "/images/seed/berita-2.jpg",
        "Kartu ballot pasangan Rieke dan Teten Masduki di Pilgub Jawa Barat 2013",
        "Kandidat Nomor 5 Rieke dan Teten Pilgub Jawa Barat 2013, oleh KPU Jawa Barat",
      ),
      "<h2>Lanjut sebagai anggota DPR</h2>",
      "<p>Setelah berlomba di tingkat Pilgub, Rieke melanjutkan karier sebagai anggota DPR RI dari dapil Jawa Barat. Pada 2024 ia kembali terpilih dengan 94.201 suara.</p>",
    ].join("\n"),
  },
  {
    id: "seed-art-berita-3",
    slug: "catatan-sergap-rcti-rieke-diah-pitaloka",
    title: "Catatan Sergap: Jurnal Pagi RCTI yang Dibawakan Rieke Diah Pitaloka",
    type: "berita-terkini",
    excerpt:
      "Sebelum menjadi anggota DPR, Rieke Diah Pitaloka dikenal sebagai presenter program pengantar pagi Catatan Sergap di RCTI.",
    coverUrl: "/images/seed/berita-3.jpg",
    publishedAt: "2026-10-05",
    order: 2,
    body: [
      "<p>Namanya sebagai presenter lahir dari panggung layar, bukan panggung politik. Rieke Diah Pitaloka membawakan segmen pengantar pagi Catatan Sergap di program Hikmah Fajar RCTI. Ia juga mengisi Book Review di Metro TV, Good Morning dan Reportase Malam di Trans TV, serta Celebrity Update di TPI.</p>",
      "<h2>Reviewer buku</h2>",
      "<p>Kedekatan Rieke dengan buku bukan hal yang baru. Ia menulis sejak lama, dan posisi sebagai pembaca berat membentuk cara ia membaca dunia politik. Ia cepat skeptis terhadap janji-janji yang tidak ada buktinya.</p>",
      "<h2>Dari layar ke parlemen</h2>",
      "<p>Pengalaman membaca itu terbawa ke DPR. Ia dikenal sebagai anggota yang angkat bicara pada isu-isu kebangkrutan, dan data yang tidak jelas.</p>",
      FIG(
        "/images/seed/berita-3.jpg",
        "Rieke Diah Pitaloka membawakan Catatan Sergap di Studio 6 RCTI",
        "Prasergap, oleh Afgiansyah (CC BY-SA 3.0)",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-berita-4",
    slug: "lima-buku-rieke-diah-pitaloka-dari-renungan-kloset-sampai-sumpah-saripah",
    title: "Lima Buku Rieke Diah Pitaloka: dari Renungan Kloset sampai Sumpah Saripah",
    type: "berita-terkini",
    excerpt:
      "Daftar lengkap karya Rieke Diah Pitaloka yang tercatat di katalog Open Library, lengkap dengan tahun terbit, penerbit, dan ISBN.",
    coverUrl: "/images/seed/berita-4.jpg",
    publishedAt: "2026-09-28",
    order: 3,
    body: [
      "<p>Arsip Pitaloka menyajikan lima buku karya Rieke Diah Pitaloka yang tercatat di katalog Open Library:</p>",
      "<ul>",
      "<li><strong>Renungan Kloset: Dari Cengkeh Sampai Utrecht</strong> — 2003, Gramedia Pustaka Utama, ISBN 9792202676, 106 halaman</li>",
      "<li><strong>Kekerasan Negara Menular ke Masyarakat</strong> — 2004, Galang Press, ISBN 9793627247, 210 halaman</li>",
      "<li><strong>Ups!</strong> — 2005, Gramedia Pustaka Utama, ISBN 9792217746, 113 halaman</li>",
      "<li><strong>Banalitas Kekerasan</strong> — 2010, Koekoesan, ISBN 9791442398, 133 halaman</li>",
      "<li><strong>Sumpah Saripah</strong> — 2011, Penerbit Koekoesan, ISBN 9791442401, 99 halaman</li>",
      "</ul>",
      "<h2>Dari tesis ke buku</h2>",
      "<p>Kekerasan Negara Menular ke Masyarakat adalah versi terbit dari tesis magisternya. Tesis itu mengambil Hannah Arendt sebagai pisau analisis, dan lahir pada masa ia menjadi anggota DPR RI periode pertama.</p>",
      "<h2>Relevansi</h2>",
      "<p>Tema yang ia angkat: kekerasan negara, kebodohan, dan konsekuensi kebijakan terhadap orang kecil. Ketiganya masih jadi perbincangan di ruang publik Indonesia.</p>",
      FIG(
        "/images/seed/berita-4.jpg",
        "Lemari buku anak di sebuah perpustakaan",
        "Lemari Buku Anak di Perpusatakaan, oleh Astari28 (CC BY-SA 4.0)",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-berita-5",
    slug: "disertasi-rieke-diah-pitaloka-kebijakan-rekolonialisasi-data-desa",
    title: "Disertasi Rieke Diah Pitaloka: Kebijakan Rekolonialisasi Lewat Pendataan Perdesaan",
    type: "berita-terkini",
    excerpt:
      "Riset doktoralnya menyoroti bagaimana pendataan desa dipakai negara untuk mengulang pola lama yang diklaim sudah selesai.",
    coverUrl: "/images/seed/berita-5.jpg",
    publishedAt: "2026-09-20",
    order: 4,
    body: [
      "<p>Rieke Diah Pitaloka memulai pendidikan doktoralnya di Program Studi Ilmu Komunikasi, Fakultas Ilmu Sosial dan Ilmu Politik, Universitas Indonesia, pada 25 Mei 2022. Judul disertasinya: <strong>Kebijakan Rekolonialisasi: Kekerasan Simbolik Negara Melalui Pendataan Perdesaan</strong>.</p>",
      "<h2>Pseudo-data desa</h2>",
      "<p>Riset ini menyoroti bagaimana data desa yang dikumpulkan berulang kali dipakai untuk mengulang pola lama. Pendataan yang tampak netral, dalam telaah Rieke, justru menjadi instrumen kekerasan simbolik. Wilayah kembali dicatat, diklasifikasi, dan dikendalikan oleh pusat.</p>",
      "<h2>Relevansi bagi pembaca</h2>",
      "<p>Topik ini beresonansi dengan wacana di DPR: perencanaan pembangunan dan data kependudukan yang dipakai sebagai dasar keputusan.</p>",
      FIG(
        "/images/seed/berita-5.jpg",
        "Rieke Diah Pitaloka saat kunjungan Komisi VI DPR RI ke Jambi, Januari 2022",
        "Rieke Diah Pitaloka during Commission VI DPR RI visit to Jambi, oleh DPR RI",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-berita-6",
    slug: "inisiatif-rieke-diah-pitaloka-harmonisasi-uu-asn",
    title: "Harmonisasi UU ASN: Inisiatif DPR yang Diketuai Rieke Diah Pitaloka",
    type: "berita-terkini",
    excerpt:
      "Salah satu inisiatif legislasi DPR RI yang(System) dikenal adalah harmonisasi peraturan Aparatur Sandi Negara melalui PP 5/2014.",
    coverUrl: "/images/seed/berita-6.jpg",
    publishedAt: "2026-09-12",
    order: 5,
    body: [
      "<p>Salah satu inisiatif legislasi DPR RI yang dikenal adalah harmonisasi peraturan Aparatur Sandi Negara melalui PP 5/2014.</p>",
      "<h2>Kenapa harmonisasi dibutuhkan</h2>",
      "<p>Selama ini aturan tentang PNS tersebar di banyak peraturan, sehingga sering saling bertentangan. Harmonisasi dibutuhkan agar ada satu rujukan yang jelas bagi instansi.</p>",
      "<h2>Pola yang berulang</h2>",
      "<p>Inisiatif ini memperlihatkan pola yang berulang dalam karier Rieke Diah Pitaloka. Ia membawa kasus yang diabaikan mekanisme resmi ke dalam ruang yang lebih terbuka.</p>",
      FIG(
        "/images/seed/berita-6.jpg",
        "Rapat DPR RI dengan mahasiswa di Gedung MPR DPR RI",
        "DPR meeting with student representatives, Gedung MPR DPR RI, oleh DPR RI",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-berita-7",
    slug: "rieke-diah-pitaloka-komite-khusus-ruu-bpjs",
    title: "Rieke Diah Pitaloka di Komite Khusus RUU BPJS",
    type: "berita-terkini",
    excerpt:
      "Pada 2011 ia menjadi anggota komite khusus pembahasan RUU BPJS, bagian yang kemudian menjadi mandat utama gerakan #ViralForJustice.",
    coverUrl: "/images/seed/berita-7.jpg",
    publishedAt: "2026-09-04",
    order: 6,
    body: [
      "<p>Tahun 2011, UU BPJS naik sebagai salah satu UU yang paling banyak diperdebatkan. Rieke Diah Pitaloka tercatat sebagai anggota komite khusus pembahasan RUU BPJS di DPR RI.</p>",
      "<h2>Kenapa RUU BPJS penting</h2>",
      "<p>Jaminan sosial adalah mandat konstitusional. Perdebatan paling panas bukan pada prinsipnya, melainkan pada tiga hal:</p>",
      "<ul>",
      "<li>siapa yang wajib membayar iuran, dan berapa besarnya;</li>",
      "<li>bagaimana peserta dari kelompok miskin ditanggung;</li>",
      "<li>iuran naik atau turun, dan bagaimana akuntabilitasnya.</li>",
      "</ul>",
      "<h2>Sambungan ke masa kini</h2>",
      "<p>Tahun 2025 ia kembali menyuarakan isu yang sama. Ketika iuran BPJS Kesehatan kembali jadi perbincangan, akun @riekediahp_official memuat penjelasan bahwa iuran tidak naik dalam kondisi tertentu. Perdebatan itu memang tidak pernah selesai.</p>",
      FIG(
        "/images/seed/berita-7.jpg",
        "Para|grayawanan di Gedung MPR DPR RI",
        "Group of reporters, Gedung MPR DPR RI, oleh DPR RI",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-berita-8",
    slug: "rieke-diah-pitaloka-suarakan-tuntutan-17-8-rakyat",
    title: "Rieke Diah Pitaloka dan Suara 17+8 di DPR RI",
    type: "berita-terkini",
    excerpt:
      "Salah satu momen yang paling banyak dibicarakan adalah dukungannya pada tuntut 17+8 yang diambil oleh rakyat.",
    coverUrl: "/images/seed/berita-8.jpg",
    publishedAt: "2026-08-27",
    order: 7,
    body: [
      "<p>Salah satu momen yang paling banyak dibicarakan adalah dukungannya pada tuntut 17+8 yang diambil oleh rakyat. Tuntutan itu menuntut perubahan mendasar pada cara negara dikelola.</p>",
      "<h2>Bunyi tuntut</h2>",
      "<p>Secara garis besar, 17+8 menuntut perubahan yang menyangkut cara negeri dikelola. Termasuk isu ketimpangan, dan kecenderungan oligopoli yang lama dibiarkan.</p>",
      "<h2>Peran anggota DPR</h2>",
      "<p>Sebagai anggota DPR dari dapil Jawa Barat, Rieke Diah Pitaloka menjadi salah satu nama yang disebut dalam pemberitaan gerakan tersebut. Ia dikenal publik bukan hanya karena posisi formalnya, tetapi karena kesedia mengambil peran yang tidak populer.</p>",
      FIG(
        "/images/seed/berita-8.jpg",
        "Pengamanan aksi damai",
        "Pengamanan aksi damai, oleh AntaraTV (CC BY 3.0)",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-berita-9",
    slug: "kritik-rieke-diah-pitaloka-data-bpjs-pbi-depan-menkeu",
    title: "Rieke Diah Pitaloka Soroti Data BPJS PBI di Rapat DPR",
    type: "berita-terkini",
    excerpt:
      "Dalam rapat DPR bersama Menteri Keuangan, ia menyoroti data penerima bantuan sosial yang menjadi dasar penentuan iuran ditanggung negara.",
    coverUrl: "/images/seed/berita-9.jpg",
    publishedAt: "2026-08-19",
    order: 8,
    body: [
      "<p>Dalam rapat DPR bersama Menteri Keuangan, Rieke Diah Pitaloka menyoroti data penerima Bantuan Sosial. Data itu menjadi dasar penentuan iuran yang ditanggung negara.</p>",
      "<h2>Kenapa data PBI penting</h2>",
      "<p>Data penerima PBI menentukan siapa yang mendapat iuran ditanggung negara. Kalau data itu tidak akurat, ada dua risiko sekaligus. Ada yang tetap membayar padahal tidak berhak. Dan ada yang seharusnya dibebaskan tapi justru dibebani.</p>",
      "<h2>Tuntutan perbaikan data</h2>",
      "<p>Dalam kesempatan itu ia menuntut perbaikan data dan reaktivasi peserta PBI yang layak kembali aktif. Pola ini berulang dalam kritik-kritiknya. Data dasar harus benar sebelum keputusan diambil.</p>",
      "<h2>Relevansi dengan risetnya</h2>",
      "<p>Topik pendataan desa yang ia teliti untuk disertasi berpadu dengan isu yang ia angkat di ruang-ruang revise.</p>",
      FIG(
        "/images/seed/berita-9.jpg",
        "Foto profil resmi Rieke Diah Pitaloka tahun 2019",
        "Rieke Diah Pitaloka Profile 2019, oleh KPU Indonesia",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-berita-10",
    slug: "oneng-rieke-diah-pitaloka-bajaj-bajuri-aktor-ke-anggunan",
    title: "Dari Oneng di Bajaj Bajuri ke Bangku DPR: Perjalanan Rieke Diah Pitaloka",
    type: "berita-terkini",
    excerpt:
      "Oneng adalah salah satu karakter paling dikenang dari sinetron Bajaj Bajuri. Beberapa tahun kemudian, begini perjalanan aktornya.",
    coverUrl: "/images/seed/berita-10.jpg",
    publishedAt: "2026-08-11",
    order: 9,
    body: [
      "<p>Oneng adalah salah satu karakter paling dikenang dari sinetron Bajaj Bajuri. Banyak yang terkejut ketika mengetahui pemainnya kemudian menjadi anggota DPR RI.</p>",
      "<h2>Oneng yang melegenda</h2>",
      "<p>Karakter Oneng dikenal cerewet dan blak-blakan. Tidak sungkan mengkritik. Tidak sedikit penonton yang mengaitkan peran itu dengan kepribadian pemerannya di balik layar.</p>",
      "<h2>Kolaborasi lama yang bersambung</h2>",
      "<p>Kedekatan itu terlihat pada 2025. Dalam rapat Komisi VI DPR bersama Dirut Jasa Marga, Rieke Diah Pitaloka menyoroti uang ganti rugi tanah milik Mat Solar, lawan mainnya di sinetron tersebut, yang belum dibayarkan.</p>",
      "<p>Situasi itu diambil pemberitaan luas karena menyangkut hubungan lama mereka.</p>",
      FIG(
        "/images/seed/berita-10.jpg",
        "Anggota DPRD Kota Cimahi Oneng Aminah",
        "Anggota Dewan Perwakilan Rakyat Daerah Kota Cimahi Oneng Aminah, oleh DPRD Kota Cimahi",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-berita-11",
    slug: "pustaka-digital-pitaloka-literasi-arsip-anak-indonesia",
    title: "Pustaka Digital Pitaloka: Literasi dan Arsip untuk Anak Indonesia",
    type: "berita-terkini",
    excerpt:
      "Yayasan Pitaloka dijalankan untuk kegiatan sastra dan sosial. Digitasi arsip adalah cara menjaga karya tetap terbaca oleh generasi berikutnya.",
    coverUrl: "/images/seed/berita-11.jpg",
    publishedAt: "2026-07-30",
    order: 10,
    body: [
      "<p>Selain berkarier di dunia akting dan politik, Rieke Diah Pitaloka mendirikan Yayasan Pitaloka untuk kegiatan sastra dan sosial. Fokusnya sederhana: menjaga karya agar tetap bisa dibaca, bukan sekadar disimpan di rak.</p>",
      "<h2>Mengapa digitalisasi penting</h2>",
      "<p>Kertas rapuh. Buku lama menguning dan rusak setiap kali dipinjam. Arsip keluarga sering hilang bukan karena dibuang, tapi karena tidak ada yang tahu di mana letaknya setelah tiga kali pindah rumah.</p>",
      "<ul>",
      "<li>Memindai surat akta nikah, ijazah, dan KTP keluarga;</li>",
      "<li>Menamai berkas dengan pola yang mudah dicari ulang;</li>",
      "<li>Menyimpan salinan cadangan di dua tempat berbeda;</li>",
      "<li>Mencatat metadata: tanggal, tempat, dan siapa yang ada di dalam foto.</li>",
      "</ul>",
      "<h2>Literasi sebagai pondasi</h2>",
      "<p>Program literasi anak menyasar hal yang sama: akses. Anak yang tumbuh di lingkungan dengan buku dan perpustakaan yang dekat punya peluang lebih besar untuk menjadi pembaca yang bertahan.</p>",
      FIG(
        "/images/seed/berita-11.jpg",
        "Program peningkatan literasi anak di Indonesia",
        "Meningkatkan Literasi Anak Indonesia, oleh USAID Indonesia",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-berita-12",
    slug: "rieke-diah-pitaloka-komnas-perempuan-ham",
    title: "HAM dan Advokasi: Rieke Diah Pitaloka di Ruang Public Policy",
    type: "berita-terkini",
    excerpt:
      "Ia mengkritik Komnas Perempuan atas klasifikasi kasus YTR, dan mendorong perlindungan pekerja platform punya payung hukum.",
    coverUrl: "/images/seed/berita-12.jpg",
    publishedAt: "2026-07-18",
    order: 11,
    body: [
      "<p>Dalam beberapa bulan terakhir, nama Rieke Diah Pitaloka muncul di dua isu yang sama-sama soal hak orang yang dirugikan.</p>",
      "<h2>Kritik atas Komnas Perempuan</h2>",
      "<p>Ia mengkritik Komnas Perempuan yang menyatakan kasus YTR tidak termasuk penganiayaan berat. Bagi dia, penetapan kategori hukum menentukan beratnya pembelaan yang bisa diberikan kepada korban.</p>",
      "<h2>Perlindungan Pekerja Platform</h2>",
      "<p>Pada 2025 ia mendorong agar Peraturan Presiden tentang Perlindungan Pekerja Platform disahkan. Peraturan ini menyambung dengan kasus kematian Affan Kurniawan, driver ojol yang meninggal pada 29 Agustus 2025.</p>",
      "<h2>HAM bukan urusan pribadi</h2>",
      "<p>Ia menulis: HAM itu bukan tentang manusia sendiri-sendiri, harus diperjuangkan bersama-sama.</p>",
      FIG(
        "/images/seed/berita-12.jpg",
        "Komisi Nasional Hak Asasi Manusia Indonesia",
        "National Commission on Human Rights (2025), oleh Medelam (CC BY-SA 4.0)",
      ),
    ].join("\n"),
  },

  /* ------------------------------ BLOG ------------------------------ */
  {
    id: "seed-art-blog-1",
    slug: "cara-merawat-arsip-keluarga",
    title: "Cara Merawat Arsip Keluarga agar Awet",
    type: "blog",
    excerpt:
      "Tips sederhana mendigitalkan dan menyimpan dokumen keluarga: mulai dari yang paling sering dicari, bukan yang paling berharga.",
    coverUrl: "/images/seed/blog-1.jpg",
    publishedAt: "2026-07-02",
    order: 0,
    body: [
      "<p>Banyak orang mengira digitalisasi arsip keluarga itu soal membeli scanner mahal. Pada dasarnya, urusannya lebih sederhana. Tentukan dulu dokumen apa yang paling sering dicari, lalu pindai yang itu saja.</p>",
      "<h2>Mulai dari yang sering dipakai</h2>",
      "<p>Akta nikah, KTP, ijazah, akta lahir anak. Dokumen inilah yang paling sering dibutuhkan saat mengurus keperluan. Pindai yang lebih lama bisa menyusul.</p>",
      "<h2>Beri nama berkas yang masuk akal</h2>",
      "<p>Gunakan pola sederhana: tahun-dokumen-nama. Contohnya 2011-akta-nikah-rani-budi. Hindari nama seperti scan_0031, karena tidak ada yang bisa mencarinya sepuluh tahun kemudian.</p>",
      "<h2>Simpan dua salinan</h2>",
      "<p>Satu salinan di komputer, satu lagi di penyimpanan daring atau hard disk terpisah. Dua salinan dengan dua cara akses berbeda lebih baik daripada satu salinan di dua folder.</p>",
      "<h2>Foto sudah cukup</h2>",
      "<p>Tidak semua orang punya scanner. Foto dengan pencahayaan cukup, diambil dari atas tanpa flash, sudah cukup baik untuk arsip keluarga.</p>",
      FIG(
        "/images/seed/blog-1.jpg",
        "Sekelompok orang membaca bersama",
        "Membaca Bersama, oleh Moh. Ali Zaenal (CC BY-SA 4.0)",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-blog-2",
    slug: "mengapa-arsip-digital-perlu-dijaga",
    title: "Mengapa Arsip Digital Perlu Dijaga",
    type: "blog",
    excerpt:
      "Arsip adalah ingatan kolektif. Tanpa salinan yang aman, ingatan itu bisa hilang dalam satu generasi tanpa jejak.",
    coverUrl: "/images/seed/blog-2.jpg",
    publishedAt: "2026-06-18",
    order: 1,
    body: [
      "<p>Arsip adalah ingatan kolektif sebuah bangsa. Tanpa arsip yang aman, ingatan itu bisa hilang dalam satu generasi tanpa jejak.</p>",
      "<h2>Arsip dan akuntabilitas</h2>",
      "<p>Dokumen yang tersimpan rapi bukan kebetulan. Ia adalah bahan bakar pengujian: apakah sebuah keputusan sah, apakah anggaran wajar, apakah janji ditepati. Ketika arsip hilang, yang tersisa ruang kosong.</p>",
      "<h2>Perpustakaan sebagai simpul</h2>",
      "<p>Perpustakaan Nasional Republik Indonesia berdiri sebagai simpul pengumpulan dan pelestarian karya. Gudang digital adalah kelanjutannya: akses yang lebih luas, tanpa harus datang ke tempatnya.</p>",
      "<h2>Tiga hal yang wajib dijaga</h2>",
      "<ul>",
      "<li><strong>Formatnya harus bisa dibuka.</strong> PDF dan teks biasa lebih aman daripada format khusus satu aplikasi.</li>",
      "<li><strong>Metadata harusnya jelas.</strong> Tanggal, sumber, dan keterangan.</li>",
      "<li><strong>Salinannya harus lebih dari satu.</strong> Tidak ada arsip digital yang aman hanya di satu perangkat.</li>",
      "</ul>",
      FIG(
        "/images/seed/blog-2.jpg",
        "Gedung Perpustakaan Nasional Republik Indonesia",
        "Perpustakaan Nasional Republik Indonesia, oleh Arini Kurniawati (CC BY-SA 4.0)",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-blog-3",
    slug: "menulis-ebook-untuk-anak",
    title: "Menulis E-Book untuk Anak: Bukan Sekadar Menggambar dan Menulis",
    type: "blog",
    excerpt:
      "E-book anak yang berhasil punya alur, suara tokoh, dan satu tujuan yang jelas. Ini tiga hal yang paling sering terlewat.",
    coverUrl: "/images/seed/blog-3.jpg",
    publishedAt: "2026-06-04",
    order: 2,
    body: [
      "<p>Banyak e-book anak yang gagal bukan karena gambarnya jelek, tapi karena tidak ada alur. Dua puluh halaman yang diberi tahu, lalu tamat.</p>",
      "<h2>1. Alur lebih dulu</h2>",
      "<p>Tulis dalam satu kalimat apa yang terjadi pada akhir cerita. Kalau kalimat itu belum bisa dibuat, ceritanya belum siap digambar. Gagasan yang satu kalimat itu yang menentukan semua halaman berikutnya.</p>",
      "<h2>2. Suara tokoh</h2>",
      "<p>Anak-anak membaca dengan telinga. Kalimat yang pendek dan berirama lebih mudah diingat. Ulangi pola kalimat untuk tokoh yang sama, persis seperti lagu yang harus bisa anak hafal tanpa disuruh.</p>",
      "<h2>3. Satu tujuan</h2>",
      "<p>Buku anak yang baik menyisakan satu hal yang bisa dibawa pulang: satu fakta baru, satu kebiasaan baru, atau satu pertanyaan baru. Kalau semuanya dicampur, hasilnya tidak ada yang menempel.</p>",
      FIG(
        "/images/seed/blog-3.jpg",
        "Anak-anak sedang belajar",
        "Anak-anak sedang belajar, oleh 3mdedede (CC BY-SA 4.0)",
      ),
    ].join("\n"),
  },

  /* ------------------------------ UMKM ------------------------------ */
  {
    id: "seed-art-umkm-1",
    slug: "umkm-naik-kelas-lewat-arsip-dan-konten",
    title: "UMKM Naik Kelas Lewat Arsip dan Konten yang Terukur",
    type: "umkm",
    excerpt:
      "Cara pelaku usaha kecil berkembang: mendokumentasikan produk, cerita, dan pelanggannya dengan rapi.",
    coverUrl: "/images/seed/umkm-1.jpg",
    publishedAt: "2026-05-20",
    order: 0,
    body: [
      "<p>Banyak pelaku usaha kecil di pasar sudah punya produk yang layak, tapi belum punya cerita yang bisa dikirim ke mana pun. Arsip sederhana dan konten yang konsisten menutup jarak itu.</p>",
      "<h2>1. Foto produk yang konsisten</h2>",
      "<p>Satu sudut foto, satu cahaya, satu latar. Konsistensi membuat merekmu sendiri jadi tanda pengenal sebelum nama brand-nya dibaca. Ambil foto produk dan prosesnya, bukan hanya produknya.</p>",
      "<h2>2. Arsip harga dan bahan</h2>",
      "<p>Catat harga bahan, tanggal, dan alasan harga berubah. Catatan sederhana ini invaluable ketika ditanya soal alasan harga yang sulit dijelaskan.</p>",
      "<h2>3. Testimoni sebagai arsip</h2>",
      "<p>Simpan foto atau tangkapan layar dari pelanggan yang puas. Tiga kalimat dari pelanggan asli jauh lebih kuat daripada sepuluh kalimat yang kamu tulis sendiri tentang produkmu.</p>",
      "<h2>4. Mulai dari kanal yang bisa dijaga</h2>",
      "<p>Pilih satu kanal dan jaga rutinnya, daripada lima kanal yang ditinggalkan setelah dua minggu. Konsistensi kecil yang bertahan jauh lebih berharga daripada posting besar sesaat.</p>",
      FIG(
        "/images/seed/umkm-1.jpg",
        "Pedagang buah di pasar Indonesia",
        "Pedagang Buah di Pasar Tumenggungan, oleh SATELIT BM (CC BY-SA 4.0)",
      ),
    ].join("\n"),
  },
  {
    id: "seed-art-umkm-2",
    slug: "produk-kriya-indonesia-ke-pasar-digital",
    title: "Produk Tenun dan Kerajinan Indonesia di Pasar Digital",
    type: "umkm",
    excerpt:
      "Kriya tangan punya cerita yang tidak bisa ditiru mesin. Cerita itulah yang membuat produknya dicari dari jauh.",
    coverUrl: "/images/seed/umkm-2.jpg",
    publishedAt: "2026-05-06",
    order: 1,
    body: [
      "<p>Produk kerajinan tangan punya satu keunggulan yang tidak bisa ditiru mesin: cerita. Siapa yang membuatnya, dari bahan apa, motif apa yang dipakai, dan untuk acara apa.</p>",
      "<h2>Cerita adalah bagian dari produk</h2>",
      "<p>Ketika pembeli sudah membeli, membuat, dan memakai motif yang sama, motif itu menjadi tanda tangan daerah. Di pasar digital, cerita itulah yang membuat pembeli memilih produk lokal, bukan tiruan yang lebih murah.</p>",
      "<h2>Foto yang menjelaskan proses</h2>",
      "<p>Foto proses handmade jauh lebih menarik daripada foto produk jadi yang sama seperti pesaingmu. Tangan yang sedang menenun, contohnya alat yang sudah berdebu, dan detail kecil membuat orang berhenti menggulir halaman.</p>",
      "<h2>Kisah yang bisa ditelusuri</h2>",
      "<p>Arsipkan asal bahan dan nama perajin. Pembeli yang menelusuri asal barang lebih sulit pergi, dan lebih mudah merekomendasikan produkmu kepada orang lain.</p>",
      FIG(
        "/images/seed/umkm-2.jpg",
        "Perajin kain songket",
        "Perajin Kain Songket, oleh Nasywaaf (CC0)",
      ),
    ].join("\n"),
  },
];
