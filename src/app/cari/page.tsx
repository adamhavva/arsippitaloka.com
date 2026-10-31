import { Suspense } from "react";
import CariContent from "./cari-content";
import Footer from "@/components/home/Footer";

/**
 * `/cari?q=<kata kunci>` — hasil pencarian global.
 *
 * Halaman ini membaca `searchParams`, jadi TIDAK bisa memakai `"use cache"`.
 * Pola repo: komponen default (synchronous) membungkus isi dinamis dengan
 * `<Suspense>`, lalu komponen async di dalamnya memanggil `await connection()`.
 */
export default function CariPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
      <main className="flex min-h-screen flex-col">
        <Suspense fallback={<CariSkeleton />}>
          <CariContent searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

/** Placeholder selagi data diambil ( Suspense fallback ). */
function CariSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 lg:py-12">
      <div className="h-7 w-40 animate-pulse rounded bg-neutral-100 sm:h-8 sm:w-48" />
      <div className="mt-5 h-11 w-full animate-pulse rounded-full bg-neutral-100 sm:h-14" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-xl bg-neutral-100 sm:h-72"
          />
        ))}
      </div>
    </div>
  );
}
