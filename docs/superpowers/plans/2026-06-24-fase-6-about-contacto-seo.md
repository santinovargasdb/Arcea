# Fase 6 (parte 1) — About, Contacto y SEO · Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Páginas `/about` y `/contacto` con la copy aprobada del mockup, nav wireada, y SEO (metadata, `sitemap.ts`, `robots.ts`, OG image dinámica) — todo sin backend.

**Architecture:** Constantes del negocio centralizadas en `src/lib/site.ts`; páginas server bajo `(storefront)`; archivos de metadata de Next 16 (`sitemap.ts`, `robots.ts`, `opengraph-image.tsx` con `next/og`) en la raíz de `app`.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 (paleta de marca) · `next/og` · lucide-react.

## Global Constraints

- **Idioma:** UI/textos en **español**; identificadores/archivos en **inglés**.
- **Mobile-first:** estilos base = móvil; `sm:`/`lg:` para arriba.
- **Paleta de marca** (clases Tailwind): `cream`, `paper`, `beige`, `beige-soft`, `green`,
  `green-mid`, `green-light`, `green-pale`, `ink`, `burgundy`. Hex para `next/og`:
  green `#2C382A`, cream `#F4EEE3`, beige-soft `#E3D8C2`, green-pale `#C3CBB2`, green-light `#8E9C78`.
- **Copy aprobada**: reusar la de `mockup/index.html` (no inventar).
- **Sin backend:** páginas server estáticas; sin formularios funcionales.
- **`metadataBase`** ya está seteado en el layout raíz → URLs absolutas de OG/sitemap resuelven.

## Estrategia de verificación

- **Gate por tarea:** `npm run build` (ESLint + TypeScript) en verde.
- **Verificación final en navegador** (Playwright) en la Task 7: `/about`, `/contacto`, los links de
  nav, `mailto`/`wa.me`, y que `sitemap.xml`, `robots.txt` y la OG image respondan.

## Estructura de archivos

**Nuevos:**
```
src/lib/site.ts                            # constantes del negocio
src/app/(storefront)/about/page.tsx         # Sobre nosotros
src/app/(storefront)/contacto/page.tsx      # Contacto
src/app/sitemap.ts                          # MetadataRoute.Sitemap
src/app/robots.ts                           # MetadataRoute.Robots
src/app/opengraph-image.tsx                 # ImageResponse (next/og)
```

**Modificados:**
```
src/components/storefront/header.tsx        # NAV: Nosotros, Contacto
src/components/storefront/footer.tsx         # links a /about y /contacto
ROADMAP.md                                 # marcar avance Fase 6
```

---

### Task 1: Constantes del negocio

**Files:**
- Create: `src/lib/site.ts`

**Interfaces:**
- Produces: `SITE` con `{ name, slogan, url, instagram, instagramUrl, email, whatsapp, whatsappUrl, showroom }`.

- [ ] **Step 1: Crear el módulo**

```ts
// src/lib/site.ts
export const SITE = {
  name: "Arcea Estudio",
  slogan: "Menos ruido, más presencia",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  instagram: "@arcea.estudio",
  instagramUrl: "https://instagram.com/arcea.estudio",
  email: "hola@arceaestudio.com",
  whatsapp: "+54 9 11 5555 2026",
  whatsappUrl: "https://wa.me/5491155552026",
  showroom: "Palermo, Buenos Aires · Lun a Sáb 11–19h",
} as const;
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 3: Commit**

```bash
git add src/lib/site.ts
git commit -m "feat(site): constantes del negocio (contacto, redes)"
```

---

### Task 2: Página `/about`

**Files:**
- Create: `src/app/(storefront)/about/page.tsx`

**Interfaces:**
- Consumes: `next/image`. (Imagen placeholder picsum; `next.config` ya permite `picsum.photos`.)

- [ ] **Step 1: Crear la página**

```tsx
// src/app/(storefront)/about/page.tsx
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Sobre nosotros",
  description:
    "Arcea Estudio: ropa de invierno y casualwear en tejidos naturales, hecha desde la calma en Argentina.",
};

