-- osdraft: tags table
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

create table if not exists public.tags (
  id text primary key,
  name text,
  email text,
  phone text,
  destination_url text,
  claimed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Row Level Security: the app uses the anon key, so allow the anon role
-- to read, insert, and update rows. (There is no auth in this app yet —
-- access control is enforced in the API routes.)
alter table public.tags enable row level security;

drop policy if exists "anon can read tags" on public.tags;
create policy "anon can read tags"
  on public.tags for select
  to anon
  using (true);

drop policy if exists "anon can insert tags" on public.tags;
create policy "anon can insert tags"
  on public.tags for insert
  to anon
  with check (true);

drop policy if exists "anon can update tags" on public.tags;
create policy "anon can update tags"
  on public.tags for update
  to anon
  using (true)
  with check (true);
