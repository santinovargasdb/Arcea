# Fase 2 — Auth core · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar cuentas de cliente (registro/login/logout, olvido+reset de contraseña, perfil editable) con `profiles`+rol+RLS y gating de `/account`, construido "a ciegas" para activarse al conectar Supabase.

**Architecture:** Server Actions (`'use server'`) para todas las mutaciones de auth/perfil, validadas con zod; Route Handler para el callback de Supabase (`exchangeCodeForSession`); gating en el Proxy (ex-middleware) + doble verificación en el layout server de `/account`; formularios client con react-hook-form. Todo se desactiva con un aviso si `!isSupabaseConfigured` para que la app siga compilando y corriendo sin `.env`.

**Tech Stack:** Next.js 16 (App Router) · React 19 · TypeScript · `@supabase/ssr` · zod 4 · react-hook-form + `@hookform/resolvers` · sonner · Tailwind v4 (paleta de marca).

## Global Constraints

- **Idioma:** UI/textos en **español**; identificadores/archivos/tablas/columnas en **inglés**.
- **Mobile-first:** estilos base = móvil; `sm:`/`lg:` para arriba.
- **Precios en centavos** (no aplica a esta fase, pero la convención sigue vigente).
- **`@supabase/ssr`:** `lib/supabase/server.ts` en RSC/Server Actions/Route Handlers (con `await cookies()`); `client.ts` en client components; `admin.ts` (service-role) solo servidor.
- **`SUPABASE_SERVICE_ROLE_KEY`** nunca con prefijo `NEXT_PUBLIC_`, nunca en cliente.
- **Autorización en el server** además del Proxy: cada Server Action verifica auth; `/account` se valida en su layout server con `getUser()` (no `getSession()`).
- **Next.js 16:** "Middleware" ahora se llama **Proxy** (mismo comportamiento; el `middleware.ts` actual sigue válido y el build lo etiqueta "Proxy (Middleware)"). `redirect` viene de `next/navigation`; `cookies()` es async; Server Actions son alcanzables por POST directo → validar siempre adentro.
- **zod 4.4.3** instalado: usar `z.email("…")` (no el deprecado `z.string().email()`).
- **sonner** ya está montado en `src/app/layout.tsx` (`<Toaster richColors position="bottom-center" />`): los forms llaman `toast()` directo, no hay que montarlo de nuevo.

## Estrategia de verificación (leer antes de empezar)

Esta fase se construye **sin backend Supabase** (decisión del usuario). Por eso:

- **No hay test runner en el proyecto** y la auth no se puede ejercitar sin un proyecto Supabase real. Montar Vitest + mocks de Supabase para forms que no pueden correr sería trabajo desechable (YAGNI).
- **Gate de verificación por tarea:** `npm run build` (corre **ESLint + TypeScript** + generación de rutas, como define `CLAUDE.md`). Es el criterio de éxito de esta fase: compila, tipa, y las rutas nuevas aparecen en el output.
- El **testing funcional/e2e de la auth** (registro real, confirmación de email, reset, gating) se hace en una sesión posterior, una vez conectado Supabase. Queda anotado como follow-up, no como parte de esta fase.

Cada tarea termina con `npm run build` en verde y un commit.

## Estructura de archivos

**Nuevos:**
```
supabase/migrations/0003_profiles_auth.sql   # profiles + enum + triggers + RLS + is_admin()
src/lib/supabase/config.ts                    # isSupabaseConfigured compartido
src/lib/auth/session.ts                        # getSessionUser() server helper
src/lib/validations/auth.ts                    # schemas zod
src/actions/auth.ts                            # signIn/signUp/signOut/requestPasswordReset/updatePassword
src/actions/profile.ts                         # updateProfile
src/app/auth/callback/route.ts                 # exchangeCodeForSession
src/app/(auth)/layout.tsx
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/reset-password/page.tsx
src/app/(account)/layout.tsx                   # protegido (getUser)
src/app/(account)/account/page.tsx
src/components/auth/text-field.tsx
src/components/auth/login-form.tsx
src/components/auth/register-form.tsx
src/components/auth/forgot-password-form.tsx
src/components/auth/reset-password-form.tsx
src/components/account/profile-form.tsx
```

