-- ============================================================
--  Arcea Estudio · Fase 1 — Row Level Security del catálogo
--
--  Lectura PÚBLICA del contenido activo (anon + authenticated).
--  Escritura: sin policy => denegada bajo RLS. Solo el cliente
--  service-role puede escribir (admin.ts). Las policies de
--  escritura para admins se agregan en la fase de auth/admin,
--  cuando exista profiles.role + is_admin().
-- ============================================================

alter table public.categories      enable row level security;
alter table public.products         enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images   enable row level security;

-- Categorías activas: lectura pública
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories
  for select using (is_active = true);

-- Productos activos: lectura pública
drop policy if exists products_public_read on public.products;
create policy products_public_read on public.products
  for select using (is_active = true);

-- Variantes de productos activos: lectura pública
drop policy if exists variants_public_read on public.product_variants;
create policy variants_public_read on public.product_variants
  for select using (
    is_active = true
    and exists (
      select 1 from public.products p
      where p.id = product_variants.product_id and p.is_active
    )
  );

-- Imágenes de productos activos: lectura pública
drop policy if exists images_public_read on public.product_images;
create policy images_public_read on public.product_images
  for select using (
    exists (
      select 1 from public.products p
      where p.id = product_images.product_id and p.is_active
    )
  );
