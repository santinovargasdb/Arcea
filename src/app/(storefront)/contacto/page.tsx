import type { Metadata } from "next";
import { Mail, MessageCircle, AtSign, MapPin } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos por email o WhatsApp, seguinos en Instagram o visitanos en el showroom de Palermo.",
};

const CHANNELS = [
  { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: MessageCircle, label: "WhatsApp", value: SITE.whatsapp, href: SITE.whatsappUrl },
  { icon: AtSign, label: "Instagram", value: SITE.instagram, href: SITE.instagramUrl },
];

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16">
      <header className="max-w-xl">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-green-mid">
          Contacto
        </span>
        <h1 className="mt-3 font-heading text-4xl font-medium text-green sm:text-5xl">Hablemos</h1>
        <p className="mt-4 text-ink/70">
          ¿Dudas con un talle, un pedido o querés visitarnos? Escribinos y te respondemos a la
          brevedad.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
        {CHANNELS.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-beige bg-paper p-5 transition-colors hover:border-green"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-green/10 text-green">
              <c.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-green-mid">{c.label}</p>
              <p className="text-sm font-medium text-ink">{c.value}</p>
            </div>
          </a>
        ))}
        <div className="flex items-center gap-4 rounded-2xl border border-beige bg-paper p-5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-green/10 text-green">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wider text-green-mid">Showroom</p>
            <p className="text-sm font-medium text-ink">{SITE.showroom}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
