"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";

const FIELDS = [
  { id: "email", label: "Email", type: "email", placeholder: "tu@email.com" },
  { id: "name", label: "Nombre y apellido", type: "text", placeholder: "" },
  { id: "address", label: "Dirección", type: "text", placeholder: "" },
  { id: "city", label: "Ciudad", type: "text", placeholder: "" },
];

export default function CheckoutPage() {
  const { items, subtotal, mounted } = useCart();

  if (!mounted) return <div className="min-h-[50vh]" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-heading text-3xl text-green">No hay nada para pagar</h1>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-green px-8 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy"
        >
          Ver la colección
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <h1 className="font-heading text-4xl font-medium text-green">Checkout</h1>

      <div className="mt-4 rounded-xl border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm text-burgundy">
        Vista previa: el pago todavía no está activo. Se habilita pronto con MercadoPago.
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <h2 className="font-heading text-xl text-green">Tus datos</h2>
          {FIELDS.map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="text-xs uppercase tracking-wider text-green-mid">
                {f.label}
              </label>
              <input
                id={f.id}
                type={f.type}
                placeholder={f.placeholder}
                disabled
                className="mt-1.5 w-full rounded-lg border border-beige bg-cream/60 px-4 py-2.5 text-sm outline-none"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled
            className="w-full rounded-full bg-green px-8 py-4 text-sm font-semibold uppercase tracking-wider text-cream opacity-50"
          >
            Pagar con MercadoPago
          </button>
        </form>

        <div className="rounded-2xl border border-beige bg-paper p-6">
          <h2 className="font-heading text-xl text-green">Tu pedido</h2>
          <div className="mt-4 divide-y divide-beige">
            {items.map((line) => (
              <div key={line.key} className="flex justify-between gap-3 py-3 text-sm">
                <span className="text-ink/80">
                  {line.quantity}× {line.name}
                  <span className="block text-xs text-ink/50">
                    {line.size} · {line.color}
                  </span>
                </span>
                <span className="font-medium text-green">
                  {formatPrice(line.unitPrice * line.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-beige pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/70">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/70">Envío</span>
              <span className="text-ink/50">A calcular</span>
            </div>
            <div className="flex justify-between pt-2 font-medium text-green">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
