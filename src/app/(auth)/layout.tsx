import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12 text-ink">
      <Link href="/" className="mb-8 font-heading text-3xl font-semibold text-green">
        Arcea
        <span className="ml-1 align-middle text-[0.55rem] uppercase tracking-[0.4em] text-green-mid">
          Estudio
        </span>
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-beige bg-paper p-6 sm:p-8">
        {children}
      </div>
      <p className="mt-8 text-xs uppercase tracking-[0.3em] text-green-mid">
        @arcea.estudio
      </p>
    </main>
  );
}
