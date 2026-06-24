/**
 * Datos de ejemplo para desarrollo LOCAL (mientras Supabase no esté conectado).
 * Reflejan `supabase/seed.sql`. Una vez configurado Supabase, las queries
 * usan la base real y este archivo deja de utilizarse.
 */

export type Color = { name: string; hex: string };

export type SeedProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryName: string;
  categorySlug: string;
  basePrice: number; // centavos
  compareAtPrice: number | null;
  isFeatured: boolean;
  createdAt: string; // ISO, para ordenar por "nuevos"
  sizes: string[];
  colors: Color[];
  images: string[]; // URLs placeholder
  stock: number;
};

export const SEED_CATEGORIES: { name: string; slug: string }[] = [
  { name: "Sweaters", slug: "sweaters" },
  { name: "Abrigos", slug: "abrigos" },
  { name: "Tejidos", slug: "tejidos" },
  { name: "Casual", slug: "casual" },
];

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    id: "p1",
    name: "Sweater Bruma",
    slug: "sweater-bruma",
    description:
      "Sweater oversize de punto suave, ideal para los días de niebla. Tejido natural y caída relajada que abriga sin pesar.",
    categoryName: "Sweaters",
    categorySlug: "sweaters",
    basePrice: 4890000,
    compareAtPrice: null,
    isFeatured: true,
    createdAt: "2026-05-20",
    sizes: ["M", "L", "XL"],
    colors: [
      { name: "Crema", hex: "#F3EEE3" },
      { name: "Verde", hex: "#8E9C78" },
    ],
    images: [
      "https://picsum.photos/seed/arcea-p1/800/1000",
      "https://picsum.photos/seed/arcea-p1b/800/1000",
    ],
    stock: 26,
  },
  {
    id: "p2",
    name: "Cárdigan Merino",
    slug: "cardigan-merino",
    description:
      "Cárdigan de lana merino, abrigado y liviano. Botones de madera y bolsillos al frente para un look prolijo.",
    categoryName: "Tejidos",
    categorySlug: "tejidos",
    basePrice: 6200000,
    compareAtPrice: null,
    isFeatured: false,
    createdAt: "2026-05-19",
    sizes: ["S", "M", "L"],
    colors: [{ name: "Beige", hex: "#D8C9AE" }],
    images: [
      "https://picsum.photos/seed/arcea-p2/800/1000",
      "https://picsum.photos/seed/arcea-p2b/800/1000",
    ],
    stock: 17,
  },
  {
    id: "p3",
    name: "Abrigo Niebla",
    slug: "abrigo-niebla",
    description:
      "Abrigo largo de paño, silueta envolvente. La prenda estrella del invierno, pensada para durar muchas temporadas.",
    categoryName: "Abrigos",
    categorySlug: "abrigos",
    basePrice: 9450000,
    compareAtPrice: null,
    isFeatured: true,
    createdAt: "2026-05-18",
    sizes: ["M", "L"],
    colors: [{ name: "Gris", hex: "#9A9A95" }],
    images: [
      "https://picsum.photos/seed/arcea-p3/800/1000",
      "https://picsum.photos/seed/arcea-p3b/800/1000",
    ],
    stock: 9,
  },
  {
    id: "p4",
    name: "Buzo Tierra",
    slug: "buzo-tierra",
    description:
      "Buzo de algodón orgánico con felpa interior. Cómodo y cálido para el día a día, en un cálido tono terracota.",
    categoryName: "Casual",
    categorySlug: "casual",
    basePrice: 3190000,
    compareAtPrice: 3990000,
    isFeatured: false,
    createdAt: "2026-05-17",
    sizes: ["S", "M", "L"],
    colors: [{ name: "Terracota", hex: "#A6694F" }],
    images: [
      "https://picsum.photos/seed/arcea-p4/800/1000",
      "https://picsum.photos/seed/arcea-p4b/800/1000",
    ],
    stock: 35,
  },
  {
    id: "p5",
    name: "Cuello Alto Pino",
    slug: "cuello-alto-pino",
    description:
      "Sweater de cuello alto, punto cerrado. Un básico que abriga sin abultar; combina con todo el guardarropa.",
    categoryName: "Sweaters",
    categorySlug: "sweaters",
    basePrice: 4400000,
    compareAtPrice: null,
    isFeatured: false,
    createdAt: "2026-05-16",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Verde", hex: "#2C382A" },
      { name: "Negro", hex: "#23231D" },
    ],
    images: [
      "https://picsum.photos/seed/arcea-p5/800/1000",
      "https://picsum.photos/seed/arcea-p5b/800/1000",
    ],
    stock: 20,
  },
  {
    id: "p6",
    name: "Chaleco Musgo",
    slug: "chaleco-musgo",
    description:
      "Chaleco tejido sin mangas, perfecto para hacer capas. Tono verde musgo que aporta sin gritar.",
    categoryName: "Tejidos",
    categorySlug: "tejidos",
    basePrice: 3350000,
    compareAtPrice: null,
    isFeatured: false,
    createdAt: "2026-05-15",
    sizes: ["S", "M"],
    colors: [{ name: "Musgo", hex: "#6B7355" }],
    images: [
      "https://picsum.photos/seed/arcea-p6/800/1000",
      "https://picsum.photos/seed/arcea-p6b/800/1000",
    ],
    stock: 14,
  },
  {
    id: "p7",
    name: "Tapado Pantano",
    slug: "tapado-pantano",
    description:
      "Tapado de paño en verde pantano, corte recto y largo. Elegancia sin estridencias, la firma de Arcea.",
    categoryName: "Abrigos",
    categorySlug: "abrigos",
    basePrice: 11200000,
    compareAtPrice: null,
    isFeatured: true,
    createdAt: "2026-05-14",
    sizes: ["M", "L"],
    colors: [{ name: "Pantano", hex: "#2C382A" }],
    images: [
      "https://picsum.photos/seed/arcea-p7/800/1000",
      "https://picsum.photos/seed/arcea-p7b/800/1000",
    ],
    stock: 5,
  },
  {
    id: "p8",
    name: "Manga Larga Crema",
    slug: "manga-larga-crema",
    description:
      "Remera de manga larga en algodón peinado. Base perfecta para cualquier look, sola o haciendo capas.",
    categoryName: "Casual",
    categorySlug: "casual",
    basePrice: 2490000,
    compareAtPrice: null,
    isFeatured: false,
    createdAt: "2026-05-13",
    sizes: ["S", "M", "L"],
    colors: [
      { name: "Crema", hex: "#F3EEE3" },
      { name: "Bordó", hex: "#6E292E" },
    ],
    images: [
      "https://picsum.photos/seed/arcea-p8/800/1000",
      "https://picsum.photos/seed/arcea-p8b/800/1000",
    ],
    stock: 43,
  },
];