**Modificados:**
```
src/lib/db/queries.ts                  # isSupabaseConfigured pasa a importarse de config.ts
src/lib/supabase/middleware.ts         # gating de /account
src/components/storefront/header.tsx    # prop isAuthenticated → user icon a /account o /login
src/app/(storefront)/layout.tsx         # async + pasa sesión al Header
src/types/database.types.ts            # tabla profiles + enum user_role
ROADMAP.md                             # marcar avances Fase 2
```

---

### Task 1: Flag `isSupabaseConfigured` compartido

**Files:**
- Create: `src/lib/supabase/config.ts`
- Modify: `src/lib/db/queries.ts:17-18`

**Interfaces:**
- Produces: `export const isSupabaseConfigured: boolean` desde `@/lib/supabase/config`.

- [ ] **Step 1: Crear el módulo de config**

```ts
// src/lib/supabase/config.ts
/**
 * ¿Hay Supabase configurado? Permite que la app corra sin backend:
 * el catálogo cae a datos seed y la auth se desactiva con un aviso
 * mientras no exista .env.local.
 */
export const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
```

- [ ] **Step 2: Reusar el flag en `queries.ts`**

Reemplazar la declaración local (líneas 17-18):
```ts
/** Cuando hay Supabase configurado usamos la base real; si no, datos locales. */
export const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
```
por una reexportación desde el módulo compartido:
```ts
/** Cuando hay Supabase configurado usamos la base real; si no, datos locales. */
import { isSupabaseConfigured } from "@/lib/supabase/config";
export { isSupabaseConfigured };
```
(El `import` debe ir con los demás imports al inicio del archivo; dejar el `export { isSupabaseConfigured }` donde estaba la const para no romper consumidores.)

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila sin errores; las rutas del catálogo siguen apareciendo.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase/config.ts src/lib/db/queries.ts
git commit -m "refactor(supabase): extraer isSupabaseConfigured a config.ts"
```

---

### Task 2: Migración `0003_profiles_auth.sql` + tipos

**Files:**
- Create: `supabase/migrations/0003_profiles_auth.sql`
- Modify: `src/types/database.types.ts`

**Interfaces:**
- Produces: tabla `profiles` (cols `id, full_name, phone, role, created_at, updated_at`), enum `user_role` (`'customer' | 'admin'`), funciones `handle_new_user()`, `prevent_role_change()`, `is_admin()`.

- [ ] **Step 1: Escribir la migración**

```sql
-- supabase/migrations/0003_profiles_auth.sql
-- ============================================================
--  Arcea Estudio · Fase 2 — Profiles, rol y RLS
-- ============================================================

create type public.user_role as enum ('customer', 'admin');

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  role       public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at: reutiliza set_updated_at() de la Fase 1 (0001_init_catalog.sql)
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Alta automática del profile al crear el usuario en auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Anti-escalada de rol: salvo el service-role, nadie cambia su propio role
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
  then
    new.role := old.role;  -- revierte el intento de cambio
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- Helper para RLS de escritura admin en fases futuras (Fase 5)
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ─── RLS ────────────────────────────────────────────────────
alter table public.profiles enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Sin policy de insert/delete para clientes:
--   insert lo hace handle_new_user() (security definer);
--   delete ocurre por cascade al borrar auth.users.
```

- [ ] **Step 2: Agregar `profiles` y el enum a los tipos**

En `src/types/database.types.ts`, dentro de `Tables`, después del bloque `product_images` (antes del cierre `};` de `Tables`), agregar:
```ts
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
```
Y reemplazar `Enums: Record<string, never>;` por:
```ts
    Enums: {
      user_role: "customer" | "admin";
    };
```

- [ ] **Step 3: Verificar build**

Run: `npm run build`
Expected: compila (los tipos nuevos no rompen nada; el SQL no se ejecuta todavía).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/0003_profiles_auth.sql src/types/database.types.ts
git commit -m "feat(db): profiles, rol y RLS anti-escalada (Fase 2)"
```

---

### Task 3: Schemas de validación zod

**Files:**
- Create: `src/lib/validations/auth.ts`

