import { ProductCard } from "./product-card";
import type { ProductListItem } from "@/lib/db/queries";

export function ProductGrid({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-heading text-2xl text-green">No encontramos prendas</p>
        <p className="mt-2 text-ink/60">Probá quitar algún filtro o buscar otra cosa.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
