import type { Metadata } from "next";
import {
  getProducts,
  getCategories,
  getCatalogFacets,
  type SortOption,
} from "@/lib/db/queries";
import { CatalogControls } from "@/components/storefront/catalog-controls";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Pagination } from "@/components/storefront/pagination";

export const metadata: Metadata = {
  title: "Colección",
  description: "Sweaters, abrigos y casualwear en tejidos naturales.",
};

type SearchParams = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const query = {
    category: one(sp.category),
    size: one(sp.size),
    color: one(sp.color),
    search: one(sp.search),
    sort: one(sp.sort) as SortOption | undefined,
    page: sp.page ? Number(one(sp.page)) : 1,
  };

  const [result, categories, facets] = await Promise.all([
    getProducts(query),
    getCategories(),
    getCatalogFacets(),
  ]);

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-green-mid">
          La colección
        </span>
        <h1 className="mt-3 font-heading text-4xl font-medium text-green sm:text-5xl">
          Invierno 2026
        </h1>
        <p className="mt-3 text-ink/60">
          {result.total} {result.total === 1 ? "prenda" : "prendas"} · tejidos naturales,
          hechos con calma.
        </p>
      </header>

      <CatalogControls categories={categories} facets={facets} />

      <div className="mt-10">
        <ProductGrid products={result.items} />
      </div>

      <Pagination page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
