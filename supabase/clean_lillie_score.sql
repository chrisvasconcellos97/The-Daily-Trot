-- Clean Lillie Score schema
-- Run in Supabase project abqaiemzvzmjtatyprns

create table if not exists scanned_products (
  id uuid primary key default gen_random_uuid(),
  barcode text not null unique,
  product_name text,
  brand text,
  category text,
  ingredients jsonb default '[]'::jsonb,
  score numeric(3,1),
  score_breakdown jsonb default '{}'::jsonb,
  source text not null check (source in ('open_food_facts','open_beauty_facts','open_products_facts','user_contributed')),
  contributed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_scanned_products_barcode on scanned_products(barcode);

create table if not exists approved_products (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  barcode text,
  product_name text,
  brand text,
  category text,
  score numeric(3,1),
  created_at timestamptz not null default now(),
  unique (family_id, barcode)
);
create index if not exists idx_approved_products_family on approved_products(family_id);

create table if not exists watch_list (
  id uuid primary key default gen_random_uuid(),
  barcode text,
  product_name text,
  brand text,
  tier text not null check (tier in ('recalled','watch','clean')),
  reason text,
  source text not null check (source in ('fda','cpsc','usda','curated')),
  severity int check (severity between 1 and 3),
  added_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists idx_watch_list_barcode on watch_list(barcode);
create index if not exists idx_watch_list_brand on watch_list(lower(brand));

create table if not exists curated_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  severity int check (severity between 1 and 3),
  category text,
  brand text,
  affected_keywords text[] default '{}',
  published_at timestamptz not null default now(),
  expires_at timestamptz
);
create index if not exists idx_curated_alerts_keywords on curated_alerts using gin(affected_keywords);

alter table grocery_items add column if not exists barcode text;
alter table grocery_items add column if not exists approved_source boolean not null default false;
alter table grocery_items add column if not exists watch_tier text;

alter table scanned_products enable row level security;
alter table approved_products enable row level security;
alter table watch_list enable row level security;
alter table curated_alerts enable row level security;

create policy "scanned_products_read" on scanned_products for select to authenticated using (true);
create policy "scanned_products_insert" on scanned_products for insert to authenticated with check (true);
create policy "scanned_products_update" on scanned_products for update to authenticated using (true) with check (true);

create policy "watch_list_read" on watch_list for select to authenticated using (true);
create policy "watch_list_insert" on watch_list for insert to authenticated with check (true);

create policy "curated_alerts_read" on curated_alerts for select to authenticated using (true);

create policy "approved_products_read" on approved_products for select to authenticated using (
  family_id in (select family_id from family_members where user_id = auth.uid())
);
create policy "approved_products_insert" on approved_products for insert to authenticated with check (
  family_id in (select family_id from family_members where user_id = auth.uid())
);
create policy "approved_products_update" on approved_products for update to authenticated using (
  family_id in (select family_id from family_members where user_id = auth.uid())
);
create policy "approved_products_delete" on approved_products for delete to authenticated using (
  family_id in (select family_id from family_members where user_id = auth.uid())
);

create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_scanned_products_updated on scanned_products;
create trigger trg_scanned_products_updated
  before update on scanned_products
  for each row execute function set_updated_at();