**Interfaces:**
- Produces: `loginSchema`/`LoginInput`, `registerSchema`/`RegisterInput`, `forgotPasswordSchema`/`ForgotPasswordInput`, `resetPasswordSchema`/`ResetPasswordInput`, `profileSchema`/`ProfileInput`.

- [ ] **Step 1: Escribir los schemas**

```ts
// src/lib/validations/auth.ts
import { z } from "zod";

const email = z.email("Ingresá un email válido.");
const password = z.string().min(8, "La contraseña debe tener al menos 8 caracteres.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Ingresá tu contraseña."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Ingresá tu nombre."),
    email,
    password,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Ingresá tu nombre."),
  phone: z.string().trim().max(30, "Teléfono demasiado largo.").optional(),
});
export type ProfileInput = z.infer<typeof profileSchema>;
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila. Si ESLint marca `z.email` como inexistente, confirmar `zod@^4` en `package.json` (ya está) — es API de zod 4.

- [ ] **Step 3: Commit**

```bash
git add src/lib/validations/auth.ts
git commit -m "feat(auth): schemas de validación zod"
```

---

### Task 4: Server Actions de auth

**Files:**
- Create: `src/actions/auth.ts`

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/server`, `isSupabaseConfigured`, schemas de Task 3.
- Produces: `type ActionResult = { ok: true } | { ok: false; error: string }`;
  `signIn(values: LoginInput): Promise<ActionResult>`,
  `signUp(values: RegisterInput): Promise<ActionResult>`,
  `signOut(): Promise<void>` (redirige),
  `requestPasswordReset(values: ForgotPasswordInput): Promise<ActionResult>`,
  `updatePassword(values: ResetPasswordInput): Promise<ActionResult>`.

- [ ] **Step 1: Escribir las actions**

```ts
// src/actions/auth.ts
"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth";

export type ActionResult = { ok: true } | { ok: false; error: string };

const NOT_CONFIGURED = "La autenticación se habilita al conectar Supabase.";
const fail = (error: string): ActionResult => ({ ok: false, error });

/** Base URL del sitio para los emailRedirectTo/redirectTo del callback. */
async function siteUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function signIn(values: LoginInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) return fail("Datos inválidos.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return fail("Email o contraseña incorrectos.");
  return { ok: true };
}

export async function signUp(values: RegisterInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) return fail("Datos inválidos.");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=/account`,
    },
  });
  if (error) return fail("No pudimos crear la cuenta. Probá con otro email.");
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}

export async function requestPasswordReset(
  values: ForgotPasswordInput,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return fail("Ingresá un email válido.");

  const supabase = await createClient();
  // No revelamos si el email existe: siempre devolvemos ok.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteUrl()}/auth/callback?next=/reset-password`,
  });
  return { ok: true };
}

export async function updatePassword(
  values: ResetPasswordInput,
): Promise<ActionResult> {
  if (!isSupabaseConfigured) return fail(NOT_CONFIGURED);
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) return fail("Datos inválidos.");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) return fail("No pudimos actualizar la contraseña. Reintentá el link.");
  return { ok: true };
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila.

- [ ] **Step 3: Commit**

```bash
git add src/actions/auth.ts
git commit -m "feat(auth): server actions de login/registro/reset"
```

---

### Task 5: Route Handler del callback

**Files:**
- Create: `src/app/auth/callback/route.ts`

**Interfaces:**
- Consumes: `createClient` de `@/lib/supabase/server`, `isSupabaseConfigured`.
- Produces: ruta `GET /auth/callback?code&next` que intercambia `code` por sesión y redirige.

- [ ] **Step 1: Escribir el handler**

```ts
// src/app/auth/callback/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (isSupabaseConfigured && code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL("/login?error=auth", origin));
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; aparece la ruta `ƒ /auth/callback`.

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/callback/route.ts
git commit -m "feat(auth): route handler del callback (exchangeCodeForSession)"
```

---

### Task 6: Helper de sesión + Header con estado + layout storefront async

**Files:**
- Create: `src/lib/auth/session.ts`
- Modify: `src/components/storefront/header.tsx`
- Modify: `src/app/(storefront)/layout.tsx`

