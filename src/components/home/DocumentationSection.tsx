import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

const checklist = [
  "Viral For Justice",
  "Indonesia Bebas Korupsi",
  "Sejahterakan Rakyat Indonesia",
  "Bersatu Kita Bisa",
];

export default function DocumentationSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
        <div className="relative h-[420px] w-full overflow-hidden rounded-2xl">
          <Image
            src="/images/doc-demo-photo.jpg"
            alt="Demo RUU Perampasan Aset"
            fill
            className="object-cover"
          />
        </div>

        <div>
          <p className="text-sm font-medium text-maroon">
            Dokumentasi &amp; Arsip Digital
          </p>
          <h2 className="font-heading mt-2 text-2xl font-bold text-black md:text-3xl">
            Demo RUU Perampasan Aset Demi Indonesia Maju
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            <span className="font-semibold text-black">
              Rieke Diah Pitaloka,
            </span>{" "}
            Turun langsung kedepan gedung DPR/MPR RI Untuk Menemui para
            Demonstrasi. Jakarta, 27 Agustus 2026
          </p>
          <ul className="mt-6 space-y-4">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckCircle2
                  size={20}
                  className="shrink-0 fill-maroon-dark text-white"
                />
                <span className="text-sm font-medium text-black">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
