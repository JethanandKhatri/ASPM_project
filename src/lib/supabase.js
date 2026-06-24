import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://eoloamfjluwiluojisxb.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbG9hbWZqbHV3aWx1b2ppc3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxOTM1MDMsImV4cCI6MjA5Nzc2OTUwM30.7oQ67PlebHTnXgYEPVR4f8x9f5YSxhbe_aUdnYicFgA'
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbG9hbWZqbHV3aWx1b2ppc3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE5MzUwMywiZXhwIjoyMDk3NzY5NTAzfQ.fUjRFlE1Fcd4pv4cevh0nTfnoQDPF3VBb7Wsxkkpeck'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    storageKey: 'aspm-admin',
  }
})
