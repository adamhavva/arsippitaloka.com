import Image from "next/image";
import Link from "next/link";

const navZones = [
  { label: "Home", href: "/", left: "36%", width: "4.5%" },
  { label: "Books", href: "#", left: "41.5%", width: "4.5%" },
  { label: "About", href: "#", left: "47%", width: "4.5%" },
  { label: "News & Views", href: "#", left: "52%", width: "8%" },
  { label: "Sign In", href: "/login", left: "79%", width: "5.5%" },
  { label: "Join Us", href: "/register", left: "85%", width: "5.5%" },
];

export default function Hero() {
  return (
    <section className="relative w-full">
      <Image
        src="/images/hero-full.jpg"
        alt="Pitaloka — Get Access to Hundred Books Available"
        width={4000}
        height={2836}
        priority
        sizes="100vw"
        className="h-auto w-full"
      />
      {/* Overlay interaktif transparan di atas desain PDF */}
      <div className="absolute inset-0">
        {navZones.map((z) => (
          <Link
            key={z.label}
            href={z.href}
            aria-label={z.label}
            className="absolute block"
            style={{ top: "4%", left: z.left, width: z.width, height: "4%" }}
          />
        ))}
        <form
          className="absolute"
          style={{ left: "30.5%", top: "72.5%", width: "31.5%", height: "6.5%" }}
        >
          <input
            type="text"
            aria-label="Cari buku"
            className="h-full w-full rounded-full bg-transparent px-6 text-sm text-black outline-none"
          />
        </form>
        <a
          href="#"
          aria-label="Search"
          className="absolute block"
          style={{ left: "62.5%", top: "72.5%", width: "6.5%", height: "6.5%" }}
        />
      </div>
    </section>
  );
}
