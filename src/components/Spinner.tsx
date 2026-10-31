import { Loader2 } from "lucide-react";

/**
 * Spinner berputar sederhana (ikon lucide + animate-spin).
 * Dipakai di tombol maupun di dalam PageLoader.
 */
export default function Spinner({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Loader2
      size={size}
      className={`animate-spin ${className}`}
      aria-hidden
    />
  );
}
