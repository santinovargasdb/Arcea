# Fase 6 (parte 1) — About, Contacto y SEO · Diseño

**Proyecto:** Arcea Estudio (tienda de ropa full-stack)
**Fecha:** 2026-06-24
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 (paleta de marca) · `next/og`

## 1. Contexto y objetivo

Catálogo (Fase 1), auth (Fase 2) y carrito (Fase 3 cliente) están listos. Esta tanda agrega
**páginas de info** (Sobre nosotros, Contacto) y **SEO** (metadata, sitemap, robots, Open Graph),
todo construible **sin backend**. Reusa la copy ya aprobada por el cliente en `mockup/index.html`.

## 2. Alcance

**Incluye:**
- `src/lib/site.ts`: constantes del negocio (nombre, slogan, IG, email, WhatsApp, showroom, url),
  centralizadas (más adelante migran a `business_settings`).
- Página `/about` (server) con la copy del mockup.
- Página `/contacto` (server) con canales accionables (mailto, wa.me, IG), **sin formulario**.
- Wiring de navegación: header (desktop + mobile) y footer linkean a `/about` y `/contacto`.
- SEO: `metadata` en `/about` y `/contacto`; `sitemap.ts`; `robots.ts`; `opengraph-image.tsx`
  dinámica (branded, con `next/og`) en la raíz.

**No incluye (esperan backend):**
- Header/footer dinámicos desde `business_settings`.
- Formulario de contacto funcional y newsletter funcional.
- Analítica. Páginas Lookbook/Sostenibilidad (no hay contenido aprobado para páginas propias).

## 3. Arquitectura

### A. Constantes del sitio — `src/lib/site.ts`

```ts
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
Consumido por `/contacto`, footer y la OG image (DRY).

### B. `/about` — `src/app/(storefront)/about/page.tsx` (server)

Reusa la copy aprobada del mockup:
- Eyebrow "Sobre nosotros", titular *"Nacimos para vestir sin ruido."*
- Párrafos: filosofía de la calma + guardarropa esencial.
- Cita: *"Diseñamos para quienes prefieren la presencia al estridente."*
- Stats: **8** años tejiendo · **100%** materiales nobles · **AR** hecho en Argentina.
- Imagen del taller (placeholder picsum, como el resto del sitio).
- `metadata` propia (title "Sobre nosotros", description de marca).
- Mobile-first, paleta de marca.

### C. `/contacto` — `src/app/(storefront)/contacto/page.tsx` (server)

- Eyebrow "Contacto", titular *"Hablemos"*, lead del mockup.
- Canales accionables (desde `SITE`):
  - Email → `mailto:hola@arceaestudio.com`
  - WhatsApp → `https://wa.me/5491155552026`
  - Instagram → `instagramUrl`
  - Showroom (texto): Palermo, Buenos Aires · Lun a Sáb 11–19h
- **Sin formulario** (sin backend no envía; se suma cuando exista). `metadata` propia.

### D. Navegación

- **Header** (`src/components/storefront/header.tsx`): agregar al array `NAV` los items
  `Nosotros → /about` y `Contacto → /contacto` (aparecen en desktop y en el menú mobile, que
  reusa el mismo array).
- **Footer** (`src/components/storefront/footer.tsx`): en la columna "Estudio", "Sobre nosotros"
  → `/about`; agregar "Contacto" → `/contacto`. (Lookbook/Sostenibilidad siguen en `#`.)

### E. SEO

- **`metadata`** por página en `/about` y `/contacto` (las demás server pages ya la tienen;
  `/cart` y `/checkout` son client components sin metadata → quedan cubiertas por `robots.ts`).
- **`src/app/sitemap.ts`** (`MetadataRoute.Sitemap`, async): rutas públicas indexables
  (`/`, `/products`, `/about`, `/contacto`) + detalle de cada producto (`getProducts({ perPage: 1000 })`)
  + categorías (`getCategories()`). Base = `SITE.url`. Sin backend usa datos seed.
- **`src/app/robots.ts`** (`MetadataRoute.Robots`): allow `/`, disallow
  `["/account", "/cart", "/checkout", "/login", "/register", "/forgot-password", "/reset-password", "/auth/"]`;
  `sitemap: ${SITE.url}/sitemap.xml`.
- **`src/app/opengraph-image.tsx`** (`ImageResponse` de `next/og`): imagen 1200×630 branded
  (fondo verde pantano `#2C382A`, texto crema `#F4EEE3`, nombre + slogan + IG). **Sin cargar
  fuentes custom** (usa la default de `next/og`) para robustez. Exporta `alt`, `size`, `contentType`.
  Al estar en la raíz, aplica a todas las rutas por defecto. `metadataBase` ya está seteado en el
  layout raíz, así que las URLs absolutas de OG/sitemap resuelven.

## 4. Mapa de archivos

**Nuevos:**
```
src/lib/site.ts
src/app/(storefront)/about/page.tsx
src/app/(storefront)/contacto/page.tsx
src/app/sitemap.ts
src/app/robots.ts
src/app/opengraph-image.tsx
```

**Modificados:**
```
src/components/storefront/header.tsx     # NAV: Nosotros, Contacto
src/components/storefront/footer.tsx      # links a /about y /contacto
ROADMAP.md                              # marcar avance Fase 6
```

## 5. Verificación

- Gate por tarea: `npm run build` (ESLint + TypeScript); aparecen `/about`, `/contacto`,
  `/sitemap.xml`, `/robots.txt`, y la OG image (`/opengraph-image`).
- Verificación en navegador (Playwright): `/about` y `/contacto` renderizan, los links de nav
  funcionan, `mailto`/`wa.me` presentes; `GET /sitemap.xml` y `/robots.txt` devuelven contenido;
  la OG image se genera (200).

## 6. Fuera de alcance

Header/footer desde `business_settings`, formulario de contacto y newsletter funcionales,
analítica, páginas Lookbook/Sostenibilidad. Esperan backend o contenido aprobado.