**Interfaces:**
- Produces: `getSessionUser(): Promise<User | null>` desde `@/lib/auth/session`;
  `Header` acepta prop opcional `isAuthenticated?: boolean`.

- [ ] **Step 1: Crear el helper de sesión**

```ts
// src/lib/auth/session.ts
import "server-only";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

/** Usuario autenticado en el server, o null. Usa getUser() (revalida el token). */
export async function getSessionUser(): Promise<User | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
```

- [ ] **Step 2: Header → ícono de usuario según sesión**

En `src/components/storefront/header.tsx`:
1. Cambiar la firma del componente para aceptar la prop:
```tsx
export function Header({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
```
2. Reemplazar el `<button aria-label="Cuenta" …>` (con el ícono `User`) por un `Link`:
```tsx
          <Link
            href={isAuthenticated ? "/account" : "/login"}
            aria-label={isAuthenticated ? "Mi cuenta" : "Ingresar"}
            className="transition-colors hover:text-burgundy"
          >
            <User className="h-5 w-5" />
          </Link>
```
(`Link` y `User` ya están importados en el archivo.)

- [ ] **Step 3: Layout storefront async que pasa la sesión**

Reemplazar `src/app/(storefront)/layout.tsx` por:
```tsx
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { getSessionUser } from "@/lib/auth/session";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <>
      <Header isAuthenticated={!!user} />
      <main className="flex-1 bg-cream text-ink">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: compila; el catálogo sigue funcionando.

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth/session.ts src/components/storefront/header.tsx "src/app/(storefront)/layout.tsx"
git commit -m "feat(auth): helper de sesión y estado de cuenta en el header"
```

---

### Task 7: Route group `(auth)` — layout, campo reutilizable, forms y páginas

**Files:**
- Create: `src/app/(auth)/layout.tsx`
- Create: `src/components/auth/text-field.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/register-form.tsx`
- Create: `src/components/auth/forgot-password-form.tsx`
- Create: `src/components/auth/reset-password-form.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/(auth)/forgot-password/page.tsx`
- Create: `src/app/(auth)/reset-password/page.tsx`

**Interfaces:**
- Consumes: actions de Task 4, schemas de Task 3, `isSupabaseConfigured`, `getSessionUser`.
- Produces: rutas `/login`, `/register`, `/forgot-password`, `/reset-password`.

- [ ] **Step 1: Layout `(auth)` centrado y branded**

```tsx
// src/app/(auth)/layout.tsx
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-5 py-12 text-ink">
      <Link href="/" className="mb-8 font-heading text-3xl font-semibold text-green">
        Arcea
        <span className="ml-1 align-middle text-[0.55rem] uppercase tracking-[0.4em] text-green-mid">
          Estudio
        </span>
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-beige bg-paper p-6 sm:p-8">
        {children}
      </div>
      <p className="mt-8 text-xs uppercase tracking-[0.3em] text-green-mid">
        @arcea.estudio
      </p>
    </main>
  );
}
```

- [ ] **Step 2: Campo de texto reutilizable**

```tsx
// src/components/auth/text-field.tsx
"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, error, id, ...props },
  ref,
) {
  return (
    <div>
      <label htmlFor={id} className="text-xs uppercase tracking-wider text-green-mid">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        {...props}
        className="mt-1.5 w-full rounded-lg border border-beige bg-cream px-4 py-2.5 text-sm outline-none transition-colors focus:border-green"
      />
      {error && <p className="mt-1 text-xs text-burgundy">{error}</p>}
    </div>
  );
});
```

- [ ] **Step 3: Form de login**

