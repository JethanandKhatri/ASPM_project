import pg from 'pg'
const { Client } = pg

const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbG9hbWZqbHV3aWx1b2ppc3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE5MzUwMywiZXhwIjoyMDk3NzY5NTAzfQ.fUjRFlE1Fcd4pv4cevh0nTfnoQDPF3VBb7Wsxkkpeck'
const PROJECT_REF = 'eoloamfjluwiluojisxb'

const SQL = `
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'developer' check (role in ('developer','line_manager','scrum_master','admin')),
  avatar_url  text,
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

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
`

const POOLER_HOSTS = [
  `aws-0-ap-southeast-1.pooler.supabase.com`,
  `aws-0-us-east-1.pooler.supabase.com`,
  `aws-0-eu-west-1.pooler.supabase.com`,
  `aws-0-us-west-1.pooler.supabase.com`,
  `aws-0-ap-northeast-1.pooler.supabase.com`,
]

async function tryConnect(host, port) {
  const client = new Client({
    host,
    port,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: SERVICE_KEY,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  })
  try {
    await client.connect()
    console.log(`✅ Connected via ${host}:${port}`)
    return client
  } catch (e) {
    process.stdout.write(`   ✗ ${host}:${port} — ${e.message.slice(0, 60)}\n`)
    return null
  }
}

async function main() {
  console.log('🔌 Trying Supabase pooler connections...\n')

  let client = null

  for (const host of POOLER_HOSTS) {
    client = await tryConnect(host, 5432)
    if (client) break
    client = await tryConnect(host, 6543)
    if (client) break
  }

  if (!client) {
    console.log('\n❌ Could not connect via pooler with JWT auth.')
    console.log('\n📌 Final option needed — one of these (30 seconds):')
    console.log('\n   A) Personal Access Token:')
    console.log('      1. Go to: https://supabase.com/dashboard/account/tokens')
    console.log('      2. Click "Generate new token" → name it anything → copy it')
    console.log('      3. Paste it here and I will finish setup automatically\n')
    console.log('   B) Manual SQL (fastest):')
    console.log('      1. Open: https://supabase.com/dashboard/project/eoloamfjluwiluojisxb/sql/new')
    console.log('      2. Paste contents of d:/ASPM/supabase_setup.sql → Run')
    return
  }

  try {
    console.log('\n🔧 Running migration SQL...')
    await client.query(SQL)
    console.log('✅ profiles table created!')
    console.log('✅ RLS policies applied!')
    console.log('✅ Auto-trigger installed!')
    console.log('\n🎉 ASPM database setup complete! App ready at http://localhost:5173')
  } catch (e) {
    console.error('❌ Migration error:', e.message)
  } finally {
    await client.end()
  }
}

main()
