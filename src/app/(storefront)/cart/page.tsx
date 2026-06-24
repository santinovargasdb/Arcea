"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { CartLineRow } from "@/components/cart/cart-line-row";

export default function CartPage() {
  const { items, subtotal, mounted } = useCart();

  if (!mounted) return <div className="min-h-[50vh]" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-heading text-3xl text-green">Tu carrito está vacío</h1>
        <p className="mt-2 text-ink/60">Todavía no agregaste prendas.</p>
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
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="font-heading text-4xl font-medium text-green">Tu carrito</h1>
      <div className="mt-8 divide-y divide-beige border-y border-beige">
        {items.map((line) => (
          <CartLineRow key={line.key} line={line} />
        ))}
      </div>
      <div className="mt-6 flex flex-col items-end gap-3">
        <div className="flex w-full max-w-xs items-center justify-between">
          <span className="text-ink/70">Subtotal</span>
          <span className="text-lg font-medium text-green">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-ink/50">Envío e impuestos se calculan en el checkout.</p>
        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href="/products"
            className="rounded-full border border-beige px-6 py-3 text-sm font-medium transition-colors hover:border-green"
          >
            Seguir comprando
          </Link>
          <Link
            href="/checkout"
            className="rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy"
          >
            Ir a checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