```tsx
// src/components/auth/login-form.tsx
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { signIn } from "@/actions/auth";
import { TextField } from "./text-field";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    const res = await signIn(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("¡Hola de nuevo!");
    router.push(params.get("next") ?? "/account");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="font-heading text-2xl text-green">Ingresar</h1>
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:opacity-60"
      >
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>
      <div className="flex items-center justify-between text-xs text-green-mid">
        <Link href="/forgot-password" className="hover:text-burgundy">
          Olvidé mi contraseña
        </Link>
        <Link href="/register" className="hover:text-burgundy">
          Crear cuenta
        </Link>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Form de registro**

```tsx
// src/components/auth/register-form.tsx
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { signUp } from "@/actions/auth";
import { TextField } from "./text-field";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterInput) {
    const res = await signUp(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("¡Cuenta creada! Revisá tu email para confirmarla.");
    reset();
  }

  if (isSubmitSuccessful) {
    return (
      <div className="space-y-3 text-center">
        <h1 className="font-heading text-2xl text-green">Revisá tu email</h1>
        <p className="text-sm text-ink/70">
          Te enviamos un link para confirmar tu cuenta.
        </p>
        <Link href="/login" className="inline-block text-xs uppercase tracking-wider text-green-mid hover:text-burgundy">
          Volver a ingresar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="font-heading text-2xl text-green">Crear cuenta</h1>
      <TextField
        id="fullName"
        label="Nombre"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <TextField
        id="confirmPassword"
        label="Repetir contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:opacity-60"
      >
        {isSubmitting ? "Creando…" : "Crear cuenta"}
      </button>
      <p className="text-center text-xs text-green-mid">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="hover:text-burgundy">
          Ingresá
        </Link>
      </p>
    </form>
  );
}
```

- [ ] **Step 5: Form de "olvidé mi contraseña"**

```tsx
// src/components/auth/forgot-password-form.tsx
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
import { requestPasswordReset } from "@/actions/auth";
import { TextField } from "./text-field";

export function ForgotPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    const res = await requestPasswordReset(values);
    if (!res.ok) toast.error(res.error);
  }

  if (isSubmitSuccessful) {
    return (
      <div className="space-y-3 text-center">
        <h1 className="font-heading text-2xl text-green">Revisá tu email</h1>
        <p className="text-sm text-ink/70">
          Si el email está registrado, te enviamos un link para restablecer la contraseña.
        </p>
        <Link href="/login" className="inline-block text-xs uppercase tracking-wider text-green-mid hover:text-burgundy">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="font-heading text-2xl text-green">Recuperar contraseña</h1>
      <p className="text-sm text-ink/70">Te enviamos un link a tu email.</p>
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:opacity-60"
      >
        {isSubmitting ? "Enviando…" : "Enviar link"}
      </button>
    </form>
  );
}
```

- [ ] **Step 6: Form de reset (nueva contraseña)**

```tsx
// src/components/auth/reset-password-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { updatePassword } from "@/actions/auth";
import { TextField } from "./text-field";

export function ResetPasswordForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    const res = await updatePassword(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Contraseña actualizada. Ingresá de nuevo.");
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h1 className="font-heading text-2xl text-green">Nueva contraseña</h1>
      <TextField
        id="password"
        label="Contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <TextField
        id="confirmPassword"
        label="Repetir contraseña"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
```

- [ ] **Step 7: Páginas que muestran el form o el aviso "no configurado"**

Crear las 4 páginas. `login` y `register` además redirigen a `/account` si ya hay sesión.

```tsx
// src/app/(auth)/login/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";
import { AuthNotConfigured } from "@/components/auth/not-configured";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage() {
  if (!isSupabaseConfigured) return <AuthNotConfigured />;
  if (await getSessionUser()) redirect("/account");
  return <LoginForm />;
}
```

```tsx
// src/app/(auth)/register/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import { RegisterForm } from "@/components/auth/register-form";
import { AuthNotConfigured } from "@/components/auth/not-configured";

export const metadata: Metadata = { title: "Crear cuenta" };

export default async function RegisterPage() {
  if (!isSupabaseConfigured) return <AuthNotConfigured />;
  if (await getSessionUser()) redirect("/account");
  return <RegisterForm />;
}
```

```tsx
// src/app/(auth)/forgot-password/page.tsx
import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthNotConfigured } from "@/components/auth/not-configured";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  if (!isSupabaseConfigured) return <AuthNotConfigured />;
  return <ForgotPasswordForm />;
}
```

```tsx
// src/app/(auth)/reset-password/page.tsx
import type { Metadata } from "next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthNotConfigured } from "@/components/auth/not-configured";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default function ResetPasswordPage() {
  if (!isSupabaseConfigured) return <AuthNotConfigured />;
  return <ResetPasswordForm />;
}
```

Y el aviso compartido:
```tsx
// src/components/auth/not-configured.tsx
import Link from "next/link";

