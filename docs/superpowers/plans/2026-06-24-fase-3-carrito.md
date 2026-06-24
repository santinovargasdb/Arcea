# Fase 3 (parte 1) — Carrito client-side + checkout demo · Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Carrito de compras 100% client-side (estado + `localStorage`) con drawer, badge, páginas `/cart` y `/checkout` demo, habilitando el botón "Agregar al carrito" del detalle.

**Architecture:** React Context (`CartProvider`) montado en el layout raíz, persistido en `localStorage`, consumido por header (badge + abrir drawer), `AddToCart` (detalle), `CartSheet` (drawer global), `/cart` y `/checkout` (demo). Sin backend: el checkout no crea órdenes ni cobra.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 (paleta de marca) · sonner · lucide-react.

## Global Constraints

- **Idioma:** UI/textos en **español**; identificadores/archivos en **inglés**.
- **Mobile-first:** estilos base = móvil; `sm:`/`lg:` para arriba.
- **Precios en centavos** (enteros); formatear con `formatPrice` de `src/lib/format.ts`.
- **Paleta de marca** (clases Tailwind ya definidas en `globals.css`): `cream`, `paper`, `beige`,
  `beige-soft`, `green`, `green-mid`, `green-light`, `ink`, `burgundy`.
- **`useCart()` solo dentro de `<CartProvider>`** (montado en el layout raíz).
- **Sin backend:** el carrito vive en el cliente; el checkout es una maqueta no funcional.

## Estrategia de verificación

- **Gate por tarea:** `npm run build` (ESLint + TypeScript) en verde. (No hay test runner; misma
  decisión que en las fases previas.)
- **Esta fase SÍ es testeable en navegador:** la Task 9 verifica con Playwright (agregar, badge,
  drawer, cantidades, persistencia al recargar, `/cart`, `/checkout`).

## Estructura de archivos

**Nuevos:**
```
src/lib/cart/types.ts                       # CartLine + cartKey
src/lib/cart/cart-context.tsx               # CartProvider + useCart + localStorage
src/components/cart/cart-line-row.tsx        # fila reutilizable (drawer y /cart)
src/components/cart/cart-sheet.tsx           # drawer global
src/components/cart/add-to-cart.tsx          # selección de variante + agregar (detalle)
src/app/(storefront)/cart/page.tsx           # vista completa del carrito
src/app/(storefront)/checkout/page.tsx       # checkout demo
```

**Modificados:**
```
src/app/layout.tsx                                   # CartProvider + CartSheet global
src/components/storefront/header.tsx                  # badge + abrir drawer
src/app/(storefront)/products/[slug]/page.tsx         # <AddToCart/> en vez del botón deshabilitado
ROADMAP.md                                           # marcar avance Fase 3
```

---

### Task 1: Modelo de línea + Context del carrito

**Files:**
- Create: `src/lib/cart/types.ts`
- Create: `src/lib/cart/cart-context.tsx`

**Interfaces:**
- Produces: `type CartLine`, `cartKey(slug,size,color)`; `CartProvider`; `useCart()` →
  `{ items, mounted, totalItems, subtotal, isOpen, openCart, closeCart, addItem, removeItem, updateQty, clear }`.
  `addItem(input)` con `input: { slug, name, image, size, color, unitPrice, quantity? }`.

- [ ] **Step 1: Crear los tipos**

```ts
// src/lib/cart/types.ts
export type CartLine = {
  key: string; // `${slug}__${size}__${color}`
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number; // centavos
  quantity: number;
};

export const cartKey = (slug: string, size: string, color: string) =>
  `${slug}__${size}__${color}`;
```

- [ ] **Step 2: Crear el provider y el hook**

