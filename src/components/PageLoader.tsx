import Spinner from "@/components/Spinner";

/**
 * Indikator loading di tengah layar — pengganti teks "Memuat…".
 * Dipakai sebagai fallback <Suspense> di area admin & pembeli, dan di
 * halaman yang menunggu data dinamis.
 */
export default function PageLoader({
  label = "Memuat…",
  minHeight = "40vh",
}: {
  label?: string;
  minHeight?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex w-full items-center justify-center"
      style={{ minHeight }}
    >
      <div className="flex flex-col items-center gap-3 text-maroon">
        <Spinner size={32} />
        <span className="text-sm text-neutral-500">{label}</span>
      </div>
    </div>
  );
}
