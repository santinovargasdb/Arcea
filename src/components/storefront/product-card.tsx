import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductListItem } from "@/lib/db/queries";

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-beige-soft">
        {product.badge && (
          <span
            className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider ${
              product.badge === "Oferta"
                ? "bg-burgundy text-cream"
                : "bg-cream text-green"
            }`}
          >
            {product.badge}
          </span>
        )}
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg leading-tight text-ink">{product.name}</h3>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-green-mid">
            {product.categoryName}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <span className="font-medium text-green">{formatPrice(product.basePrice)}</span>
          {product.compareAtPrice && (
            <span className="block text-xs text-ink/50 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>

      {product.colors.length > 0 && (
        <div className="mt-2 flex gap-1.5">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="h-3.5 w-3.5 rounded-full border border-black/10"
              style={{ background: c.hex }}
            />
          ))}
        </div>
      )}
    </Link>
  );
}
