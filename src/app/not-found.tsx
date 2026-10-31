import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/home/Footer";
import NavAuthChip from "@/components/layout/NavAuthChip";

const navZones = [
  { label: "Home", href: "/", left: "36%", width: "4.5%" },
  { label: "Books", href: "/", left: "41.5%", width: "4.5%" },
  { label: "About", href: "/", left: "47%", width: "4.5%" },
  { label: "News & Views", href: "/", left: "52%", width: "8%" },
  { label: "Sign In", href: "/login", left: "79%", width: "5.5%" },
  { label: "Join Us", href: "/register", left: "85%", width: "5.5%" },
];

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative w-full">
        <Image
          src="/images/404-hero.jpg"
          alt="Oops! We can't find the page you're looking for."
          width={4000}
          height={2841}
          priority
          sizes="100vw"
          className="h-auto w-full"
        />
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
          <NavAuthChip style={{ top: "4%", right: "9.5%", height: "4%" }} />
          <Link
            href="/"
            aria-label="Go to home page"
            className="absolute block"
            style={{
              left: "35.9%",
              top: "73.6%",
              width: "28.6%",
              height: "7.8%",
            }}
          />
        </div>
      </section>
      <Footer />
    </div>
  );
}
