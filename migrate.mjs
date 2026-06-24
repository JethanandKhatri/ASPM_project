// ASPM Supabase Migration Script
const PROJECT_REF = 'eoloamfjluwiluojisxb'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbG9hbWZqbHV3aWx1b2ppc3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE5MzUwMywiZXhwIjoyMDk3NzY5NTAzfQ.fUjRFlE1Fcd4pv4cevh0nTfnoQDPF3VBb7Wsxkkpeck'
const BASE_URL = `https://${PROJECT_REF}.supabase.co`

const SQL = `
-- Create profiles table
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        text not null default 'developer' check (role in ('developer','line_manager','scrum_master','admin')),
  avatar_url  text,
  created_at  timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop old policies if they exist
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

-- RLS Policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger as \$\$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
\$\$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
`

async function runSQL(query) {
  const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })
  return { status: res.status, body: await res.text() }
}

async function checkTableExists() {
  const url = `${BASE_URL}/rest/v1/profiles?select=id&limit=1`
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
    }
  })
  return res.status
}

async function main() {
  console.log('🚀 Starting ASPM Supabase setup...\n')

  // Try 1: Check if profiles table already exists
  console.log('📋 Checking if profiles table exists...')
  const tableStatus = await checkTableExists()
  if (tableStatus === 200) {
    console.log('✅ profiles table already exists! Setup is complete.\n')
    return
  }
  console.log(`   Table status: ${tableStatus} (not found, will create)\n`)

  // Try 2: Management API
  console.log('🔧 Attempting SQL via Supabase Management API...')
  const result = await runSQL(SQL)
  console.log(`   Response status: ${result.status}`)

  if (result.status === 200 || result.status === 201) {
    console.log('✅ SUCCESS! Database tables created!\n')
    console.log('📦 Setup complete:')
    console.log('   ✓ profiles table created')
    console.log('   ✓ RLS policies applied')
    console.log('   ✓ Auto-create profile trigger installed')
    console.log('\n🎉 Your ASPM app is ready to use at http://localhost:5173')
    return
  }

  if (result.status === 401 || result.status === 403) {
    console.log('\n⚠️  Management API needs Personal Access Token (not service_role key)')
    console.log('   The service_role key works for the app, but Management API needs a PAT.\n')
    console.log('📌 Manual setup (takes 30 seconds):')
    console.log('   1. Go to: https://supabase.com/dashboard/project/eoloamfjluwiluojisxb/sql/new')
    console.log('   2. Paste the contents of: d:/ASPM/supabase_setup.sql')
    console.log('   3. Click Run\n')
    console.log('   OR get a Personal Access Token:')
    console.log('   https://supabase.com/dashboard/account/tokens\n')
    return
  }

  console.log(`   Response: ${result.body.slice(0, 500)}`)
}

main().catch(console.error)
