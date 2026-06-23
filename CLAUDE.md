<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version (Next.js 16) has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Arcea Estudio — Tienda de ropa online (full-stack)

Marca de ropa de invierno, sweaters y casualwear en tejidos naturales.
**Slogan:** "Menos ruido, más presencia" (alt: "Menos ruido, más estilo"). IG: `@arcea.estudio`.

E-commerce full-stack: catálogo, carrito, checkout con pagos, cuentas de usuario,
panel de administración completo e información del negocio. Desplegado en Vercel.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript** — front y back en un solo proyecto.
- **Tailwind CSS v4** + **shadcn/ui** (sobre Base UI) + `lucide-react`.
- **Supabase**: PostgreSQL + Auth + Row Level Security + Storage.
- **MercadoPago** (Checkout Pro) para pagos.
- **Vercel** para hosting.
- Formularios: `react-hook-form` + `zod`. Toasts: `sonner`. Fechas: `date-fns`.

## Comandos

```bash
npm run dev     # desarrollo local (http://localhost:3000)
npm run build   # build de producción (corre también ESLint y typecheck)
npm run start   # servir el build
npm run lint    # ESLint
```

## Estructura

```
middleware.ts                 # refresco de sesión Supabase + (futuro) gating de rutas
src/
  app/
    (storefront) (auth) (account) (admin)   # route groups por área (se van creando por fase)
    api/webhooks/mercadopago/route.ts        # webhook de pagos (público, fuera del middleware)
  actions/                    # Server Actions ("use server")
  lib/
    supabase/{client,server,middleware,admin}.ts
    mercadopago/  auth/  validations/  db/
    utils.ts                  # cn()
  components/{ui,storefront,account,admin,layout}/
  types/                      # database.types.ts se genera con supabase gen types
supabase/migrations/          # SQL versionado (Supabase CLI)
mockup/index.html             # mockup de diseño de referencia (standalone, sin backend)
```

## Convenciones y reglas críticas

- **Idioma:** UI y textos en **español**; identificadores, nombres de archivo y de
  tablas/columnas en **inglés**.
- **Mobile-first:** mucho tráfico llega desde Instagram. Diseñar primero para móvil
  (Tailwind es mobile-first por defecto: estilos base = móvil, `sm:`/`md:` para arriba).
- **Precios en enteros (centavos)**, nunca floats. Formatear en la UI.
- **Supabase (`@supabase/ssr`):**
  - `lib/supabase/client.ts` → componentes de cliente.
  - `lib/supabase/server.ts` → RSC / Server Actions / Route Handlers (`await cookies()`).
  - `lib/supabase/middleware.ts` → refresca la sesión en cada request.
  - `lib/supabase/admin.ts` → **service-role, SOLO servidor** (`server-only`). Salta RLS.
- **`SUPABASE_SERVICE_ROLE_KEY`** nunca con prefijo `NEXT_PUBLIC_`, nunca en el cliente.
- **Pagos:** el estado del pedido lo decide el **webhook** de MercadoPago, **nunca** las
  `back_urls` (se pueden falsear). Idempotencia por `mp_payment_id`. La ruta
  `/api/webhooks/*` queda **fuera del middleware** (debe ser pública).
- **RLS activado en todas las tablas.** El rol vive en `profiles.role` (`customer` | `admin`),
  protegido contra auto-escalada. Verificar autorización en server además del middleware.
- **Mutaciones = Server Actions**; el webhook es un **Route Handler** (necesita endpoint HTTP).
- **Diseño / identidad:** referencia visual en `mockup/index.html`. Paleta: verde pantano
  (claro/oscuro), crema, beige, gris, **bordó** (acento). Fuentes: **Fraunces** (display,
  variable `--font-fraunces` → `font-heading`) + **Hanken Grotesk** (cuerpo, `--font-hanken`
  → `font-sans`).

## Entorno

Ver `.env.example`. Copiar a `.env.local` (no se commitea) y completar Supabase + MercadoPago.

## Roadmap

Plan de implementación por fases en **`ROADMAP.md`**.