```tsx
// src/lib/cart/cart-context.tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { cartKey, type CartLine } from "@/lib/cart/types";

const STORAGE_KEY = "arcea_cart_v1";

type AddInput = Omit<CartLine, "key" | "quantity"> & { quantity?: number };

type CartContextValue = {
  items: CartLine[];
  mounted: boolean;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: AddInput) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, quantity: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hidratar desde localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // JSON corrupto: carrito vacío
    }
    setMounted(true);
  }, []);

  // Persistir en cada cambio (después de montar)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // sin espacio / modo privado: ignorar
    }
  }, [items, mounted]);

  const addItem = useCallback((input: AddInput) => {
    const key = cartKey(input.slug, input.size, input.color);
    const qty = input.quantity ?? 1;
    setItems((prev) => {
      const i = prev.findIndex((l) => l.key === key);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + qty };
        return next;
      }
      return [...prev, { ...input, key, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const updateQty = useCallback((key: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, quantity } : l)),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalItems = useMemo(
    () => items.reduce((n, l) => n + l.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
    [items],
  );

  const value: CartContextValue = {
    items,
    mounted,
    totalItems,
    subtotal,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    updateQty,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila (archivos nuevos, aún sin consumir).

- [ ] **Step 4: Commit**

```bash
git add src/lib/cart/types.ts src/lib/cart/cart-context.tsx
git commit -m "feat(cart): context del carrito con persistencia en localStorage"
```

---

### Task 2: Fila de línea reutilizable

**Files:**
- Create: `src/components/cart/cart-line-row.tsx`

**Interfaces:**
- Consumes: `useCart` (`updateQty`, `removeItem`), `CartLine`, `formatPrice`.
- Produces: `<CartLineRow line={CartLine} />`.

- [ ] **Step 1: Crear el componente**

```tsx
// src/components/cart/cart-line-row.tsx
"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/lib/cart/types";

