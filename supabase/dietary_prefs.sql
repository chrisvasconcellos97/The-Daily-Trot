create table if not exists dietary_prefs (
  family_id uuid primary key references families(id) on delete cascade,
  vegetarian boolean default false,
  vegan boolean default false,
  pescatarian boolean default false,
  gluten_free boolean default false,
  dairy_free boolean default false,
  nut_free boolean default false,
  halal boolean default false,
  kosher boolean default false,
  low_carb boolean default false,
  updated_at timestamptz default now()
);
alter table dietary_prefs enable row level security;
create policy "family dietary prefs" on dietary_prefs for all
  using (family_id in (select family_id from family_members where user_id = auth.uid()));
