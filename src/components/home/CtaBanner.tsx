import Image from "next/image";

export default function CtaBanner() {
  return (
    <section className="relative w-full">
      <Image
        src="/images/cta-full.jpg"
        alt="Rieke Diah Pitaloka"
        width={4000}
        height={1407}
        sizes="100vw"
        className="h-auto w-full"
      />
      <div className="absolute inset-0">
        <a
          href="#"
          aria-label="Biografi"
          className="absolute block"
          style={{ left: "44%", top: "63%", width: "12%", height: "14%" }}
        />
      </div>
    </section>
  );
}
