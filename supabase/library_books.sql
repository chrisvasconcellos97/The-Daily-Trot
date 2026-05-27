-- Library books table
-- Run once in Supabase SQL Editor

create table if not exists library_books (
  id            uuid primary key default gen_random_uuid(),
  family_id     uuid not null references families(id) on delete cascade,
  title         text not null,
  author        text,
  checkout_date date not null default current_date,
  due_date      date not null,
  returned_at   timestamptz,
  notes         text,
  created_at    timestamptz default now()
);

alter table library_books enable row level security;

create policy "family members can manage library_books"
  on library_books for all
  using (
    family_id in (
      select family_id from family_members where user_id = auth.uid()
    )
  );
