/**
 * Tipos y constantes del catálogo — SEGUROS PARA CLIENTE.
 * No importa nada de servidor (sin next/headers ni Supabase), así puede
 * usarse tanto en Server Components como en Client Components.
 */

export type Color = { name: string; hex: string };
export type Category = { name: string; slug: string };
export type Badge = "Nuevo" | "Oferta" | null;

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  basePrice: number;
  compareAtPrice: number | null;
  image: string;
  sizes: string[];
  colors: Color[];
  badge: Badge;
  isFeatured: boolean;
  createdAt: string;
};

export type ProductDetail = ProductListItem & {
  description: string;
  images: string[];
  stock: number;
};

export const SORT_OPTIONS = [
  { value: "destacados", label: "Destacados" },
  { value: "nuevos", label: "Más nuevos" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];

export type CatalogQuery = {
  category?: string;
  size?: string;
  color?: string;
  search?: string;
  sort?: SortOption;
  page?: number;
  perPage?: number;
};

export type CatalogResult = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageCount: number;
  perPage: number;
};

export type Facets = { sizes: string[]; colors: Color[] };
