-- ============================================================
--  Arcea Estudio · Fase 1 — Esquema de catálogo
--  Precios en ENTEROS (centavos de ARS). Nunca floats.
-- ============================================================

create extension if not exists pgcrypto;

-- ─── Categorías ─────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  parent_id   uuid references public.categories(id) on delete set null,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ─── Productos ──────────────────────────────────────────────
create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  category_id      uuid references public.categories(id) on delete set null,
  base_price       integer not null check (base_price >= 0),       -- centavos
  compare_at_price integer check (compare_at_price >= 0),          -- precio tachado
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx   on public.products(is_active);

-- Búsqueda full-text en español (nombre + descripción)
alter table public.products
  add column if not exists search tsvector
  generated always as (
    to_tsvector('spanish', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored;
create index if not exists products_search_idx on public.products using gin(search);

-- ─── Variantes (talle + color, con stock y SKU propios) ─────
create table if not exists public.product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  sku            text unique,
  size           text,
  color          text,
  color_hex      text,
  price_override integer check (price_override >= 0),
  stock          integer not null default 0 check (stock >= 0),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  unique (product_id, size, color)
);
create index if not exists variants_product_idx on public.product_variants(product_id);

-- ─── Imágenes ───────────────────────────────────────────────
create table if not exists public.product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  variant_id   uuid references public.product_variants(id) on delete set null,
  storage_path text not null,   -- path en el bucket de Storage (o URL absoluta para seed)
  alt          text,
  sort_order   integer not null default 0,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists images_product_idx on public.product_images(product_id);

-- ─── Trigger updated_at ─────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();
