"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { SORT_OPTIONS, type Category, type Facets } from "@/lib/db/catalog-types";

export function CatalogControls({
  categories,
  facets,
  basePath = "/products",
}: {
  categories: Category[];
  facets: Facets;
  basePath?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");

  function push(mutate: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(params.toString());
    mutate(p);
    p.delete("page"); // cualquier cambio de filtro vuelve a la página 1
    const qs = p.toString();
    const target = pathname.startsWith("/categories") ? pathname : basePath;
    router.push(qs ? `${target}?${qs}` : target);
  }

  const setOrToggle = (key: string, value: string) =>
    push((p) => (p.get(key) === value ? p.delete(key) : p.set(key, value)));

  const current = (key: string) => params.get(key);

  const chipBase =
    "rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-wider transition-colors";

  return (
    <div className="space-y-5">
      {/* Categorías + búsqueda/orden */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => push((p) => p.delete("category"))}
            className={`${chipBase} ${
              !current("category")
                ? "border-green bg-green text-cream"
                : "border-beige text-ink hover:border-green hover:text-green"
            }`}
          >
            Todo
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setOrToggle("category", c.slug)}
              className={`${chipBase} ${
                current("category") === c.slug
                  ? "border-green bg-green text-cream"
                  : "border-beige text-ink hover:border-green hover:text-green"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              push((p) => (search.trim() ? p.set("search", search.trim()) : p.delete("search")));
            }}
            className="flex items-center gap-2 rounded-full border border-beige px-4 py-1.5"
          >
            <Search className="h-4 w-4 text-green-mid" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="w-32 bg-transparent text-sm outline-none placeholder:text-ink/40 sm:w-40"
            />
          </form>

          <select
            value={current("sort") ?? "destacados"}
            onChange={(e) => push((p) => p.set("sort", e.target.value))}
            className="rounded-full border border-beige bg-transparent px-4 py-2 text-sm text-ink outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Talles + colores */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-green-mid">Talle</span>
          {facets.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setOrToggle("size", s)}
              className={`grid h-8 min-w-8 place-items-center rounded-md border px-2 text-xs font-medium transition-colors ${
                current("size") === s
                  ? "border-green bg-green text-cream"
                  : "border-beige text-ink hover:border-green"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-green-mid">Color</span>
          {facets.colors.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => setOrToggle("color", c.name)}
              className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 ${
                current("color") === c.name ? "border-green" : "border-black/10"
              }`}
              style={{ background: c.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