export function CartLineRow({ line }: { line: CartLine }) {
  const { updateQty, removeItem } = useCart();

  return (
    <div className="flex gap-3 py-4">
      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-beige-soft">
        {line.image && (
          <Image
            src={line.image}
            alt={line.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-heading text-sm text-ink">{line.name}</p>
            <p className="mt-0.5 text-xs text-ink/60">
              {line.size} · {line.color}
            </p>
          </div>
          <button
            type="button"
            aria-label="Eliminar"
            onClick={() => removeItem(line.key)}
            className="text-ink/40 transition-colors hover:text-burgundy"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Restar"
              onClick={() => updateQty(line.key, line.quantity - 1)}
              className="grid h-7 w-7 place-items-center rounded-full border border-beige transition-colors hover:border-green"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-sm">{line.quantity}</span>
            <button
              type="button"
              aria-label="Sumar"
              onClick={() => updateQty(line.key, line.quantity + 1)}
              className="grid h-7 w-7 place-items-center rounded-full border border-beige transition-colors hover:border-green"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="text-sm font-medium text-green">
            {formatPrice(line.unitPrice * line.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila. Si `Minus`/`Plus` no existieran en `lucide-react`, sustituir por texto `−`/`+`
en `<button>` (improbable: son íconos estándar).

- [ ] **Step 3: Commit**

```bash
git add src/components/cart/cart-line-row.tsx
git commit -m "feat(cart): fila de línea con stepper y eliminar"
```

---

### Task 3: Drawer del carrito (`CartSheet`)

**Files:**
- Create: `src/components/cart/cart-sheet.tsx`

**Interfaces:**
- Consumes: `useCart`, `CartLineRow`, `formatPrice`.
- Produces: `<CartSheet />` (se monta global en Task 4).

- [ ] **Step 1: Crear el drawer**

```tsx
// src/components/cart/cart-sheet.tsx
"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { CartLineRow } from "./cart-line-row";

export function CartSheet() {
  const { items, isOpen, closeCart, subtotal, totalItems, mounted } = useCart();
  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-ink/40 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-cream shadow-xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-beige px-5 py-4">
          <h2 className="font-heading text-lg text-green">
            Tu carrito{totalItems > 0 ? ` (${totalItems})` : ""}
          </h2>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={closeCart}
            className="text-ink/60 transition-colors hover:text-burgundy"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-heading text-xl text-green">Tu carrito está vacío</p>
            <Link
              href="/products"
              onClick={closeCart}
              className="text-xs uppercase tracking-wider text-green-mid hover:text-burgundy"
            >
              Ver la colección
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-beige overflow-y-auto px-5">
              {items.map((line) => (
                <CartLineRow key={line.key} line={line} />
              ))}
            </div>
            <footer className="border-t border-beige px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink/70">Subtotal</span>
                <span className="font-medium text-green">{formatPrice(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ink/50">
                Envío e impuestos se calculan en el checkout.
              </p>
              <div className="mt-4 grid gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full rounded-full bg-green px-6 py-3 text-center text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy"
                >
                  Finalizar compra
                </Link>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full rounded-full border border-beige px-6 py-3 text-center text-sm font-medium text-ink transition-colors hover:border-green"
                >
                  Ver carrito
                </Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 3: Commit**

```bash
git add src/components/cart/cart-sheet.tsx
git commit -m "feat(cart): drawer del carrito"
```

---

### Task 4: Montar `CartProvider` + `CartSheet` en el layout raíz

**Files:**
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `CartProvider`, `CartSheet`.

- [ ] **Step 1: Envolver el árbol con el provider y montar el drawer**

Reemplazar el `<body>` de `src/app/layout.tsx` por esta versión (agregando los dos imports
arriba, junto a los demás):

Imports a agregar:
```tsx
import { CartProvider } from "@/lib/cart/cart-context";
import { CartSheet } from "@/components/cart/cart-sheet";
```

Body:
```tsx
      <body className="flex min-h-full flex-col">
        <CartProvider>
          {children}
          <CartSheet />
        </CartProvider>
        <Toaster richColors position="bottom-center" />
      </body>
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; el catálogo sigue funcionando.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(cart): montar provider y drawer en el layout raíz"
```

---

### Task 5: Badge y apertura del drawer en el header

**Files:**
- Modify: `src/components/storefront/header.tsx`

**Interfaces:**
- Consumes: `useCart` (`totalItems`, `openCart`, `mounted`).

- [ ] **Step 1: Importar `useCart`**

Agregar el import junto a los demás de `src/components/storefront/header.tsx`:
```tsx
import { useCart } from "@/lib/cart/cart-context";
```

- [ ] **Step 2: Leer el carrito en el componente**

Justo después de `const [open, setOpen] = useState(false);` agregar:
```tsx
  const { totalItems, openCart, mounted } = useCart();
```

- [ ] **Step 3: Reemplazar el botón de carrito**

Reemplazar el bloque actual del botón "Carrito":
```tsx
          <button aria-label="Carrito" className="relative transition-colors hover:text-burgundy">
            <ShoppingBag className="h-5 w-5" />
          </button>
```
por:
```tsx
          <button
            type="button"
            aria-label="Carrito"
            onClick={openCart}
            className="relative transition-colors hover:text-burgundy"
          >
            <ShoppingBag className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-burgundy px-1 text-[0.6rem] font-bold leading-none text-cream">
                {totalItems}
              </span>
            )}
          </button>
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 5: Commit**

```bash
git add src/components/storefront/header.tsx
git commit -m "feat(cart): badge de cantidad y apertura del drawer en el header"
```

---

### Task 6: `AddToCart` en el detalle de producto

**Files:**
- Create: `src/components/cart/add-to-cart.tsx`
- Modify: `src/app/(storefront)/products/[slug]/page.tsx`

**Interfaces:**
- Consumes: `useCart` (`addItem`, `openCart`), `Color` de `@/lib/db/catalog-types`, `toast`.
- Produces: `<AddToCart slug name image basePrice sizes colors />`.

- [ ] **Step 1: Crear el componente de agregar**

```tsx
// src/components/cart/add-to-cart.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart/cart-context";
import type { Color } from "@/lib/db/catalog-types";

type Props = {
  slug: string;
  name: string;
  image: string;
  basePrice: number;
  sizes: string[];
  colors: Color[];
};

export function AddToCart({ slug, name, image, basePrice, sizes, colors }: Props) {
  const { addItem, openCart } = useCart();
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);
  const [color, setColor] = useState<string | null>(
    colors.length <= 1 ? colors[0]?.name ?? "Único" : null,
  );

  const needsSize = sizes.length > 0;
  const canAdd = (!needsSize || !!size) && (colors.length <= 1 || !!color);

  function handleAdd() {
    if (needsSize && !size) {
      toast.error("Elegí un talle.");
      return;
    }
    addItem({
      slug,
      name,
      image,
      size: size ?? "Único",
      color: color ?? "Único",
      unitPrice: basePrice,
    });
    openCart();
    toast.success("Agregado al carrito");
  }

  return (
    <div className="space-y-5">
      {sizes.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-green-mid">Talle</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`grid h-10 min-w-10 place-items-center rounded-md border px-3 text-sm font-medium transition-colors ${
                  size === s
                    ? "border-green bg-green text-cream"
                    : "border-beige text-ink hover:border-green"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-green-mid">
            Color{color ? `: ${color}` : ""}
          </p>
          <div className="mt-2 flex gap-2">
            {colors.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                onClick={() => setColor(c.name)}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  color === c.name ? "border-green" : "border-black/10"
                }`}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!canAdd}
          className="w-full rounded-full bg-green px-8 py-4 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Agregar al carrito
        </button>
        {needsSize && !size && (
          <p className="mt-2 text-xs text-ink/50">Elegí un talle para continuar.</p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Usar `AddToCart` en el detalle**

En `src/app/(storefront)/products/[slug]/page.tsx`:

1. Agregar el import (junto a los demás):
```tsx
import { AddToCart } from "@/components/cart/add-to-cart";
```

2. Reemplazar TODO el bloque que va desde `{/* Talles */}` hasta el cierre del `<div className="mt-6">`
del botón deshabilitado (es decir, los bloques Talles, Colores, la línea de stock, y el bloque del
botón "Agregar al carrito" + la nota "El carrito y el checkout se habilitan…") por:
```tsx
          {/* Stock */}
          <p className="mt-6 text-sm">
            {lowStock ? (
              <span className="font-medium text-burgundy">¡Últimas unidades!</span>
            ) : (
              <span className="text-green-mid">En stock</span>
            )}
          </p>

          {/* Selección de variante + agregar */}
          <div className="mt-6">
            <AddToCart
              slug={product.slug}
              name={product.name}
              image={product.image}
              basePrice={product.basePrice}
              sizes={product.sizes}
              colors={product.colors}
            />
          </div>
```
(Conservar intactos los bloques anteriores: categoría, nombre, precio y descripción.)

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila; `ƒ /products/[slug]` sigue presente.

- [ ] **Step 4: Commit**

```bash
git add src/components/cart/add-to-cart.tsx "src/app/(storefront)/products/[slug]/page.tsx"
git commit -m "feat(cart): selección de variante y agregar al carrito en el detalle"
```

---

### Task 7: Página `/cart`

**Files:**
- Create: `src/app/(storefront)/cart/page.tsx`

**Interfaces:**
- Consumes: `useCart`, `CartLineRow`, `formatPrice`.

- [ ] **Step 1: Crear la página**

```tsx
// src/app/(storefront)/cart/page.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";
import { CartLineRow } from "@/components/cart/cart-line-row";

export default function CartPage() {
  const { items, subtotal, mounted } = useCart();

  if (!mounted) return <div className="min-h-[50vh]" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-heading text-3xl text-green">Tu carrito está vacío</h1>
        <p className="mt-2 text-ink/60">Todavía no agregaste prendas.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-green px-8 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy"
        >
          Ver la colección
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h1 className="font-heading text-4xl font-medium text-green">Tu carrito</h1>
      <div className="mt-8 divide-y divide-beige border-y border-beige">
        {items.map((line) => (
          <CartLineRow key={line.key} line={line} />
        ))}
      </div>
      <div className="mt-6 flex flex-col items-end gap-3">
        <div className="flex w-full max-w-xs items-center justify-between">
          <span className="text-ink/70">Subtotal</span>
          <span className="text-lg font-medium text-green">{formatPrice(subtotal)}</span>
        </div>
        <p className="text-xs text-ink/50">Envío e impuestos se calculan en el checkout.</p>
        <div className="flex flex-wrap justify-end gap-3">
          <Link
            href="/products"
            className="rounded-full border border-beige px-6 py-3 text-sm font-medium transition-colors hover:border-green"
          >
            Seguir comprando
          </Link>
          <Link
            href="/checkout"
            className="rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy"
          >
            Ir a checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; aparece `/cart`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(storefront)/cart/page.tsx"
git commit -m "feat(cart): página /cart"
```

---

### Task 8: Página `/checkout` (demo)

**Files:**
- Create: `src/app/(storefront)/checkout/page.tsx`

**Interfaces:**
- Consumes: `useCart`, `formatPrice`.

- [ ] **Step 1: Crear la página demo**

```tsx
// src/app/(storefront)/checkout/page.tsx
"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/cart-context";
import { formatPrice } from "@/lib/format";

const FIELDS = [
  { id: "email", label: "Email", type: "email", placeholder: "tu@email.com" },
  { id: "name", label: "Nombre y apellido", type: "text", placeholder: "" },
  { id: "address", label: "Dirección", type: "text", placeholder: "" },
  { id: "city", label: "Ciudad", type: "text", placeholder: "" },
];

export default function CheckoutPage() {
  const { items, subtotal, mounted } = useCart();

  if (!mounted) return <div className="min-h-[50vh]" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-heading text-3xl text-green">No hay nada para pagar</h1>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-green px-8 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy"
        >
          Ver la colección
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <h1 className="font-heading text-4xl font-medium text-green">Checkout</h1>

      <div className="mt-4 rounded-xl border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-sm text-burgundy">
        Vista previa: el pago todavía no está activo. Se habilita pronto con MercadoPago.
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <h2 className="font-heading text-xl text-green">Tus datos</h2>
          {FIELDS.map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="text-xs uppercase tracking-wider text-green-mid">
                {f.label}
              </label>
              <input
                id={f.id}
                type={f.type}
                placeholder={f.placeholder}
                disabled
                className="mt-1.5 w-full rounded-lg border border-beige bg-cream/60 px-4 py-2.5 text-sm outline-none"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled
            className="w-full rounded-full bg-green px-8 py-4 text-sm font-semibold uppercase tracking-wider text-cream opacity-50"
          >
            Pagar con MercadoPago
          </button>
        </form>

        <div className="rounded-2xl border border-beige bg-paper p-6">
          <h2 className="font-heading text-xl text-green">Tu pedido</h2>
          <div className="mt-4 divide-y divide-beige">
            {items.map((line) => (
              <div key={line.key} className="flex justify-between gap-3 py-3 text-sm">
                <span className="text-ink/80">
                  {line.quantity}× {line.name}
                  <span className="block text-xs text-ink/50">
                    {line.size} · {line.color}
                  </span>
                </span>
                <span className="font-medium text-green">
                  {formatPrice(line.unitPrice * line.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-beige pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-ink/70">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/70">Envío</span>
              <span className="text-ink/50">A calcular</span>
            </div>
            <div className="flex justify-between pt-2 font-medium text-green">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; aparece `/checkout`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(storefront)/checkout/page.tsx"
git commit -m "feat(checkout): página demo de checkout (sin pago real)"
```

---

### Task 9: Roadmap, build final y verificación en navegador

**Files:**
- Modify: `ROADMAP.md`

- [ ] **Step 1: Marcar avance en `ROADMAP.md`**

Reemplazar el encabezado y los ítems de la Fase 3 por:
```markdown
## Fase 3 — Carrito y checkout `[~]`

- [x] Carrito client-side (estado + `localStorage`), drawer, badge, `/cart`
- [x] `AddToCart` con selección de variante en el detalle
- [~] Checkout: maqueta demo lista; órdenes, descuento de stock y merge invitado→usuario esperan Supabase
- [ ] Pago real (MercadoPago + webhook) — Fase 4
- [ ] Deploy

> 💡 El carrito funciona sin backend (persiste en el navegador). El checkout es una vista previa
> no funcional hasta conectar Supabase + MercadoPago.
```

- [ ] **Step 2: Build final**

Run: `npm run build`
Expected: compila; el output incluye `/cart`, `/checkout`, `ƒ /products/[slug]`.

- [ ] **Step 3: Verificación en navegador (Playwright)**

Levantar `npm run dev` y con Playwright MCP verificar el flujo:
1. Navegar a `/products/sweater-bruma` → elegir talle → "Agregar al carrito".
2. Confirmar: aparece el toast, se abre el drawer, el badge del header muestra 1.
3. En el drawer, sumar cantidad (→ 2) y confirmar subtotal = 2× precio.
4. Ir a `/cart`, recargar la página, confirmar que el carrito **persiste**.
5. Ir a `/checkout`, confirmar el resumen y el aviso de "pago no activo".

- [ ] **Step 4: Commit**

```bash
git add ROADMAP.md
git commit -m "docs: marcar avance de la Fase 3 (carrito) en el roadmap"
```

---

## Self-review (hecho al escribir el plan)

- **Cobertura del spec:** ✅ context+persistencia (T1), fila (T2), drawer (T3), montaje global (T4),
  badge+abrir (T5), AddToCart+detalle (T6), `/cart` (T7), `/checkout` demo (T8), roadmap+verif (T9).
- **Consistencia de tipos:** `CartLine`/`cartKey` (T1) se usan igual en T2/T3/T6/T7/T8;
  `useCart()` expone el mismo set en todos los consumidores; `addItem` recibe `AddInput`
  (sin `key`/`quantity`), tal como lo llama `AddToCart` (T6).
- **Sin placeholders:** todo el código está completo.
- **Decisión de testing:** gate por `npm run build`; verificación real en navegador en T9.

## Follow-ups (fuera de esta fase)

1. Al conectar Supabase: tablas `carts`/`cart_items`, **merge** del carrito local al loguear,
   y órdenes (`orders`/`order_items`) con descuento de stock transaccional.
2. Fase 4: pago real con MercadoPago (preferencia + webhook idempotente).
3. Validación de stock real y precio por variante en el carrito.