const STATS = [
  { b: "8", s: "Años tejiendo" },
  { b: "100%", s: "Materiales nobles" },
  { b: "AR", s: "Hecho en Argentina" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-beige-soft">
          <Image
            src="https://picsum.photos/seed/arcea-about/800/1000"
            alt="Taller Arcea Estudio"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-green-mid">
            Sobre nosotros
          </span>
          <h1 className="mt-3 font-heading text-4xl font-medium text-green sm:text-5xl">
            Nacimos para vestir <em className="text-burgundy">sin ruido.</em>
          </h1>
          <p className="mt-6 leading-relaxed text-ink/80">
            Arcea Estudio es una marca de ropa pensada desde la calma. Diseñamos prendas de
            invierno y casualwear que duran, hechas con tejidos naturales y procesos conscientes.
          </p>
          <p className="mt-4 leading-relaxed text-ink/80">
            Creemos en el guardarropa esencial: pocas prendas, bien hechas, que se sienten tan bien
            como se ven. Menos tendencias pasajeras, más piezas que se vuelven parte de tu rutina.
          </p>
          <blockquote className="mt-6 border-l-2 border-burgundy pl-4 font-heading text-xl italic text-green">
            “Diseñamos para quienes prefieren la presencia al estridente.”
          </blockquote>
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-beige pt-6">
            {STATS.map((st) => (
              <div key={st.s}>
                <p className="font-heading text-3xl text-green">{st.b}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-green-mid">{st.s}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; aparece `/about`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(storefront)/about/page.tsx"
git commit -m "feat(about): página Sobre nosotros"
```

---

### Task 3: Página `/contacto`

**Files:**
- Create: `src/app/(storefront)/contacto/page.tsx`

**Interfaces:**
- Consumes: `SITE` (Task 1), íconos de `lucide-react`.

- [ ] **Step 1: Crear la página**

```tsx
// src/app/(storefront)/contacto/page.tsx
import type { Metadata } from "next";
import { Mail, MessageCircle, Instagram, MapPin } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Escribinos por email o WhatsApp, seguinos en Instagram o visitanos en el showroom de Palermo.",
};

const CHANNELS = [
  { icon: Mail, label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { icon: MessageCircle, label: "WhatsApp", value: SITE.whatsapp, href: SITE.whatsappUrl },
  { icon: Instagram, label: "Instagram", value: SITE.instagram, href: SITE.instagramUrl },
];

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16">
      <header className="max-w-xl">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-green-mid">
          Contacto
        </span>
        <h1 className="mt-3 font-heading text-4xl font-medium text-green sm:text-5xl">Hablemos</h1>
        <p className="mt-4 text-ink/70">
          ¿Dudas con un talle, un pedido o querés visitarnos? Escribinos y te respondemos a la
          brevedad.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
        {CHANNELS.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.href.startsWith("mailto") ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-beige bg-paper p-5 transition-colors hover:border-green"
          >
            <span className="grid h-11 w-11 place-items-center rounded-full bg-green/10 text-green">
              <c.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-green-mid">{c.label}</p>
              <p className="text-sm font-medium text-ink">{c.value}</p>
            </div>
          </a>
        ))}
        <div className="flex items-center gap-4 rounded-2xl border border-beige bg-paper p-5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-green/10 text-green">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wider text-green-mid">Showroom</p>
            <p className="text-sm font-medium text-ink">{SITE.showroom}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; aparece `/contacto`. Si algún ícono no existiera en `lucide-react`
(`Instagram` es de marca y puede variar), sustituir por uno disponible (p. ej. `AtSign`).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(storefront)/contacto/page.tsx"
git commit -m "feat(contacto): página de contacto con canales accionables"
```

---

### Task 4: Wiring de navegación (header + footer)

**Files:**
- Modify: `src/components/storefront/header.tsx`
- Modify: `src/components/storefront/footer.tsx`

- [ ] **Step 1: Agregar Nosotros y Contacto al NAV del header**

En `src/components/storefront/header.tsx`, reemplazar el array `NAV`:
```tsx
const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Colección", href: "/products" },
  { label: "Sweaters", href: "/products?category=sweaters" },
  { label: "Abrigos", href: "/products?category=abrigos" },
  { label: "Tejidos", href: "/products?category=tejidos" },
  { label: "Casual", href: "/products?category=casual" },
];
```
por:
```tsx
const NAV = [
  { label: "Inicio", href: "/" },
  { label: "Colección", href: "/products" },
  { label: "Sweaters", href: "/products?category=sweaters" },
  { label: "Abrigos", href: "/products?category=abrigos" },
  { label: "Nosotros", href: "/about" },
  { label: "Contacto", href: "/contacto" },
];
```
(Se reemplazan "Tejidos" y "Casual" por "Nosotros" y "Contacto" para no sobrecargar el nav desktop;
las categorías siguen accesibles desde el footer y los chips del catálogo.)

- [ ] **Step 2: Wirear los links del footer**

En `src/components/storefront/footer.tsx`, reemplazar el objeto de la columna "Estudio":
```tsx
  {
    title: "Estudio",
    links: [
      { label: "Sobre nosotros", href: "#" },
      { label: "Lookbook", href: "#" },
      { label: "Sostenibilidad", href: "#" },
    ],
  },
```
por:
```tsx
  {
    title: "Estudio",
    links: [
      { label: "Sobre nosotros", href: "/about" },
      { label: "Contacto", href: "/contacto" },
      { label: "Lookbook", href: "#" },
      { label: "Sostenibilidad", href: "#" },
    ],
  },
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 4: Commit**

```bash
git add src/components/storefront/header.tsx src/components/storefront/footer.tsx
git commit -m "feat(nav): linkear Nosotros y Contacto en header y footer"
```

---

### Task 5: `sitemap.ts` + `robots.ts`

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Interfaces:**
- Consumes: `SITE` (Task 1), `getProducts`/`getCategories` de `@/lib/db/queries`.

- [ ] **Step 1: Crear el sitemap**

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getProducts, getCategories } from "@/lib/db/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const { items: products } = await getProducts({ perPage: 1000 });
  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/products/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categories = await getCategories();
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
```

- [ ] **Step 2: Crear robots**

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/cart",
        "/checkout",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
        "/auth/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila; aparecen `/sitemap.xml` y `/robots.txt` en el output de rutas.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat(seo): sitemap y robots"
```

---

### Task 6: OG image dinámica

**Files:**
- Create: `src/app/opengraph-image.tsx`

**Interfaces:**
- Consumes: `ImageResponse` de `next/og`, `SITE` (Task 1).

- [ ] **Step 1: Crear la OG image**

```tsx
// src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "Arcea Estudio — Menos ruido, más presencia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#2C382A",
          color: "#F4EEE3",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 12,
            textTransform: "uppercase",
            color: "#C3CBB2",
          }}
        >
          Invierno 2026
        </div>
        <div style={{ fontSize: 120, fontWeight: 600, lineHeight: 1.05, marginTop: 24 }}>
          {SITE.name}
        </div>
        <div style={{ fontSize: 44, fontStyle: "italic", color: "#E3D8C2", marginTop: 16 }}>
          {SITE.slogan}.
        </div>
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#8E9C78", marginTop: 48 }}>
          {SITE.instagram}
        </div>
      </div>
    ),
    { ...size },
  );
}
```

> Nota: no se cargan fuentes custom — `next/og` usa su fuente por defecto, lo que mantiene la
> generación robusta sin leer archivos. Cada `<div>` con un solo hijo de texto es válido para satori.

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; la generación de la OG image no falla. Si satori se quejara de un `<div>` con
múltiples hijos sin `display`, agregar `display: "flex"` a ese div (acá todos tienen un solo hijo).

- [ ] **Step 3: Commit**

```bash
git add src/app/opengraph-image.tsx
git commit -m "feat(seo): Open Graph image dinámica (next/og)"
```

---

### Task 7: Roadmap, build final y verificación en navegador

**Files:**
- Modify: `ROADMAP.md`

- [ ] **Step 1: Marcar avance en `ROADMAP.md`**

Reemplazar el encabezado y los ítems de la Fase 6 por:
```markdown
## Fase 6 — Info del negocio y pulido `[~]`

- [x] Páginas about / contacto (copy aprobada del mockup)
- [x] SEO base: metadata por página, `sitemap.xml`, `robots.txt`, Open Graph image dinámica
- [~] Header/footer linkean about/contacto; versión dinámica desde `business_settings` espera backend
- [ ] Redes sociales reales, analítica, e2e de compra
- [ ] **Go-live con credenciales de producción** de MercadoPago

> 💡 about/contacto + SEO construidos sin backend. Falta lo que depende de Supabase/MercadoPago.
```

- [ ] **Step 2: Build final**

Run: `npm run build`
Expected: compila; el output incluye `/about`, `/contacto`, `/sitemap.xml`, `/robots.txt` y la
OG image (`/opengraph-image`).

- [ ] **Step 3: Verificación en navegador (Playwright)**

Levantar `npm run dev` y verificar:
1. `/about` renderiza el titular "Nacimos para vestir sin ruido" y los stats.
2. `/contacto` muestra los canales; el link de Email es `mailto:` y el de WhatsApp `wa.me`.
3. Desde el header, "Nosotros" → `/about` y "Contacto" → `/contacto`.
4. `GET /robots.txt` y `GET /sitemap.xml` devuelven contenido (200) con las rutas esperadas.
5. `GET /opengraph-image` devuelve una imagen (200).

- [ ] **Step 4: Commit**

```bash
git add ROADMAP.md
git commit -m "docs: marcar avance de la Fase 6 (about, contacto, SEO) en el roadmap"
```

---

## Self-review (hecho al escribir el plan)

- **Cobertura del spec:** ✅ `site.ts` (T1), `/about` (T2), `/contacto` (T3), nav header+footer (T4),
  `sitemap.ts`+`robots.ts` (T5), `opengraph-image.tsx` (T6), roadmap+verificación (T7).
- **Consistencia:** `SITE` (T1) se consume con las mismas claves en `/contacto`, `sitemap`, `robots`
  y la OG image; las páginas viven bajo `(storefront)` y heredan header/footer.
- **Sin placeholders:** todo el código está completo.
- **Decisión de testing:** gate por `npm run build`; verificación real en navegador en T7.

## Follow-ups (fuera de esta fase)

1. Header/footer dinámicos desde `business_settings` al conectar Supabase.
2. Formulario de contacto y newsletter funcionales (requieren backend / servicio de email).
3. Analítica, e2e de compra, y páginas Lookbook/Sostenibilidad cuando haya contenido.
