create table if not exists health_visits (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  visit_date date not null,
  doctor text,
  height_cm numeric,
  weight_kg numeric,
  head_cm numeric,
  height_pct integer,
  weight_pct integer,
  head_pct integer,
  notes text,
  created_at timestamptz default now()
);
alter table health_visits enable row level security;
create policy "family health visits" on health_visits for all
  using (child_id in (select id from children where family_id in (select family_id from family_members where user_id = auth.uid())));

create table if not exists health_vaccines (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references children(id) on delete cascade,
  vaccine_name text not null,
  date_given date,
  next_due date,
  created_at timestamptz default now()
);
alter table health_vaccines enable row level security;
create policy "family vaccines" on health_vaccines for all
  using (child_id in (select id from children where family_id in (select family_id from family_members where user_id = auth.uid())));
