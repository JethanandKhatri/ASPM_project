-- =====================================================
-- ASPM - Agile Sprint Project Management
-- Supabase Database Setup Script
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'developer' check (role in ('pm', 'scrum_master', 'developer')),
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('pm', 'scrum_master', 'developer'));

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- =====================================================
-- 2. PROJECT TABLES
-- =====================================================

create table if not exists public.projects (
  id          text primary key,
  name        text not null,
  domain      text default 'Web',
  description text,
  team_size   integer default 0,
  start_date  date,
  deadline    date,
  status      text default 'Active' check (status in ('Active', 'Completed', 'On Hold')),
  created_at  timestamptz default now()
);

create table if not exists public.features (
  id          text primary key,
  project_id  text references public.projects(id) on delete cascade,
  name        text not null,
  description text,
  priority    text default 'Medium',
  status      text default 'To Do',
  created_at  timestamptz default now()
);

create table if not exists public.project_team (
  id          text primary key,
  project_id  text references public.projects(id) on delete cascade,
  name        text,
  role        text,
  email       text
);

create table if not exists public.estimations (
  id           text primary key,
  project_id   text references public.projects(id) on delete cascade,
  version      text,
  technique    text,
  date         date,
  effort       text,
  cost         text,
  duration     text,
  status       text default 'Saved',
  effort_num   numeric,
  cost_num     numeric,
  duration_num numeric,
  data         jsonb,
  created_at   timestamptz default now()
);

create table if not exists public.risks (
  id            text primary key,
  project_id    text references public.projects(id) on delete cascade,
  description   text,
  category      text,
  probability   numeric,
  impact        numeric,
  cost_impact   numeric,
  risk_exposure numeric,
  priority      text,
  status        text default 'Open',
  mitigation    text default '',
  monitoring    text default '',
  management    text default '',
  created_at    timestamptz default now()
);

create table if not exists public.comments (
  id         text primary key,
  project_id text references public.projects(id) on delete cascade,
  author     text,
  text       text,
  timestamp  timestamptz default now(),
  replies    jsonb default '[]'
);

create table if not exists public.tasks (
  id         text primary key,
  project_id text references public.projects(id) on delete cascade,
  name       text,
  assignee   text,
  priority   text default 'Medium',
  due_date   date,
  status     text default 'To Do',
  feature    text,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.activity_log (
  id         text primary key,
  project_id text references public.projects(id) on delete cascade,
  user_name  text,
  action     text,
  timestamp  timestamptz default now()
);

create table if not exists public.notifications (
  id         text primary key,
  type       text,
  message    text,
  project_id text,
  read       boolean default false,
  timestamp  timestamptz default now()
);

-- =====================================================
-- 3. ROW LEVEL SECURITY FOR PROJECT TABLES
-- All authenticated users can read/write (shared workspace)
-- =====================================================

alter table public.projects      enable row level security;
alter table public.features      enable row level security;
alter table public.project_team  enable row level security;
alter table public.estimations   enable row level security;
alter table public.risks         enable row level security;
alter table public.comments      enable row level security;
alter table public.tasks         enable row level security;
alter table public.activity_log  enable row level security;
alter table public.notifications enable row level security;

create policy "Auth users full access" on public.projects      for all to authenticated using (true) with check (true);
create policy "Auth users full access" on public.features      for all to authenticated using (true) with check (true);
create policy "Auth users full access" on public.project_team  for all to authenticated using (true) with check (true);
create policy "Auth users full access" on public.estimations   for all to authenticated using (true) with check (true);
create policy "Auth users full access" on public.risks         for all to authenticated using (true) with check (true);
create policy "Auth users full access" on public.comments      for all to authenticated using (true) with check (true);
create policy "Auth users full access" on public.tasks         for all to authenticated using (true) with check (true);
create policy "Auth users full access" on public.activity_log  for all to authenticated using (true) with check (true);
create policy "Auth users full access" on public.notifications for all to authenticated using (true) with check (true);

-- =====================================================
-- DONE! Run this entire file in Supabase SQL Editor.
-- The app will auto-seed sample data on first login.
-- =====================================================
