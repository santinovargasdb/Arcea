"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart/cart-context";
import type { Color } from "@/lib/db/catalog-types";

type Props = {
  slug: string;
  name: string;
  image: string;
  basePrice: number;
  sizes: string[];
  colors: Color[];
};

export function AddToCart({ slug, name, image, basePrice, sizes, colors }: Props) {
  const { addItem, openCart } = useCart();
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [color, setColor] = useState<string | null>(
    colors.length <= 1 ? colors[0]?.name ?? "Único" : null,
  );

  const needsSize = sizes.length > 0;
  const canAdd = (!needsSize || !!size) && (colors.length <= 1 || !!color);

  function handleAdd() {
    if (needsSize && !size) {
      toast.error("Elegí un talle.");
      return;
    }
    addItem({
      slug,
      name,
      image,
      size: size ?? "Único",
      color: color ?? "Único",
      unitPrice: basePrice,
    });
    openCart();
    toast.success("Agregado al carrito");
  }

  return (
    <div className="space-y-5">
      {sizes.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-green-mid">Talle</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`grid h-10 min-w-10 place-items-center rounded-md border px-3 text-sm font-medium transition-colors ${
                  size === s
                    ? "border-green bg-green text-cream"
                    : "border-beige text-ink hover:border-green"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-green-mid">
            Color{color ? `: ${color}` : ""}
          </p>
          <div className="mt-2 flex gap-2">
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => setColor(c.name)}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c.name ? "border-green" : "border-black/10"
                }`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="w-full rounded-full bg-green px-8 py-4 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Agregar al carrito
        </button>
        {needsSize && !size && (
          <p className="mt-2 text-xs text-ink/50">Elegí un talle para continuar.</p>
        )}
      </div>
    </div>
  );
}