export function AuthNotConfigured() {
  return (
    <div className="space-y-3 text-center">
      <h1 className="font-heading text-2xl text-green">Cuentas en camino</h1>
      <p className="text-sm text-ink/70">
        El registro y el ingreso se habilitan cuando conectemos la base de datos.
      </p>
      <Link
        href="/products"
        className="inline-block text-xs uppercase tracking-wider text-green-mid hover:text-burgundy"
      >
        Ver la colección
      </Link>
    </div>
  );
}
```
(Agregar `src/components/auth/not-configured.tsx` a la lista de archivos creados de esta tarea.)

- [ ] **Step 8: Verificar build**

Run: `npm run build`
Expected: compila; aparecen `ƒ /login`, `ƒ /register`, `ƒ /forgot-password`, `ƒ /reset-password`.

- [ ] **Step 9: Commit**

```bash
git add "src/app/(auth)" src/components/auth
git commit -m "feat(auth): páginas y formularios de login/registro/reset"
```

---

### Task 8: Perfil — action, layout protegido, página y form

**Files:**
- Create: `src/actions/profile.ts`
- Create: `src/app/(account)/layout.tsx`
- Create: `src/app/(account)/account/page.tsx`
- Create: `src/components/account/profile-form.tsx`

**Interfaces:**
- Consumes: `createClient`, `isSupabaseConfigured`, `getSessionUser`, `profileSchema`, `signOut`.
- Produces: `updateProfile(values: ProfileInput): Promise<ActionResult>`; ruta `/account`.

- [ ] **Step 1: Action de perfil**

```ts
// src/actions/profile.ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import type { ActionResult } from "@/actions/auth";

