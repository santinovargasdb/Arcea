import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts, getCategories, type SortOption } from "@/lib/db/queries";
import { ProductGrid } from "@/components/storefront/product-grid";
import { Pagination } from "@/components/storefront/pagination";

type SearchParams = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  return { title: cat ? cat.name : "Categoría" };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const result = await getProducts({
    category: slug,
    sort: one(sp.sort) as SortOption | undefined,
    page: sp.page ? Number(one(sp.page)) : 1,
  });

  return (
    <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-10">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-green-mid">
          Categoría
        </span>
        <h1 className="mt-3 font-heading text-4xl font-medium text-green sm:text-5xl">
          {category.name}
        </h1>
        <p className="mt-3 text-ink/60">
          {result.total} {result.total === 1 ? "prenda" : "prendas"} ·{" "}
          <Link href="/products" className="underline underline-offset-4 hover:text-green">
            ver toda la colección con filtros
          </Link>
        </p>
      </header>

      <ProductGrid products={result.items} />
      <Pagination page={result.page} pageCount={result.pageCount} />
    </div>
  );
}
