"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/lib/cart/types";

export function CartLineRow({ line }: { line: CartLine }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="flex gap-3 py-4">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-beige-soft">
        {line.image && (
          <Image
            src={line.image}
            alt={line.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-heading text-sm text-ink">{line.name}</p>
            <p className="mt-0.5 text-xs text-ink/60">
              {line.size} · {line.color}
            </p>
          </div>
          <button
            type="button"
            aria-label="Eliminar"
            onClick={() => removeItem(line.key)}
            className="text-ink/40 transition-colors hover:text-burgundy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Restar"
              onClick={() => updateQty(line.key, line.quantity - 1)}
              className="grid h-7 w-7 place-items-center rounded-full border border-beige transition-colors hover:border-green"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-sm">{line.quantity}</span>
            <button
              type="button"
              aria-label="Sumar"
              onClick={() => updateQty(line.key, line.quantity + 1)}
              className="grid h-7 w-7 place-items-center rounded-full border border-beige transition-colors hover:border-green"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="text-sm font-medium text-green">
            {formatPrice(line.unitPrice * line.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
