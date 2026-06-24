import pg from 'pg'
const { Client } = pg

const PROJECT_REF = 'eoloamfjluwiluojisxb'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbG9hbWZqbHV3aWx1b2ppc3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE5MzUwMywiZXhwIjoyMDk3NzY5NTAzfQ.fUjRFlE1Fcd4pv4cevh0nTfnoQDPF3VBb7Wsxkkpeck'

const SQL = `
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
  id          text primary key,
  project_id  text references public.projects(id) on delete cascade,
  name        text,
  assignee    text,
  priority    text default 'Medium',
  due_date    date,
  status      text default 'To Do',
  feature     text,
  description text,
  created_at  timestamptz default now()
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

alter table public.projects      enable row level security;
alter table public.features      enable row level security;
alter table public.project_team  enable row level security;
alter table public.estimations   enable row level security;
alter table public.risks         enable row level security;
alter table public.comments      enable row level security;
alter table public.tasks         enable row level security;
alter table public.activity_log  enable row level security;
alter table public.notifications enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='projects' and policyname='Auth users full access') then
    execute 'create policy "Auth users full access" on public.projects for all to authenticated using (true) with check (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='features' and policyname='Auth users full access') then
    execute 'create policy "Auth users full access" on public.features for all to authenticated using (true) with check (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='project_team' and policyname='Auth users full access') then
    execute 'create policy "Auth users full access" on public.project_team for all to authenticated using (true) with check (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='estimations' and policyname='Auth users full access') then
    execute 'create policy "Auth users full access" on public.estimations for all to authenticated using (true) with check (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='risks' and policyname='Auth users full access') then
    execute 'create policy "Auth users full access" on public.risks for all to authenticated using (true) with check (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='comments' and policyname='Auth users full access') then
    execute 'create policy "Auth users full access" on public.comments for all to authenticated using (true) with check (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='tasks' and policyname='Auth users full access') then
    execute 'create policy "Auth users full access" on public.tasks for all to authenticated using (true) with check (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='activity_log' and policyname='Auth users full access') then
    execute 'create policy "Auth users full access" on public.activity_log for all to authenticated using (true) with check (true)';
  end if;
  if not exists (select 1 from pg_policies where tablename='notifications' and policyname='Auth users full access') then
    execute 'create policy "Auth users full access" on public.notifications for all to authenticated using (true) with check (true)';
  end if;
end $$;
`

const POOLER_HOSTS = [
  'aws-0-ap-southeast-1.pooler.supabase.com',
  'aws-0-us-east-1.pooler.supabase.com',
  'aws-0-eu-west-1.pooler.supabase.com',
  'aws-0-us-west-1.pooler.supabase.com',
  'aws-0-ap-northeast-1.pooler.supabase.com',
]

async function tryConnect(host, port) {
  const client = new Client({
    host, port,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: SERVICE_KEY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  })
  try {
    await client.connect()
    console.log(`Connected via ${host}:${port}`)
    return client
  } catch (e) {
    process.stdout.write(`  ✗ ${host}:${port} — ${e.message.slice(0, 60)}\n`)
    return null
  }
}

async function main() {
  console.log('Connecting to Supabase...\n')
  let client = null

  for (const host of POOLER_HOSTS) {
    client = await tryConnect(host, 5432)
    if (client) break
    client = await tryConnect(host, 6543)
    if (client) break
  }

  if (!client) {
    console.log('\nCould not connect via pooler.')
    console.log('Please run supabase_setup.sql manually in:')
    console.log('https://supabase.com/dashboard/project/eoloamfjluwiluojisxb/sql/new')
    return
  }

  try {
    console.log('\nCreating tables...')
    await client.query(SQL)
    console.log('projects table        ✓')
    console.log('features table        ✓')
    console.log('project_team table    ✓')
    console.log('estimations table     ✓')
    console.log('risks table           ✓')
    console.log('comments table        ✓')
    console.log('tasks table           ✓')
    console.log('activity_log table    ✓')
    console.log('notifications table   ✓')
    console.log('RLS policies          ✓')
    console.log('\nAll tables created! Start the app and data will auto-seed on first login.')
  } catch (e) {
    console.error('Error:', e.message)
  } finally {
    await client.end()
  }
}

main()
