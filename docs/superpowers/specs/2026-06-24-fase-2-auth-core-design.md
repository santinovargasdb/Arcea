# Fase 2 — Auth core · Diseño

**Proyecto:** Arcea Estudio (tienda de ropa full-stack)
**Fecha:** 2026-06-24
**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Auth + Postgres + RLS) · `@supabase/ssr`
**Alcance elegido:** *Auth core completo* — registro/login/logout, olvido + reset de contraseña, `profiles` con rol y RLS, gating de `/account`, y página de perfil editable.

---

## 1. Contexto y objetivo

La Fase 1 (catálogo) está construida y pusheada. La Fase 2 agrega **cuentas de usuario**:
los clientes pueden registrarse, iniciar sesión, recuperar la contraseña y editar su perfil.
Es la base de identidad sobre la que después se apoyan carrito/checkout (Fase 3) y el panel
admin (Fase 5).

**Método de autenticación:** email + contraseña, con recuperación/reset. (Sin OAuth ni magic
link por ahora; se pueden sumar después sin reescribir lo de acá.)

## 2. Principio rector — construcción "a ciegas"

A diferencia del catálogo, **la auth necesita un backend Supabase real** para funcionar:
Supabase Auth *es* el servidor de auth, no hay "modo seed". Decisión del usuario: construir
ahora el código completo y **activarlo cuando se conecte Supabase** (crear proyecto + `.env.local`
+ correr migraciones).

Para que la app siga corriendo sin `.env` (como desde la Fase 0):

- Reusar el flag `isSupabaseConfigured = Boolean(NEXT_PUBLIC_SUPABASE_URL)` (ya existe en `queries.ts`;
  se extrae a un módulo compartible, p. ej. `src/lib/supabase/config.ts`).
- Las páginas de auth y `/account`, si `!isSupabaseConfigured`, muestran un aviso
  *"Auth disponible al conectar Supabase"* en lugar de intentar llamar a Supabase y romper.
- Las Server Actions, si `!isSupabaseConfigured`, devuelven `{ error: "Auth no configurada todavía." }`.
- El middleware ya tolera la ausencia de `.env` (no toca nada si no hay URL).

**Criterio de éxito de la sesión:** `npm run build` pasa (typecheck + lint), las rutas nuevas
aparecen en el output, y el código queda listo para activarse seteando `.env.local`.

## 3. Alcance

**Incluye:**
- Migración `0003_profiles_auth.sql`: `profiles`, enum de rol, triggers, RLS.
- Páginas `(auth)`: `/login`, `/register`, `/forgot-password`, `/reset-password`.
- Route Handler `app/auth/callback/route.ts` (intercambio de `code` por sesión).
- Server Actions de auth y de perfil; validaciones zod.
- Gating de `/account` en el middleware + doble verificación en el layout server.
- Route group `(account)` con página de perfil editable.
- Header con estado de sesión (cuenta/login + logout).
- Tipos `profiles` en `database.types.ts` (a mano; regenerar al conectar).

**No incluye (fases futuras):**
- CRUD de direcciones y shell de historial de pedidos (se hacen cuando la Fase 3 los use).
- Gating y UI de `/admin` (Fase 5) — solo se deja el patrón preparado.
- OAuth / magic link.
- Deploy (bloqueante externo: cuentas Supabase + Vercel).

## 4. Arquitectura

### A. Capa de datos — `supabase/migrations/0003_profiles_auth.sql`

```
enum user_role : 'customer' | 'admin'

table public.profiles
  id          uuid PK references auth.users(id) on delete cascade
  full_name   text
  phone       text
  role        user_role not null default 'customer'
  created_at  timestamptz not null default now()
  updated_at  timestamptz not null default now()   -- trigger set_updated_at() (Fase 1)
```

- **Alta automática:** función `handle_new_user()` (`security definer`) + trigger
  `after insert on auth.users` → inserta el profile con `role='customer'` tomando
  `full_name` de `new.raw_user_meta_data->>'full_name'`.
- **RLS** (habilitada):
  - `profiles_select_own` — `for select using (auth.uid() = id)`.
  - `profiles_update_own` — `for update using (auth.uid() = id) with check (auth.uid() = id)`.
  - Sin policy de `insert`/`delete` para clientes (insert lo hace el trigger security-definer;
    delete via cascade de `auth.users`).
- **Anti-escalada de rol:** trigger `before update` `prevent_role_change()` —
  si `new.role <> old.role` y el ejecutor no es `service_role`, restaura `new.role := old.role`.
  Así, aun con permiso de update sobre la propia fila, un cliente no puede subirse a `admin`.
  La gestión de roles vivirá en la Fase 5 vía service-role / admin client.
- **Helper** `public.is_admin()` (`security definer`, lee `role` del `auth.uid()`) — se deja
  listo para reusar en las RLS de escritura admin de fases futuras.

### B. Flujos y rutas de auth

- **Route group `(auth)`** con layout propio: centrado, branding Arcea, sin header/footer de
  tienda. Mobile-first.
