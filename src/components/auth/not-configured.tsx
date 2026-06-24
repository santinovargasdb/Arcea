import Link from "next/link";

export function AuthNotConfigured() {
  return (
    <div className="space-y-3 text-center">
      <h1 className="font-heading text-2xl text-green">Cuentas en camino</h1>
      <p className="text-sm text-ink/70">
        El registro y el ingreso se habilitan cuando conectemos la base de datos.
      </p>
      <Link
        href="/products"
        className="inline-block text-xs uppercase tracking-wider text-green-mid hover:text-burgundy"
      >
        Ver la colección
      </Link>
    </div>
  );
}
