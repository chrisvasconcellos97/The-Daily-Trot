create table if not exists communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
alter table communities enable row level security;
create policy "anyone can read communities by invite code" on communities for select using (true);
create policy "authenticated users can create communities" on communities for insert with check (auth.uid() = created_by);

create table if not exists community_members (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  family_id uuid not null references families(id),
  joined_at timestamptz default now(),
  unique(community_id, user_id)
);
alter table community_members enable row level security;
create policy "members can see other members" on community_members for select
  using (community_id in (select community_id from community_members where user_id = auth.uid()));
create policy "users can join communities" on community_members for insert with check (auth.uid() = user_id);

create table if not exists community_posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references communities(id) on delete cascade,
  family_id uuid not null references families(id),
  user_id uuid not null references auth.users(id),
  place_name text not null,
  post_date date not null,
  post_time time,
  notes text,
  kids_going jsonb default '[]',
  created_at timestamptz default now()
);
alter table community_posts enable row level security;
create policy "community members can see posts" on community_posts for select
  using (community_id in (select community_id from community_members where user_id = auth.uid()));
create policy "community members can post" on community_posts for insert
  with check (community_id in (select community_id from community_members where user_id = auth.uid()) and auth.uid() = user_id);
create policy "own posts can be deleted" on community_posts for delete using (auth.uid() = user_id);

create table if not exists community_rsvps (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references community_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  family_id uuid not null references families(id),
  status text not null check (status in ('going','maybe','not_going')),
  kids_going jsonb default '[]',
  updated_at timestamptz default now(),
  unique(post_id, user_id)
);
alter table community_rsvps enable row level security;
create policy "community members can see rsvps" on community_rsvps for select
  using (post_id in (select id from community_posts where community_id in (select community_id from community_members where user_id = auth.uid())));
create policy "users can upsert own rsvp" on community_rsvps for insert with check (auth.uid() = user_id);
create policy "users can update own rsvp" on community_rsvps for update using (auth.uid() = user_id);