- **Páginas:**
  - `/login` — email + contraseña → `signIn`; links a registro y a "olvidé mi contraseña".
  - `/register` — full_name + email + contraseña (+ confirmación) → `signUp`.
  - `/forgot-password` — email → `requestPasswordReset` (envía mail con link al callback).
  - `/reset-password` — nueva contraseña → `updatePassword` (tras volver del callback con sesión).
- **Route Handler** `app/auth/callback/route.ts`: lee `code` de la query, llama
  `supabase.auth.exchangeCodeForSession(code)`, y redirige a `next` (o `/account`).
  Sirve para confirmación de email y para el flujo de reset.
- **Server Actions** — `src/actions/auth.ts` (`"use server"`):
  `signUp`, `signIn`, `signOut`, `requestPasswordReset`, `updatePassword`.
  Devuelven `{ error?: string }` para render en la UI; en éxito hacen `redirect()`.
- **Validaciones** — `src/lib/validations/auth.ts` con zod: email válido, password mínimo
  (p. ej. ≥ 8), confirmación que coincide, `full_name` no vacío. Se validan **en el server**
  (Server Action) y en el cliente (react-hook-form).
- **Formularios:** react-hook-form + zod (`@hookform/resolvers`) para validación inline en
  mobile; los componentes llaman a la Server Action y muestran errores + toasts `sonner`.
- **shadcn/ui:** agregar los componentes que falten (`input`, `label`, `button`, `form`, `card`).

### C. Gating, cuenta y header

- **Middleware** (`src/lib/supabase/middleware.ts`): después de `getUser()` —sin meter lógica
  entre `createServerClient` y `getUser()`— si el pathname es `/account*` y no hay user,
  redirigir a `/login?next=<pathname>`. El gating de `/admin` se deja comentado/preparado para
  la Fase 5.
- **Route group `(account)`** con layout protegido: además del middleware, el layout server
  hace `getUser()` y redirige si no hay sesión (defensa en profundidad, como exige el `CLAUDE.md`:
  verificar autorización en server además del middleware).
- **`/account` (perfil):** muestra el email (read-only) y `full_name` + `phone` editables vía
  Server Action `updateProfile` (`src/actions/profile.ts`); lee el profile con el server client
  (RLS lo limita al propio). Botón de cerrar sesión.
- **Header:** hoy es client component con íconos estáticos. El ícono de usuario pasa a linkear a
  `/account` si hay sesión o `/login` si no, con opción de logout. La sesión se resuelve en el
  layout server (`getUser()`) y se pasa al Header como prop (evita un client fetch).

## 5. Mapa de archivos

**Nuevos:**
```
supabase/migrations/0003_profiles_auth.sql
src/lib/supabase/config.ts              # isSupabaseConfigured compartido
src/lib/validations/auth.ts             # schemas zod
src/actions/auth.ts                     # signUp/signIn/signOut/requestPasswordReset/updatePassword
src/actions/profile.ts                  # updateProfile
src/app/(auth)/layout.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/reset-password/page.tsx
src/app/auth/callback/route.ts
src/app/(account)/layout.tsx
src/app/(account)/account/page.tsx
src/components/auth/*                    # formularios client (login/register/...)
src/components/account/profile-form.tsx
src/components/ui/*                      # shadcn input/label/button/form/card (los que falten)
```

**Modificados:**
```
src/lib/supabase/middleware.ts          # gating /account
src/lib/db/queries.ts                   # usar isSupabaseConfigured desde config.ts
src/components/storefront/header.tsx     # estado de sesión + logout
src/app/(storefront)/layout.tsx          # pasar sesión al Header
src/types/database.types.ts             # tabla profiles + enum user_role
ROADMAP.md                              # marcar avances Fase 2
```

## 6. Seguridad

- **Rol protegido contra auto-escalada** (trigger `prevent_role_change`).
- **RLS en `profiles`**; el cliente solo ve/edita su propia fila.
- **Service-role** (`admin.ts`) solo en servidor; nunca con prefijo `NEXT_PUBLIC_`.
- **Doble verificación** de `/account`: middleware + layout server.
- Validación de inputs con zod en el server (no confiar solo en el cliente).
- `getUser()` (revalida con Supabase), no `getSession()`, para decisiones de auth en el server.

## 7. Notas de Next.js 16 a verificar en implementación

`CLAUDE.md` advierte que Next 16 puede diferir del conocimiento previo. Antes de escribir, revisar
en `node_modules/next/dist/docs/`:
- Server Actions: firma, `redirect()` dentro de actions, manejo de errores/estado.
- Route Handlers: lectura de query params y `redirect`/`NextResponse` en el callback.
- Middleware: API de redirect y cookies con `@supabase/ssr`.
- `cookies()` / `await cookies()` en server (ya se usa así en `server.ts`).

## 8. Fuera de alcance

Direcciones (CRUD), historial de pedidos, gating/UI de admin, OAuth, magic link y deploy.
Cada uno entra en su fase correspondiente del `ROADMAP.md`.
