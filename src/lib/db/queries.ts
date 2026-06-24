import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SEED_PRODUCTS, SEED_CATEGORIES, type SeedProduct } from "./seed-data";
import type {
  Badge,
  Category,
  CatalogQuery,
  CatalogResult,
  Color,
  Facets,
  ProductDetail,
  ProductListItem,
} from "./catalog-types";

// Re-exporta los tipos/constantes para quien importe desde "@/lib/db/queries".
export * from "./catalog-types";

/** Cuando hay Supabase configurado usamos la base real; si no, datos locales. */
export { isSupabaseConfigured };

const DEFAULT_PER_PAGE = 8;

function badgeOf(compareAtPrice: number | null, isFeatured: boolean): Badge {
  if (compareAtPrice) return "Oferta";
  if (isFeatured) return "Nuevo";
  return null;
}

function seedToListItem(p: SeedProduct): ProductListItem {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryName: p.categoryName,
    categorySlug: p.categorySlug,
    basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice,
    image: p.images[0],
    sizes: p.sizes,
    colors: p.colors,
    badge: badgeOf(p.compareAtPrice, p.isFeatured),
    isFeatured: p.isFeatured,
    createdAt: p.createdAt,
  };
}

/** Filtrado + orden + paginación compartidos por ambos orígenes de datos. */
function applyQuery(all: ProductListItem[], q: CatalogQuery): CatalogResult {
  const perPage = q.perPage ?? DEFAULT_PER_PAGE;
  let items = [...all];

  if (q.category) items = items.filter((i) => i.categorySlug === q.category);
  if (q.size) items = items.filter((i) => i.sizes.includes(q.size!));
  if (q.color) items = items.filter((i) => i.colors.some((c) => c.name === q.color));
  if (q.search) {
    const s = q.search.trim().toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(s) || i.categoryName.toLowerCase().includes(s),
    );
  }

  switch (q.sort) {
    case "precio-asc":
      items.sort((a, b) => a.basePrice - b.basePrice);
      break;
    case "precio-desc":
      items.sort((a, b) => b.basePrice - a.basePrice);
      break;
    case "nuevos":
      items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    default: // destacados
      items.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          b.createdAt.localeCompare(a.createdAt),
      );
  }

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / perPage));
  const page = Math.min(Math.max(1, q.page ?? 1), pageCount);
  const start = (page - 1) * perPage;

  return { items: items.slice(start, start + perPage), total, page, pageCount, perPage };
}

// ─────────────────────────────────────────────────────────────
//  Origen Supabase (se ejecuta cuando hay .env configurado)
// ─────────────────────────────────────────────────────────────

function resolveImageUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${base}/storage/v1/object/public/product-images/${path}`;
}

const PRODUCT_SELECT = `
  id, name, slug, description, base_price, compare_at_price, is_featured, created_at,
  category:categories(name, slug),
  product_images(storage_path, is_primary, sort_order),
  product_variants(size, color, color_hex, stock, is_active)
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(
  row: any,
): ProductListItem & { description: string; images: string[]; stock: number } {
  const images: any[] = (row.product_images ?? [])
    .slice()
    .sort(
      (a: any, b: any) =>
        Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
    );
  const variants: any[] = (row.product_variants ?? []).filter(
    (v: any) => v.is_active !== false,
  );
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[];
  const colorMap = new Map<string, Color>();
  for (const v of variants) {
    if (v.color && !colorMap.has(v.color))
      colorMap.set(v.color, { name: v.color, hex: v.color_hex ?? "#999" });
  }
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    categoryName: row.category?.name ?? "",
    categorySlug: row.category?.slug ?? "",
    basePrice: row.base_price,
    compareAtPrice: row.compare_at_price,
    image: images[0] ? resolveImageUrl(images[0].storage_path) : "",
    images: images.map((im) => resolveImageUrl(im.storage_path)),
    sizes,
    colors: [...colorMap.values()],
    badge: badgeOf(row.compare_at_price, row.is_featured),
    isFeatured: row.is_featured,
    createdAt: row.created_at,
    description: row.description ?? "",
    stock: variants.reduce((acc, v) => acc + (v.stock ?? 0), 0),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ─────────────────────────────────────────────────────────────
//  API pública de datos
// ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return SEED_CATEGORIES;
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("is_active", true)
    .order("sort_order");
  return (data ?? []).map((c) => ({ name: c.name as string, slug: c.slug as string }));
}

export async function getProducts(q: CatalogQuery = {}): Promise<CatalogResult> {
  let all: ProductListItem[];
  if (!isSupabaseConfigured) {
    all = SEED_PRODUCTS.map(seedToListItem);
  } else {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true);
    if (error) throw error;
    all = (data ?? []).map(mapRow);
  }
  return applyQuery(all, q);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  if (!isSupabaseConfigured) {
    const p = SEED_PRODUCTS.find((x) => x.slug === slug);
    if (!p) return null;
    return {
      ...seedToListItem(p),
      description: p.description,
      images: p.images,
      stock: p.stock,
    };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data) : null;
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
function sortSizes(sizes: string[]): string[] {
  return sizes.sort((a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b));
}

export async function getCatalogFacets(): Promise<Facets> {
  if (!isSupabaseConfigured) {
    const sizes = [...new Set(SEED_PRODUCTS.flatMap((p) => p.sizes))];
    const colorMap = new Map<string, Color>();
    SEED_PRODUCTS.forEach((p) => p.colors.forEach((c) => colorMap.set(c.name, c)));
    return { sizes: sortSizes(sizes), colors: [...colorMap.values()] };
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_variants")
    .select("size, color, color_hex, is_active");
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows = (data ?? []).filter((r: any) => r.is_active !== false);
  const sizes = [...new Set(rows.map((r: any) => r.size).filter(Boolean))] as string[];
  const colorMap = new Map<string, Color>();
  rows.forEach((r: any) => {
    if (r.color && !colorMap.has(r.color))
      colorMap.set(r.color, { name: r.color, hex: r.color_hex ?? "#999" });
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
  return { sizes: sortSizes(sizes), colors: [...colorMap.values()] };
}
