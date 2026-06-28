import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://eoloamfjluwiluojisxb.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbG9hbWZqbHV3aWx1b2ppc3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE5MzUwMywiZXhwIjoyMDk3NzY5NTAzfQ.fUjRFlE1Fcd4pv4cevh0nTfnoQDPF3VBb7Wsxkkpeck'

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// Fetch all tasks for the AI HR Management System project
const { data: tasks, error } = await db
  .from('tasks')
  .select('id, name, project_id')
  .order('created_at')

if (error) { console.error(error); process.exit(1) }

// Find the project
const hrTasks = tasks.filter(t =>
  ['Finalise payroll', 'HRMS legacy', 'UI/UX wireframes', 'AI model vendor', 'Database schema', 'ASK HR'].some(k =>
    t.name.toLowerCase().includes(k.toLowerCase())
  )
)

console.log('Found tasks:')
hrTasks.forEach((t, i) => console.log(`  [${i}] ${t.id.slice(0,8)}  ${t.name}`))

// Match by name keywords
const find = (keyword) => hrTasks.find(t => t.name.toLowerCase().includes(keyword.toLowerCase()))

const dbSchema   = find('Database schema')
const hrmsApi    = find('HRMS legacy')
const payroll    = find('payroll tax')
const uiux       = find('UI/UX wireframes')
const aiVendor   = find('AI model vendor')
const askHrs     = hrTasks.filter(t => t.name.toLowerCase().includes('ask hr'))

if (!dbSchema || !hrmsApi || !payroll || !uiux || !aiVendor) {
  console.log('Could not match all tasks — printing all tasks for manual review:')
  tasks.slice(0, 30).forEach(t => console.log(`  ${t.id.slice(0,8)}  ${t.name}`))
  process.exit(1)
}

// Logical PERT dependency chain:
// Database schema --> HRMS legacy API --> UI/UX wireframes for onboarding
//                --> Finalise payroll tax engine
//                --> AI model vendor evaluation
// ASK HR tasks depend on hrmsApi and aiVendor
const deps = [
  { task: hrmsApi,  dependsOn: [dbSchema.id] },
  { task: payroll,  dependsOn: [dbSchema.id] },
  { task: aiVendor, dependsOn: [dbSchema.id] },
  { task: uiux,     dependsOn: [hrmsApi.id]  },
]
if (askHrs[0]) deps.push({ task: askHrs[0], dependsOn: [hrmsApi.id, aiVendor.id] })
if (askHrs[1]) deps.push({ task: askHrs[1], dependsOn: [payroll.id] })

console.log('\nSetting dependencies...')
for (const { task, dependsOn } of deps) {
  const { error: e } = await db.from('tasks').update({ depends_on: dependsOn }).eq('id', task.id)
  if (e) { console.error(`  FAIL ${task.name}:`, e.message) }
  else   { console.log(`  OK   ${task.name}  <-- [${dependsOn.map(d => d.slice(0,8)).join(', ')}]`) }
}

console.log('\nDone. Refresh the PERT tab in the browser to see the diagram.')
