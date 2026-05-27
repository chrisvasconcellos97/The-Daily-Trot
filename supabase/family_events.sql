create table if not exists family_events (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  title text not null,
  event_date date not null,
  event_time time,
  location text,
  host_name text,
  category text default 'Other',
  rsvp_by date,
  notes text,
  created_at timestamptz default now()
);
alter table family_events enable row level security;
create policy "family events" on family_events for all
  using (family_id in (select family_id from family_members where user_id = auth.uid()));
