import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Star, BookOpen, Download } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canAccessBook } from "@/lib/library";
import { getSettings } from "@/lib/site-settings";
import { getMidtransConfig, isMidtransConfigured } from "@/lib/midtrans";
import BuyButton from "@/components/books/BuyButton";

export const metadata = {
  title: "Detail Buku — Arsip Pitaloka",
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "-";
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-500">Memuat…</p>}>
      <BookDetailContent params={params} />
    </Suspense>
  );
}

async function BookDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();

  const { slug } = await params;

  const book = await prisma.book.findUnique({
    where: { slug },
    include: { category: true, tab: true },
  });
  if (!book) notFound();

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const sudahPunya = userId ? await canAccessBook(userId, book.id) : false;
  const settings = await getSettings();
  const midtrans = await getMidtransConfig();
  const midtransAktif = midtrans.enabled && isMidtransConfigured(midtrans);
  const midtransMode = midtrans.mode;

  const meta: { label: string; value: string }[] = [
    { label: "Bahasa", value: book.language },
    { label: "Halaman", value: String(book.pages) },
    { label: "Jumlah kata", value: book.wordCount ? String(book.wordCount) : "-" },
    { label: "Format file", value: book.fileFormat ?? "-" },
    { label: "Ukuran file", value: formatBytes(book.fileSize) },
    { label: "Penerbit", value: book.publisher ?? "-" },
    { label: "Tahun terbit", value: book.publishedYear ? String(book.publishedYear) : "-" },
    { label: "Edisi", value: book.edition ?? "-" },
    { label: "ISBN", value: book.isbn ?? "-" },
    { label: "Penerjemah", value: book.translator ?? "-" },
    { label: "Editor", value: book.editor ?? "-" },
    { label: "Ilustrator", value: book.illustrator ?? "-" },
    { label: "Pemegang hak cipta", value: book.copyrightHolder ?? "-" },
    { label: "Tab", value: book.tab.label },
    { label: "Kategori", value: book.category?.name ?? "-" },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-10 md:px-10">
      <nav className="text-xs text-neutral-500">
        <Link href="/buku" className="hover:underline">
          Katalog
        </Link>
        {" · "}
        <Link href={`/buku?tab=${book.tab.slug}`} className="hover:underline">
          {book.tab.label}
        </Link>
        {book.category ? (
          <>
            {" · "}
            <Link
              href={`/buku?kategori=${book.category.slug}`}
              className="hover:underline"
            >
              {book.category.name}
            </Link>
          </>
        ) : null}
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-[320px_1fr]">
        <div>
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#3d2b2e]">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover"
              />
            ) : null}
          </div>
        </div>

        <div>
          <h1 className="font-heading text-3xl font-bold text-black">
            {book.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">by {book.author}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 font-medium text-black">
              {String(book.rating)}{" "}
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
            </span>
            {book.isFree ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                Gratis
              </span>
            ) : (
              <span className="font-semibold text-black">
                ${String(book.priceUsd)}{" "}
                <span className="font-normal text-neutral-500">/lifetime</span>
              </span>
            )}
            {book.isNew ? (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                Baru
              </span>
            ) : null}
          </div>

          {book.description ? (
            <p className="mt-5 text-sm leading-relaxed text-neutral-700">
              {book.description}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {sudahPunya && book.fileUrl ? (
              <>
                <a
                  href={`/api/read/${book.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white"
                >
                  <BookOpen size={16} /> Baca
                </a>
                {book.isDownloadable || book.isFree ? (
                  <a
                    href={`/api/download/${book.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-700"
                  >
                    <Download size={16} /> Unduh
                  </a>
                ) : null}
                <Link
                  href="/akun"
                  className="text-sm font-medium text-maroon hover:underline"
                >
                  Lihat di Pustaka Saya →
                </Link>
              </>
            ) : userId ? (
              midtransAktif ? (
                <div className="space-y-2">
                  <BuyButton
                    bookId={book.id}
                    loginUrl={`/login?callbackUrl=/buku/${book.slug}`}
                    label={book.isFree ? "Ambil Gratis" : "Beli Sekarang"}
                  />
                  <p className="text-xs text-neutral-500">
                    Pembayaran aman lewat Midtrans{" "}
                    {midtransMode === "sandbox" ? "(mode sandbox — uji coba)" : ""}.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p className="font-medium">Buku ini belum ada di pustaka Anda.</p>
                  <p className="mt-1 text-xs">
                    Checkout sedang disiapkan. Untuk sekarang hubungi kami di{" "}
                    {settings["company.email"] || "halo@arsippitaloka.com"}.
                  </p>
                </div>
              )
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/login?callbackUrl=/buku/${book.slug}`}
                  className="rounded-full bg-maroon-dark px-5 py-2 text-sm font-medium text-white"
                >
                  Beli Sekarang
                </Link>
                <span className="text-xs text-neutral-500">
                  Masuk dulu untuk membeli — setelah login Anda diarahkan ke
                  pustaka.
                </span>
              </div>
            )}
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-neutral-200 pt-6 text-sm sm:grid-cols-3">
            {meta.map((item) => (
              <div key={item.label}>
                <dt className="text-xs text-neutral-400">{item.label}</dt>
                <dd className="mt-0.5 text-neutral-800">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
