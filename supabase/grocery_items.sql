create table if not exists grocery_items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  category text default 'Other',
  checked boolean default false,
  created_at timestamptz default now()
);
alter table grocery_items enable row level security;
create policy "family grocery" on grocery_items for all
  using (family_id in (select family_id from family_members where user_id = auth.uid()));