export async function updateProfile(values: ProfileInput): Promise<ActionResult> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: "La cuenta se habilita al conectar Supabase." };
  }
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "Datos inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: "No pudimos guardar los cambios." };

  revalidatePath("/account");
  return { ok: true };
}
```

- [ ] **Step 2: Layout protegido `(account)`**

```tsx
// src/app/(account)/layout.tsx
import { redirect } from "next/navigation";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defensa en profundidad: el Proxy también gatea /account (Task 9).
  if (!isSupabaseConfigured) redirect("/login");
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/account");

  return (
    <>
      <Header isAuthenticated />
      <main className="flex-1 bg-cream text-ink">{children}</main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Página `/account` (carga el profile)**

```tsx
// src/app/(account)/account/page.tsx
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import { signOut } from "@/actions/auth";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function AccountPage() {
  const user = await getSessionUser();
  // El layout ya garantiza user != null; este guard es por tipos.
  if (!user) return null;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-xl px-5 py-12 sm:py-16">
      <header className="mb-8">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-green-mid">
          Mi cuenta
        </span>
        <h1 className="mt-3 font-heading text-4xl font-medium text-green">
          Hola{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-2 text-sm text-ink/60">{user.email}</p>
      </header>

      <ProfileForm
        defaultValues={{
          fullName: profile?.full_name ?? "",
          phone: profile?.phone ?? "",
        }}
      />

      <form action={signOut} className="mt-8 border-t border-beige pt-6">
        <button
          type="submit"
          className="text-sm font-medium uppercase tracking-wider text-burgundy hover:underline"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Form de perfil**

```tsx
// src/components/account/profile-form.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { profileSchema, type ProfileInput } from "@/lib/validations/auth";
import { updateProfile } from "@/actions/profile";
import { TextField } from "@/components/auth/text-field";

export function ProfileForm({ defaultValues }: { defaultValues: ProfileInput }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  async function onSubmit(values: ProfileInput) {
    const res = await updateProfile(values);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Datos guardados.");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <TextField
        id="fullName"
        label="Nombre"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName")}
      />
      <TextField
        id="phone"
        label="Teléfono (opcional)"
        autoComplete="tel"
        error={errors.phone?.message}
        {...register("phone")}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-green px-6 py-3 text-sm font-semibold uppercase tracking-wider text-cream transition-colors hover:bg-burgundy disabled:opacity-60"
      >
        {isSubmitting ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Verificar build**

Run: `npm run build`
Expected: compila; aparece `ƒ /account`.

- [ ] **Step 6: Commit**

```bash
git add src/actions/profile.ts "src/app/(account)" src/components/account
git commit -m "feat(account): perfil editable con layout protegido"
```

---

### Task 9: Gating de `/account` en el Proxy

**Files:**
- Modify: `src/lib/supabase/middleware.ts`

**Interfaces:**
- Consumes: el `supabase` y `request` ya presentes en `updateSession`.

- [ ] **Step 1: Capturar el user y redirigir**

En `src/lib/supabase/middleware.ts`, reemplazar el bloque final desde el comentario `// IMPORTANTE: …` hasta `return supabaseResponse;` por:
```ts
  // IMPORTANTE: no insertar lógica entre createServerClient y getUser().
  // getUser() revalida el token con Supabase y refresca la sesión.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Gating: /account requiere sesión. (El gating de /admin entra en la Fase 5.)
  const { pathname } = request.nextUrl;
  if (!user && pathname.startsWith("/account")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: compila; el output muestra `ƒ Proxy (Middleware)`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase/middleware.ts
git commit -m "feat(auth): gating de /account en el proxy"
```

---

### Task 10: Roadmap, build final y cierre

**Files:**
- Modify: `ROADMAP.md`

- [ ] **Step 1: Marcar avances de la Fase 2 en `ROADMAP.md`**

Reemplazar el encabezado y los ítems de la Fase 2 por:
```markdown
## Fase 2 — Autenticación y cuentas `[~]`

- [x] `profiles` + trigger de creación + enum de rol; RLS (anti-escalada)
- [x] Login / registro / olvido y reset de contraseña; callback de auth
- [x] Gating de `/account` en el Proxy (ex-middleware)
- [~] Perfil editable; direcciones (CRUD) e historial de pedidos quedan para cuando la Fase 3 los use
- [ ] Deploy

> 💡 Construido "a ciegas": el código compila y se activa al conectar Supabase
> (`.env.local` + correr migraciones). Falta probar los flujos con backend real y el deploy.
```

- [ ] **Step 2: Build final completo**

Run: `npm run build`
Expected: compila sin errores; el output incluye las rutas `/login`, `/register`, `/forgot-password`, `/reset-password`, `/account`, `/auth/callback`, y `ƒ Proxy (Middleware)`.

- [ ] **Step 3: Commit**

```bash
git add ROADMAP.md
git commit -m "docs: marcar avances de la Fase 2 en el roadmap"
```

- [ ] **Step 4 (opcional, pedir al usuario): push**

```bash
git push origin main
```

---

## Self-review (hecho al escribir el plan)

- **Cobertura del spec:** ✅ datos (Task 2), config compartida (Task 1), validaciones (Task 3),
  actions de auth (Task 4), callback (Task 5), sesión+header (Task 6), páginas/forms (Task 7),
  perfil+gating server (Task 8), gating Proxy (Task 9), roadmap/build (Task 10).
- **Consistencia de tipos:** `ActionResult` se define en `actions/auth.ts` y se reusa en
  `actions/profile.ts`; `ProfileInput`/`LoginInput`/etc. vienen todos de `validations/auth.ts`;
  `getSessionUser` se usa con la misma firma en layouts y páginas; `TextField` se reusa en auth y
  account.
- **Sin placeholders:** todo el código está completo.
- **Decisión de testing registrada:** verificación por `npm run build` (no hay test runner y la
  auth no corre sin backend); e2e queda como follow-up post-Supabase.

## Follow-ups (fuera de esta fase)

1. Conectar Supabase (crear proyecto, correr `0001`→`0003`, `.env.local`) y **probar los flujos
   reales**: registro+confirmación, login, reset, gating, edición de perfil.
2. Regenerar `database.types.ts` con `supabase gen types typescript --linked`.
3. Considerar migrar `middleware.ts` → `proxy.ts` (convención Next 16) — cosmético, el actual funciona.
4. Direcciones (CRUD) e historial de pedidos cuando la Fase 3 (checkout) los necesite.
