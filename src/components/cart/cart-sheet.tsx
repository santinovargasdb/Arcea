"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { CartLineRow } from "./cart-line-row";

export function CartSheet() {
  const { items, isOpen, closeCart, subtotal, totalItems, mounted } = useCart();
  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-cream shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-beige px-5 py-4">
          <h2 className="font-heading text-lg text-green">
            Tu carrito{totalItems > 0 ? ` (${totalItems})` : ""}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={closeCart}
            className="text-ink/60 transition-colors hover:text-burgundy"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-heading text-xl text-green">Tu carrito está vacío</p>
            <Link
              href="/products"
              onClick={closeCart}
              className="text-xs uppercase tracking-wider text-green-mid hover:text-burgundy"
            >
              Ver la colección
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-beige overflow-y-auto px-5">
              {items.map((line) => (
                <CartLineRow key={line.key} line={line} />
              ))}
            </div>
            <footer className="border-t border-beige px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/70">Subtotal</span>
                <span className="font-medium text-green">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink/50">
                Envío e impuestos se calculan en el checkout.
              </p>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full rounded-full bg-green px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy"
                >
                  Finalizar compra
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full rounded-full border border-beige px-6 py-3 text-center text-sm font-medium text-ink transition-colors hover:border-green"
                >
                  Ver carrito
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
