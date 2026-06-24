import Link from "next/link";

const COLS = [
  {
    title: "Tienda",
    links: [
      { label: "Sweaters", href: "/products?category=sweaters" },
      { label: "Abrigos", href: "/products?category=abrigos" },
      { label: "Tejidos", href: "/products?category=tejidos" },
      { label: "Casual", href: "/products?category=casual" },
      { label: "Toda la colección", href: "/products" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Envíos y entregas", href: "#" },
      { label: "Cambios y devoluciones", href: "#" },
      { label: "Guía de talles", href: "#" },
      { label: "Medios de pago", href: "#" },
    ],
  },
  {
    title: "Estudio",
    links: [
      { label: "Sobre nosotros", href: "/about" },
      { label: "Contacto", href: "/contacto" },
      { label: "Lookbook", href: "#" },
      { label: "Sostenibilidad", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink px-5 pb-8 pt-16 text-cream/80 sm:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="grid grid-cols-2 gap-8 border-b border-cream/10 pb-12 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <p className="font-heading text-2xl text-cream">
              Arcea
              <span className="ml-1 text-[0.55rem] uppercase tracking-[0.4em] text-green-light">
                Estudio
              </span>
            </p>
            <p className="mt-4 font-heading text-xl italic text-cream">
              Menos ruido,
              <br />
              más presencia.
            </p>
            <p className="mt-4 text-sm text-green-light">@arcea.estudio</p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs uppercase tracking-[0.16em] text-green-light">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm transition-colors hover:text-cream">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-sm text-cream/50 sm:flex-row">
          <span>© 2026 Arcea Estudio · Hecho con calma en Argentina.</span>
          <div className="flex gap-2">
            {["MercadoPago", "Visa", "Master"].map((p) => (
              <span
                key={p}
                className="rounded border border-cream/15 bg-cream/5 px-2 py-1 text-[0.65rem] font-semibold tracking-wide"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
