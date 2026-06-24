-- ============================================================
--  Arcea Estudio · Fase 1 — Datos de ejemplo (seed)
--  Las imágenes usan URLs placeholder (picsum). Se reemplazan
--  por las fotos reales (Supabase Storage) más adelante.
--  Pensado para correr una vez (o vía `supabase db reset`).
-- ============================================================

-- ─── Categorías ─────────────────────────────────────────────
insert into public.categories (name, slug, description, sort_order) values
  ('Sweaters', 'sweaters', 'Sweaters y buzos de punto suave.', 1),
  ('Abrigos',  'abrigos',  'Abrigos, tapados y prendas de exterior.', 2),
  ('Tejidos',  'tejidos',  'Cárdigans, chalecos y tejidos finos.', 3),
  ('Casual',   'casual',   'Básicos de algodón para todos los días.', 4)
on conflict (slug) do nothing;

-- ─── Productos ──────────────────────────────────────────────
insert into public.products (name, slug, description, category_id, base_price, compare_at_price, is_featured) values
  ('Sweater Bruma',      'sweater-bruma',      'Sweater oversize de punto suave, ideal para los días de niebla. Tejido natural y caída relajada.', (select id from public.categories where slug='sweaters'), 4890000, null,    true),
  ('Cárdigan Merino',    'cardigan-merino',    'Cárdigan de lana merino, abrigado y liviano. Botones de madera y bolsillos al frente.',           (select id from public.categories where slug='tejidos'),  6200000, null,    false),
  ('Abrigo Niebla',      'abrigo-niebla',      'Abrigo largo de paño, silueta envolvente. La prenda estrella del invierno.',                       (select id from public.categories where slug='abrigos'),  9450000, null,    true),
  ('Buzo Tierra',        'buzo-tierra',        'Buzo de algodón orgánico, felpa interior. Cómodo y cálido para el día a día.',                     (select id from public.categories where slug='casual'),   3190000, 3990000, false),
  ('Cuello Alto Pino',   'cuello-alto-pino',   'Sweater de cuello alto, punto cerrado. Un básico que abriga sin abultar.',                          (select id from public.categories where slug='sweaters'), 4400000, null,    false),
  ('Chaleco Musgo',      'chaleco-musgo',      'Chaleco tejido sin mangas, perfecto para hacer capas. Tono verde musgo.',                           (select id from public.categories where slug='tejidos'),  3350000, null,    false),
  ('Tapado Pantano',     'tapado-pantano',     'Tapado de paño en verde pantano, corte recto y largo. Elegancia sin estridencias.',                (select id from public.categories where slug='abrigos'), 11200000, null,    true),
  ('Manga Larga Crema',  'manga-larga-crema',  'Remera de manga larga en algodón peinado. Base perfecta para cualquier look.',                     (select id from public.categories where slug='casual'),   2490000, null,    false)
on conflict (slug) do nothing;

-- ─── Variantes (talle / color / stock) ─────────────────────
insert into public.product_variants (product_id, sku, size, color, color_hex, stock) values
  ((select id from public.products where slug='sweater-bruma'),     'BRU-CRE-M', 'M', 'Crema',     '#F3EEE3', 12),
  ((select id from public.products where slug='sweater-bruma'),     'BRU-CRE-L', 'L', 'Crema',     '#F3EEE3',  8),
  ((select id from public.products where slug='sweater-bruma'),     'BRU-VER-M', 'M', 'Verde',     '#8E9C78',  6),
  ((select id from public.products where slug='cardigan-merino'),   'MER-BEI-S', 'S', 'Beige',     '#D8C9AE', 10),
  ((select id from public.products where slug='cardigan-merino'),   'MER-BEI-M', 'M', 'Beige',     '#D8C9AE',  7),
  ((select id from public.products where slug='abrigo-niebla'),     'NIE-GRI-M', 'M', 'Gris',      '#9A9A95',  5),
  ((select id from public.products where slug='abrigo-niebla'),     'NIE-GRI-L', 'L', 'Gris',      '#9A9A95',  4),
  ((select id from public.products where slug='buzo-tierra'),       'TIE-TER-M', 'M', 'Terracota', '#A6694F', 20),
  ((select id from public.products where slug='buzo-tierra'),       'TIE-TER-L', 'L', 'Terracota', '#A6694F', 15),
  ((select id from public.products where slug='cuello-alto-pino'),  'PIN-VER-M', 'M', 'Verde',     '#2C382A',  9),
  ((select id from public.products where slug='cuello-alto-pino'),  'PIN-NEG-M', 'M', 'Negro',     '#23231D', 11),
  ((select id from public.products where slug='chaleco-musgo'),     'MUS-MUS-S', 'S', 'Musgo',     '#6B7355', 14),
  ((select id from public.products where slug='tapado-pantano'),    'PAN-PAN-M', 'M', 'Pantano',   '#2C382A',  3),
  ((select id from public.products where slug='tapado-pantano'),    'PAN-PAN-L', 'L', 'Pantano',   '#2C382A',  2),
  ((select id from public.products where slug='manga-larga-crema'), 'MLC-CRE-S', 'S', 'Crema',     '#F3EEE3', 25),
  ((select id from public.products where slug='manga-larga-crema'), 'MLC-BOR-M', 'M', 'Bordó',     '#6E292E', 18)
on conflict (product_id, size, color) do nothing;

-- ─── Imágenes (placeholder) ─────────────────────────────────
insert into public.product_images (product_id, storage_path, alt, is_primary, sort_order) values
  ((select id from public.products where slug='sweater-bruma'),     'https://picsum.photos/seed/arcea-p1/800/1000', 'Sweater Bruma',     true, 0),
  ((select id from public.products where slug='cardigan-merino'),   'https://picsum.photos/seed/arcea-p2/800/1000', 'Cárdigan Merino',   true, 0),
  ((select id from public.products where slug='abrigo-niebla'),     'https://picsum.photos/seed/arcea-p3/800/1000', 'Abrigo Niebla',     true, 0),
  ((select id from public.products where slug='buzo-tierra'),       'https://picsum.photos/seed/arcea-p4/800/1000', 'Buzo Tierra',       true, 0),
  ((select id from public.products where slug='cuello-alto-pino'),  'https://picsum.photos/seed/arcea-p5/800/1000', 'Cuello Alto Pino',  true, 0),
  ((select id from public.products where slug='chaleco-musgo'),     'https://picsum.photos/seed/arcea-p6/800/1000', 'Chaleco Musgo',     true, 0),
  ((select id from public.products where slug='tapado-pantano'),    'https://picsum.photos/seed/arcea-p7/800/1000', 'Tapado Pantano',    true, 0),
  ((select id from public.products where slug='manga-larga-crema'), 'https://picsum.photos/seed/arcea-p8/800/1000', 'Manga Larga Crema', true, 0);
