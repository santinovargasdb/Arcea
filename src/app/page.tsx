import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F4EEE3] px-6 text-center text-[#23231D]">
      <span className="mb-8 inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-[#46553C]">
        <span className="h-px w-8 bg-[#46553C]/50" />
        Invierno 2026 · En construcción
      </span>

      <h1 className="font-heading text-6xl font-medium leading-none text-[#2C382A] sm:text-8xl">
        Arcea Estudio
      </h1>

      <p className="mt-6 font-heading text-2xl italic text-[#6E292E] sm:text-3xl">
        Menos ruido, más presencia.
      </p>

      <p className="mt-8 max-w-md text-balance text-[#383834]">
        Estamos tejiendo nuestra nueva tienda online. Sweaters, abrigos y
        casualwear en tejidos naturales — muy pronto.
      </p>

      <Link
        href="/products"
        className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#2C382A] px-8 py-4 text-sm font-semibold uppercase tracking-wider text-[#F4EEE3] transition-colors hover:bg-[#6E292E]"
      >
        Ver colección →
      </Link>

      <div className="mt-12 flex items-center gap-3 text-sm font-medium text-[#46553C]">
        <span className="h-px w-8 bg-[#46553C]/50" />
        @arcea.estudio
        <span className="h-px w-8 bg-[#46553C]/50" />
      </div>
    </main>
  );
}
