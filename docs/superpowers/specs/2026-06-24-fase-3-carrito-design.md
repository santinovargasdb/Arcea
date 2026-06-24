# Fase 3 (parte 1) — Carrito client-side + checkout demo · Diseño

**Proyecto:** Arcea Estudio (tienda de ropa full-stack)
**Fecha:** 2026-06-24
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 (paleta de marca) · sonner

## 1. Contexto y objetivo

El catálogo (Fase 1) y la auth (Fase 2) están construidos. El botón "Agregar al carrito"
del detalle de producto está **deshabilitado** esperando esta fase. Acá agregamos un
**carrito funcional 100% en el cliente** (sin backend) y un **checkout "demo"** (resumen +
aviso de que el pago llega con MercadoPago). Es un incremento real y usable sin conectar
Supabase ni MercadoPago.

## 2. Principio rector — carrito client-side

El carrito vive en el navegador: estado en un React Context + persistencia en `localStorage`.
No hay tabla `carts` todavía. Cuando se conecte Supabase (fase futura), este carrito local
se **mergea** a `carts`/`cart_items` al loguear. El checkout no crea órdenes ni cobra: es una
maqueta funcional del resumen con un aviso claro.

Datos disponibles (del detalle de producto, ver `catalog-types.ts`): `slug`, `name`, `image`,
`basePrice` (centavos), `sizes: string[]`, `colors: Color[]`, `stock` (total). **No** hay ids
ni precio por variante expuestos al cliente → la línea de carrito se llavea por
`slug + talle + color` y usa `basePrice`.

## 3. Alcance

**Incluye:**
- `CartProvider` (Context + `localStorage`) montado en el layout raíz.
- `AddToCart` en el detalle: elegir talle (y color si hay >1) y agregar; abre el drawer.
- `CartSheet` (drawer) desde el header, con stepper de cantidad, eliminar y subtotal.
- Badge de cantidad en el ícono del header.
- Página `/cart` (vista completa) y `/checkout` (demo, no funcional).
- Estados vacíos branded.

**No incluye (esperan backend Supabase + MercadoPago):**
- Órdenes (`orders`/`order_items`), descuento de stock, snapshot inmutable.
- Pago real (preferencia MercadoPago, webhook).
- Merge carrito invitado → usuario al loguear.
- Validación de stock real / precio por variante.

## 4. Arquitectura

### A. Estado y persistencia — `src/lib/cart/cart-context.tsx` (`"use client"`)

- `CartProvider`: mantiene `items: CartLine[]` y `isOpen: boolean`.
- Hidrata desde `localStorage` (key `arcea_cart_v1`) en el primer mount (`useEffect`); escribe
  en cada cambio. Maneja JSON inválido cayendo a `[]`.
- Hook `useCart()` expone:
  `items`, `addItem(line)`, `removeItem(key)`, `updateQty(key, qty)`, `clear()`,
  `totalItems` (suma de cantidades), `subtotal` (centavos), `isOpen`, `openCart()`, `closeCart()`.
- `addItem`: si la `key` ya existe, incrementa cantidad; si no, agrega. Cantidad mínima 1.
- `updateQty`: acota a `>= 1`; `0` o menos elimina la línea.

### B. Modelo de línea — `src/lib/cart/types.ts`

```ts
export type CartLine = {
  key: string;        // `${slug}__${size}__${color}`
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number;  // centavos (basePrice)
  quantity: number;
};
export const cartKey = (slug: string, size: string, color: string) =>
  `${slug}__${size}__${color}`;
```

### C. Componentes y páginas

- **`AddToCart`** (`src/components/cart/add-to-cart.tsx`, client): recibe
  `{ slug, name, image, basePrice, sizes, colors }`. Selector de talle (obligatorio) y de color
  (obligatorio si hay >1; si hay 0/1 se usa el único). Botón "Agregar al carrito" deshabilitado
  hasta elegir talle. Al agregar: `addItem` + `openCart` + toast. Reemplaza el bloque del botón
  deshabilitado actual en el detalle.
- **`CartSheet`** (`src/components/cart/cart-sheet.tsx`, client): drawer lateral (overlay +
  panel deslizante con Tailwind, mobile-first). Lee `useCart`. Lista `CartLineRow`, subtotal,
  CTAs a `/cart` y `/checkout`, botón cerrar. Estado vacío. Se monta global en el layout raíz.
- **`CartLineRow`** (`src/components/cart/cart-line-row.tsx`, client): fila reutilizable
  (imagen, nombre, talle/color, precio, stepper ± , eliminar). Usada en el drawer y en `/cart`.
- **Header** (`src/components/storefront/header.tsx`): el botón de carrito usa `useCart` →
  badge con `totalItems` y `openCart()` al click.
- **`/cart`** (`src/app/(storefront)/cart/page.tsx`): vista completa client (lista de
  `CartLineRow`, subtotal, "seguir comprando" + "ir a checkout"). Estado vacío branded.
- **`/checkout`** (`src/app/(storefront)/checkout/page.tsx`): **demo**. Resumen del pedido
  (líneas + subtotal + envío "a calcular" + total) y un formulario visual (email de invitado,
  nombre, dirección) **no funcional**, con aviso destacado *"El pago se habilita pronto
  (MercadoPago)"* y botón "Finalizar compra" deshabilitado. Si el carrito está vacío, muestra
  estado vacío con link a la colección.

### D. Montaje global

- `src/app/layout.tsx` (raíz) envuelve `{children}` con `<CartProvider>` y monta `<CartSheet />`
  una sola vez (disponible en cualquier página). El `<Toaster />` ya está montado.

## 5. Mapa de archivos

**Nuevos:**
```
src/lib/cart/types.ts
src/lib/cart/cart-context.tsx
src/components/cart/add-to-cart.tsx
src/components/cart/cart-sheet.tsx
src/components/cart/cart-line-row.tsx
src/app/(storefront)/cart/page.tsx
src/app/(storefront)/checkout/page.tsx
```

**Modificados:**
```
src/app/layout.tsx                                  # CartProvider + CartSheet global
src/components/storefront/header.tsx                 # badge + abrir drawer
src/app/(storefront)/products/[slug]/page.tsx        # usar <AddToCart/> en vez del botón deshabilitado
ROADMAP.md                                          # marcar avance Fase 3
```

## 6. Comportamiento y bordes

- **Precios** en centavos; formatear con `formatPrice` (`src/lib/format.ts`).
- **Talle obligatorio** para agregar; color obligatorio solo si el producto tiene >1 color.
- **Dedup** por `key`; misma variante suma cantidad.
- **Stepper**: mínimo 1; eliminar quita la línea. (Sin tope de stock real en esta fase.)
- **Persistencia**: sobrevive recargas y pestañas; JSON corrupto → carrito vacío.
- **Hidratación**: el badge y el carrito sólo muestran datos tras montar en cliente (evitar
  mismatch SSR: render inicial sin contar hasta `mounted`).
- **Checkout demo**: no hace POST, no crea órdenes, no cobra. Botón deshabilitado + aviso.

## 7. Verificación

- Gate por tarea: `npm run build` (ESLint + TypeScript) en verde.
- Como **sí es testeable sin backend**, verificación final en navegador con Playwright:
  agregar al carrito, ver badge, abrir drawer, cambiar cantidades, recargar y confirmar
  persistencia, ver `/cart` y `/checkout`.

## 8. Fuera de alcance

Órdenes, descuento de stock, pago real (MercadoPago + webhook), merge carrito→usuario,
validación de stock/precio por variante. Entran al conectar Supabase + MercadoPago (Fases 3 resto / 4).
