create table if not exists school_closures (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date,
  closure_type text default 'No School',
  created_at timestamptz default now()
);
alter table school_closures enable row level security;
create policy "family school closures" on school_closures for all
  using (family_id in (select family_id from family_members where user_id = auth.uid()));
