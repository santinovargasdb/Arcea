# Roadmap — Arcea Estudio 🌿

Plan de implementación de la tienda de ropa online full-stack.
Stack: **Next.js 16 + Supabase + MercadoPago + Vercel**. Detalle técnico y reglas en [`CLAUDE.md`](./CLAUDE.md).

Estrategia: **desplegar temprano y mantenerlo online**. Cada fase termina con un deploy.

Leyenda: `[x]` hecho · `[~]` en progreso · `[ ]` pendiente

---

## Fase 0 — Scaffold + base del proyecto `[~]`

- [x] `create-next-app` (TypeScript, App Router, Tailwind v4, `src/`, alias `@/*`)
- [x] Dependencias del stack (`@supabase/ssr`, `@supabase/supabase-js`, `mercadopago`, `zod`, `react-hook-form`, `sonner`, `date-fns`)
- [x] Inicializar **shadcn/ui** (`components.json`, `lib/utils.ts`, variables CSS)
- [x] Estructura de carpetas del proyecto (`actions/`, `components/`, `lib/`, `types/`, `supabase/migrations/`)
- [x] Clientes de Supabase: `client.ts`, `server.ts`, `middleware.ts`, `admin.ts`
- [x] `middleware.ts` raíz (refresco de sesión; tolera ausencia de `.env`)
- [x] Fuentes de marca (Fraunces + Hanken Grotesk) y `.env.example`
- [x] Home placeholder branded ("Menos ruido, más presencia")
- [x] Documentación: `CLAUDE.md`, `ROADMAP.md`
- [ ] **Crear cuenta + proyecto en Supabase** (URL, anon key, service-role key) → completar `.env.local`
- [ ] **Crear cuenta en Vercel**, importar el repo y cargar variables de entorno
- [ ] Subir el repo a GitHub
- [ ] **Primer deploy a Vercel** → el sitio queda online 🎉

> ⏳ Bloqueante externo: las cuentas de Supabase y Vercel las creás vos; te guío paso a paso.

---

## Fase 1 — Catálogo `[ ]`

- [ ] Migración del schema de catálogo: `categories`, `products`, `product_variants`, `product_images`
- [ ] Políticas RLS de lectura pública (solo productos activos) + datos seed
- [ ] Supabase Storage (`product-images`) y `next.config` para `next/image`
- [ ] Páginas (RSC): listado de productos, detalle, categorías
- [ ] Búsqueda (full-text), filtros (talle/color/precio), orden y paginación
- [ ] Generar tipos (`supabase gen types`) → `src/types/database.types.ts`
- [ ] Deploy

## Fase 2 — Autenticación y cuentas `[ ]`

- [ ] `profiles` + trigger de creación + enum de rol; RLS
- [ ] Login / registro / olvido y reset de contraseña; callbacks de auth
- [ ] Gating de `/account` en el middleware
- [ ] Perfil, direcciones (CRUD), shell del historial de pedidos
- [ ] Deploy

## Fase 3 — Carrito y checkout `[ ]`

- [ ] `carts` / `cart_items` + RLS; Server Actions de carrito; persistencia + merge invitado→usuario
- [ ] `CartSheet` y estado en cliente
- [ ] `orders` / `order_items` con snapshot inmutable y descuento de stock (RPC transaccional)
- [ ] Páginas de checkout (decisión: checkout de invitado permitido)
- [ ] Deploy

## Fase 4 — Pagos MercadoPago `[ ]`

- [ ] Tabla `payments`; cliente del SDK; builder de preferencias
- [ ] Crear preferencia en checkout (`external_reference`, `back_urls`, `notification_url`)
- [ ] **Webhook** `/api/webhooks/mercadopago` con service-role, validación de firma e idempotencia
- [ ] Estado del pedido dirigido por webhook; restaurar stock si se rechaza
- [ ] Pruebas en sandbox
- [ ] Deploy

## Fase 5 — Panel de administración `[ ]`

- [ ] Layout admin + gating triple (middleware + `requireAdmin()` + RLS)
- [ ] CRUD de productos / variantes / imágenes / categorías
- [ ] Gestión de pedidos (estados, fulfillment, reembolsos)
- [ ] Usuarios y roles
- [ ] `business_settings` (nombre, redes, contacto) editable
- [ ] Deploy

## Fase 6 — Info del negocio y pulido `[ ]`

- [ ] Páginas about / contacto; header y footer dinámicos desde `business_settings`
- [ ] Redes sociales (Instagram, etc.)
- [ ] SEO (metadata, sitemap, OG), estados vacíos/errores, accesibilidad, performance
- [ ] Analítica; e2e de compra
- [ ] **Go-live con credenciales de producción** de MercadoPago

---

### Decisiones registradas

- **Pagos:** MercadoPago (LATAM).
- **Checkout de invitado:** permitido (mayor conversión); se guarda `email` en la orden.
- **Precios:** enteros en centavos.
- **Mobile-first:** prioridad por el tráfico desde Instagram.

### Notas de diseño

El mockup visual aprobado por el cliente vive en [`mockup/index.html`](./mockup/index.html)
(standalone, sin backend). Se irá portando a componentes Next.js + Tailwind a lo largo de las fases.
