import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Arcea Estudio: ropa de invierno y casualwear en tejidos naturales, hecha desde la calma en Argentina.",
};

const STATS = [
  { b: "8", s: "Años tejiendo" },
  { b: "100%", s: "Materiales nobles" },
  { b: "AR", s: "Hecho en Argentina" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-beige-soft">
          <Image
            src="https://picsum.photos/seed/arcea-about/800/1000"
            alt="Taller Arcea Estudio"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-green-mid">
            Sobre nosotros
          </span>
          <h1 className="mt-3 font-heading text-4xl font-medium text-green sm:text-5xl">
            Nacimos para vestir <em className="text-burgundy">sin ruido.</em>
          </h1>
          <p className="mt-6 leading-relaxed text-ink/80">
            Arcea Estudio es una marca de ropa pensada desde la calma. Diseñamos prendas de
            invierno y casualwear que duran, hechas con tejidos naturales y procesos conscientes.
          </p>
          <p className="mt-4 leading-relaxed text-ink/80">
            Creemos en el guardarropa esencial: pocas prendas, bien hechas, que se sienten tan bien
            como se ven. Menos tendencias pasajeras, más piezas que se vuelven parte de tu rutina.
          </p>
          <blockquote className="mt-6 border-l-2 border-burgundy pl-4 font-heading text-xl italic text-green">
            “Diseñamos para quienes prefieren la presencia al estridente.”
          </blockquote>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-beige pt-6">
            {STATS.map((st) => (
              <div key={st.s}>
                <p className="font-heading text-3xl text-green">{st.b}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-green-mid">{st.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
