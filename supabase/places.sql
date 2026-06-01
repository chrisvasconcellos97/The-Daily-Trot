-- Core auth tables (run first if not exists)
create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);
alter table families enable row level security;

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique(family_id, user_id)
);
alter table family_members enable row level security;
create policy "users can read their own membership"
  on family_members for select using (user_id = auth.uid());
create policy "users can insert their own membership"
  on family_members for insert with check (user_id = auth.uid());

create policy "members can read their family"
  on families for select
  using (id in (select family_id from family_members where user_id = auth.uid()));
create policy "anyone can insert a family"
  on families for insert with check (true);
create policy "members can update their family"
  on families for update
  using (id in (select family_id from family_members where user_id = auth.uid()));

-- Places
create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  category text not null default 'other',
  address text,
  lat numeric(10, 7),
  lng numeric(10, 7),
  website_url text,
  notes text,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now()
);
alter table places enable row level security;
create policy "families can manage their places"
  on places for all
  using (family_id in (select family_id from family_members where user_id = auth.uid()));
