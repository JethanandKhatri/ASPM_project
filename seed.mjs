import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://eoloamfjluwiluojisxb.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbG9hbWZqbHV3aWx1b2ppc3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE5MzUwMywiZXhwIjoyMDk3NzY5NTAzfQ.fUjRFlE1Fcd4pv4cevh0nTfnoQDPF3VBb7Wsxkkpeck'
const PASSWORD = 'aspm123'

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ─── USERS ───────────────────────────────────────────────────────────────────

const USERS = [
  { email: 'scrummaster@gmail.com',  full_name: 'Alex Johnson',    role: 'scrum_master' },
  { email: 'dev1@gmail.com',         full_name: 'Bilal Ahmed',      role: 'developer' },
  { email: 'dev2@gmail.com',         full_name: 'Sara Khan',        role: 'developer' },
  { email: 'dev3@gmail.com',         full_name: 'Usman Ali',        role: 'developer' },
  { email: 'dev4@gmail.com',         full_name: 'Ahmed Raza',       role: 'developer' },
  { email: 'dev5@gmail.com',         full_name: 'Fatima Malik',     role: 'developer' },
  { email: 'dev6@gmail.com',         full_name: 'Nadia Hussain',    role: 'developer' },
  { email: 'dev7@gmail.com',         full_name: 'Omar Sheikh',      role: 'developer' },
  { email: 'dev8@gmail.com',         full_name: 'Zainab Mirza',     role: 'developer' },
  { email: 'dev9@gmail.com',         full_name: 'Hassan Qureshi',   role: 'developer' },
  { email: 'dev10@gmail.com',        full_name: 'Aisha Siddiqui',   role: 'developer' },
  { email: 'dev11@gmail.com',        full_name: 'Kamran Baig',      role: 'developer' },
  { email: 'dev12@gmail.com',        full_name: 'Sana Iqbal',       role: 'developer' },
  { email: 'dev13@gmail.com',        full_name: 'Tariq Mahmood',    role: 'developer' },
  { email: 'dev14@gmail.com',        full_name: 'Rabia Nawaz',      role: 'developer' },
  { email: 'dev15@gmail.com',        full_name: 'Imran Chaudhry',   role: 'developer' },
]

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

const PROJECTS = [
  {
    id: 'p1', name: 'E-Commerce Website', domain: 'Web', status: 'Completed',
    team_size: 5, start_date: '2024-01-05', deadline: '2024-06-30',
    description: 'A full-featured e-commerce platform with product catalog, cart, checkout, user authentication, and admin panel. Built to handle 50k+ concurrent users with real-time inventory management.',
    features: [
      { id: 'p1_f1', name: 'Product Catalog',     description: 'Browse and search products with filtering',   priority: 'High',   status: 'Done' },
      { id: 'p1_f2', name: 'Shopping Cart',        description: 'Add/remove items, manage quantities',          priority: 'High',   status: 'Done' },
      { id: 'p1_f3', name: 'Checkout',             description: 'Payment processing and order placement',       priority: 'High',   status: 'Done' },
      { id: 'p1_f4', name: 'User Authentication',  description: 'Login, register, password reset',              priority: 'High',   status: 'Done' },
      { id: 'p1_f5', name: 'Order Tracking',       description: 'Track order status and history',               priority: 'Medium', status: 'Done' },
      { id: 'p1_f6', name: 'Admin Panel',          description: 'Manage products, orders, and users',           priority: 'High',   status: 'Done' },
      { id: 'p1_f7', name: 'Search & Filters',     description: 'Advanced product search and filtering',        priority: 'Medium', status: 'Done' },
      { id: 'p1_f8', name: 'Product Reviews',      description: 'Rate and review products',                     priority: 'Low',    status: 'Done' },
    ],
    team: [
      { id: 'p1_t1', name: 'Muquaddas Fatima', role: 'pm',          email: 'muquaddasfatima28@gmail.com' },
      { id: 'p1_t2', name: 'Alex Johnson',     role: 'scrum_master', email: 'scrummaster@gmail.com' },
      { id: 'p1_t3', name: 'Bilal Ahmed',      role: 'developer',    email: 'dev1@gmail.com' },
      { id: 'p1_t4', name: 'Sara Khan',        role: 'developer',    email: 'dev2@gmail.com' },
      { id: 'p1_t5', name: 'Usman Ali',        role: 'developer',    email: 'dev3@gmail.com' },
    ],
    estimations: [
      {
        id: 'p1_e1', version: 'v1', technique: 'Fuzzy Logic', date: '2024-01-10',
        effort: '18 staff months', cost: '$90,000', duration: '6 months', status: 'Saved',
        effort_num: 18, cost_num: 90000, duration_num: 6,
        data: {
          locPerCategory: { verySmall: 100, small: 300, medium: 600, large: 1200, veryLarge: 2400 },
          featureClassifications: { p1_f1: 'large', p1_f2: 'medium', p1_f3: 'large', p1_f4: 'medium', p1_f5: 'small', p1_f6: 'veryLarge', p1_f7: 'medium', p1_f8: 'small' },
          totalLOC: 7600,
        }
      },
      {
        id: 'p1_e2', version: 'v2', technique: 'Expert Judgment', date: '2024-01-18',
        effort: '21 staff months', cost: '$105,000', duration: '7 months', status: 'Saved',
        effort_num: 21, cost_num: 105000, duration_num: 7,
        data: {
          tasks: [
            { name: 'Product Catalog',      best: 20, likely: 30, worst: 45, expected: 31.67 },
            { name: 'Shopping Cart',        best: 10, likely: 15, worst: 25, expected: 15.83 },
            { name: 'Checkout & Payments',  best: 30, likely: 45, worst: 70, expected: 46.67 },
            { name: 'User Auth',            best: 10, likely: 15, worst: 20, expected: 15.0  },
            { name: 'Order Tracking',       best: 8,  likely: 12, worst: 18, expected: 12.33 },
            { name: 'Admin Panel',          best: 25, likely: 40, worst: 60, expected: 41.67 },
            { name: 'Search & Filters',     best: 12, likely: 18, worst: 28, expected: 18.67 },
            { name: 'Reviews',              best: 5,  likely: 8,  worst: 12, expected: 8.17  },
          ],
          totalExpected: 190, sd: 14.2,
        }
      },
    ],
    risks: [
      { id: 'p1_r1', description: 'Payment gateway integration failure',       category: 'Technology',      probability: 40, impact: 5, cost_impact: 15000, risk_exposure: 6000,  priority: 'High',   status: 'Resolved',    mitigation: 'Use well-documented API with sandbox testing', monitoring: 'Weekly integration tests',        management: 'Have backup payment provider ready' },
      { id: 'p1_r2', description: 'Team member attrition during critical phase', category: 'Staff/People',  probability: 25, impact: 4, cost_impact: 20000, risk_exposure: 5000,  priority: 'High',   status: 'Resolved',    mitigation: 'Knowledge documentation and pair programming', monitoring: 'Monthly team satisfaction surveys', management: 'Cross-train all team members' },
      { id: 'p1_r3', description: 'Third-party API rate limits exceeded',       category: 'Technology',      probability: 50, impact: 2, cost_impact: 5000,  risk_exposure: 2500,  priority: 'Medium', status: 'Resolved',    mitigation: 'Implement caching layer',                      monitoring: 'Monitor API usage daily',            management: 'Negotiate higher rate limits' },
      { id: 'p1_r4', description: 'Scope creep from stakeholder requests',      category: 'Business Impact', probability: 60, impact: 3, cost_impact: 10000, risk_exposure: 6000,  priority: 'Medium', status: 'Resolved',    mitigation: 'Strict change control process',                monitoring: 'Weekly scope review meetings',        management: 'Formal change request forms' },
    ],
    comments: [
      { id: 'p1_c1', author: 'Muquaddas Fatima', text: 'Project completed on time. Great team effort!',                              timestamp: '2024-06-30T10:00:00Z', replies: [] },
      { id: 'p1_c2', author: 'Bilal Ahmed',       text: 'Checkout module was the most challenging part but we nailed it.',            timestamp: '2024-06-28T14:30:00Z', replies: [] },
    ],
    tasks: [
      { id: 'p1_task1', name: 'Deploy to production',   assignee: 'Usman Ali',  priority: 'High',   due_date: '2024-06-29', status: 'Done', feature: 'Checkout',          description: 'Final production deployment and smoke tests' },
      { id: 'p1_task2', name: 'Performance testing',    assignee: 'Sara Khan',  priority: 'Medium', due_date: '2024-06-25', status: 'Done', feature: 'Product Catalog',   description: 'Load testing with 50k concurrent users' },
      { id: 'p1_task3', name: 'Security audit',         assignee: 'Bilal Ahmed',priority: 'High',   due_date: '2024-06-15', status: 'Done', feature: 'User Authentication',description: 'OWASP top 10 security checks' },
    ],
    activity_log: [
      { id: 'p1_a1', user_name: 'Muquaddas Fatima', action: 'saved Estimation v2 (Expert Judgment)',   timestamp: '2024-01-18T15:00:00Z' },
      { id: 'p1_a2', user_name: 'Bilal Ahmed',       action: 'updated Risk #1 status to Resolved',      timestamp: '2024-06-20T11:00:00Z' },
      { id: 'p1_a3', user_name: 'Sara Khan',         action: 'added 2 new features',                    timestamp: '2024-01-08T09:00:00Z' },
    ],
  },
  {
    id: 'p2', name: 'Hospital Management System', domain: 'Web', status: 'Active',
    team_size: 7, start_date: '2024-03-01', deadline: '2025-11-30',
    description: 'Comprehensive hospital management system covering patient registration, appointments, billing, pharmacy, and reporting. Designed for a 500-bed hospital with 200+ daily patient interactions.',
    features: [
      { id: 'p2_f1',  name: 'Patient Registration', description: 'Register and manage patient records',        priority: 'High',   status: 'Done'        },
      { id: 'p2_f2',  name: 'Appointments',          description: 'Schedule and manage appointments',           priority: 'High',   status: 'In Progress' },
      { id: 'p2_f3',  name: 'Doctor Schedule',       description: 'Manage doctor availability and shifts',      priority: 'High',   status: 'In Progress' },
      { id: 'p2_f4',  name: 'Lab Results',           description: 'Upload and view lab test results',           priority: 'Medium', status: 'To Do'       },
      { id: 'p2_f5',  name: 'Billing',               description: 'Generate and manage patient bills',          priority: 'High',   status: 'To Do'       },
      { id: 'p2_f6',  name: 'Pharmacy',              description: 'Medication dispensing and inventory',        priority: 'Medium', status: 'To Do'       },
      { id: 'p2_f7',  name: 'Ward Management',       description: 'Bed allocation and ward overview',           priority: 'Medium', status: 'To Do'       },
      { id: 'p2_f8',  name: 'Reports',               description: 'Clinical and administrative reports',        priority: 'Low',    status: 'To Do'       },
      { id: 'p2_f9',  name: 'Staff Management',      description: 'HR and staff records management',            priority: 'Medium', status: 'To Do'       },
      { id: 'p2_f10', name: 'Notifications',         description: 'Alerts and reminders for staff',             priority: 'Low',    status: 'To Do'       },
      { id: 'p2_f11', name: 'Audit Log',             description: 'Track all system actions',                   priority: 'Medium', status: 'To Do'       },
      { id: 'p2_f12', name: 'Role Management',       description: 'User roles and permissions',                 priority: 'High',   status: 'Done'        },
    ],
    team: [
      { id: 'p2_t1', name: 'Muquaddas Fatima', role: 'pm',          email: 'muquaddasfatima28@gmail.com' },
      { id: 'p2_t2', name: 'Alex Johnson',     role: 'scrum_master', email: 'scrummaster@gmail.com' },
      { id: 'p2_t3', name: 'Ahmed Raza',       role: 'developer',    email: 'dev4@gmail.com' },
      { id: 'p2_t4', name: 'Fatima Malik',     role: 'developer',    email: 'dev5@gmail.com' },
      { id: 'p2_t5', name: 'Nadia Hussain',    role: 'developer',    email: 'dev6@gmail.com' },
      { id: 'p2_t6', name: 'Omar Sheikh',      role: 'developer',    email: 'dev7@gmail.com' },
      { id: 'p2_t7', name: 'Zainab Mirza',     role: 'developer',    email: 'dev8@gmail.com' },
    ],
    estimations: [
      {
        id: 'p2_e1', version: 'v1', technique: 'Decomposition', date: '2024-03-10',
        effort: '28 staff months', cost: '$140,000', duration: '9 months', status: 'Saved',
        effort_num: 28, cost_num: 140000, duration_num: 9,
        data: {
          tasks: [
            { name: 'Patient Registration',  best: 25, worst: 45 },
            { name: 'Appointments Module',   best: 20, worst: 40 },
            { name: 'Doctor Schedule',       best: 15, worst: 30 },
            { name: 'Lab Results',           best: 20, worst: 35 },
            { name: 'Billing',               best: 30, worst: 55 },
            { name: 'Pharmacy',              best: 25, worst: 45 },
            { name: 'Ward Management',       best: 20, worst: 38 },
            { name: 'Reports',               best: 15, worst: 30 },
            { name: 'Staff Management',      best: 18, worst: 33 },
            { name: 'Notifications',         best: 10, worst: 20 },
          ],
          sumBest: 198, sumWorst: 371, sd: 28.83, confidence50Low: 256, confidence50High: 314,
        }
      },
      {
        id: 'p2_e2', version: 'v2', technique: 'Story Points', date: '2024-03-18',
        effort: '30 staff months', cost: '$150,000', duration: '9 months', status: 'Saved',
        effort_num: 30, cost_num: 150000, duration_num: 9,
        data: {
          velocity: 25, totalBacklogSP: 210, iterationLength: 2, iterationsNeeded: 9, totalWeeks: 18,
          features: [
            { name: 'Patient Registration', size: 'L',  businessValue: 9, recommendation: 'Include' },
            { name: 'Appointments',         size: 'L',  businessValue: 9, recommendation: 'Include' },
            { name: 'Doctor Schedule',      size: 'M',  businessValue: 8, recommendation: 'Include' },
            { name: 'Lab Results',          size: 'M',  businessValue: 7, recommendation: 'Include' },
            { name: 'Billing',              size: 'XL', businessValue: 9, recommendation: 'Include' },
            { name: 'Pharmacy',             size: 'L',  businessValue: 8, recommendation: 'Include' },
            { name: 'Ward Management',      size: 'M',  businessValue: 7, recommendation: 'Include' },
            { name: 'Reports',              size: 'S',  businessValue: 6, recommendation: 'Include' },
            { name: 'Staff Management',     size: 'M',  businessValue: 7, recommendation: 'Include' },
            { name: 'Notifications',        size: 'S',  businessValue: 5, recommendation: 'Consider dropping' },
            { name: 'Audit Log',            size: 'S',  businessValue: 6, recommendation: 'Include' },
            { name: 'Role Management',      size: 'M',  businessValue: 8, recommendation: 'Include' },
          ]
        }
      },
    ],
    risks: [
      { id: 'p2_r1', description: 'HIPAA compliance requirements not fully understood', category: 'Business Impact', probability: 55, impact: 5, cost_impact: 50000, risk_exposure: 27500, priority: 'High',   status: 'In Progress', mitigation: 'Hire compliance consultant',          monitoring: 'Bi-weekly compliance audits',    management: 'Dedicated compliance officer' },
      { id: 'p2_r2', description: 'Integration with legacy hospital systems',           category: 'Technology',      probability: 65, impact: 5, cost_impact: 30000, risk_exposure: 19500, priority: 'High',   status: 'Open',        mitigation: 'Build API middleware layer',           monitoring: 'Weekly integration testing',     management: 'Fallback to manual data entry if needed' },
      { id: 'p2_r3', description: 'Staff resistance to new system adoption',            category: 'Customer',        probability: 70, impact: 4, cost_impact: 15000, risk_exposure: 10500, priority: 'High',   status: 'In Progress', mitigation: 'Comprehensive training program',       monitoring: 'Monthly adoption metrics',       management: 'Change management specialist' },
      { id: 'p2_r4', description: 'Database performance with large patient records',   category: 'Technology',      probability: 40, impact: 4, cost_impact: 20000, risk_exposure: 8000,  priority: 'Medium', status: 'Open',        mitigation: 'Optimize queries and add indexing',   monitoring: 'Performance benchmarks weekly',  management: 'Database sharding if needed' },
      { id: 'p2_r5', description: 'Unclear billing requirements from hospital',        category: 'Customer',        probability: 50, impact: 3, cost_impact: 12000, risk_exposure: 6000,  priority: 'Medium', status: 'Open',        mitigation: 'Detailed requirements workshops',     monitoring: 'Weekly stakeholder meetings',    management: 'Formal sign-off on requirements' },
      { id: 'p2_r6', description: 'Budget overrun due to scope creep',                 category: 'Schedule',        probability: 35, impact: 2, cost_impact: 8000,  risk_exposure: 2800,  priority: 'Low',    status: 'Open',        mitigation: 'Strict scope management',             monitoring: 'Monthly budget reviews',         management: 'Change request approval process' },
    ],
    comments: [
      { id: 'p2_c1', author: 'Muquaddas Fatima', text: 'We need to prioritize billing module this sprint.',                               timestamp: '2024-11-15T09:00:00Z', replies: [] },
      { id: 'p2_c2', author: 'Ahmed Raza',        text: 'Legacy system integration is taking longer than expected. Need to escalate.',     timestamp: '2024-11-10T14:00:00Z', replies: [] },
    ],
    tasks: [
      { id: 'p2_task1', name: 'Complete patient registration UI',  assignee: 'Bilal Ahmed',   priority: 'High',   due_date: '2024-11-20', status: 'Done',        feature: 'Patient Registration', description: 'Frontend forms and validation' },
      { id: 'p2_task2', name: 'Doctor schedule API integration',   assignee: 'Ahmed Raza',    priority: 'High',   due_date: '2024-11-25', status: 'In Progress', feature: 'Doctor Schedule',      description: 'REST API integration with scheduling service' },
      { id: 'p2_task3', name: 'Billing module design',             assignee: 'Fatima Malik',  priority: 'High',   due_date: '2024-11-28', status: 'To Do',       feature: 'Billing',              description: 'UI design and backend schema for billing' },
      { id: 'p2_task4', name: 'Lab results upload flow',           assignee: 'Nadia Hussain', priority: 'Medium', due_date: '2024-11-30', status: 'To Do',       feature: 'Lab Results',          description: 'File upload and result display' },
    ],
    activity_log: [
      { id: 'p2_a1', user_name: 'Muquaddas Fatima', action: 'saved Estimation v2 (Story Points)',           timestamp: '2024-03-18T15:00:00Z' },
      { id: 'p2_a2', user_name: 'Ahmed Raza',        action: 'updated Risk #2 status to In Progress',        timestamp: '2024-11-12T11:00:00Z' },
      { id: 'p2_a3', user_name: 'Fatima Malik',      action: 'completed Patient Registration feature',       timestamp: '2024-09-15T09:00:00Z' },
    ],
  },
  {
    id: 'p3', name: 'Mobile Banking App', domain: 'Mobile', status: 'Completed',
    team_size: 6, start_date: '2024-02-10', deadline: '2024-09-30',
    description: 'Secure mobile banking application with biometric login, fund transfers, bill payments, and real-time transaction history. PCI-DSS compliant with end-to-end encryption.',
    features: [
      { id: 'p3_f1',  name: 'Login / Biometric',   description: 'Secure login with fingerprint and face ID', priority: 'High',   status: 'Done' },
      { id: 'p3_f2',  name: 'Dashboard',            description: 'Account overview and quick actions',         priority: 'High',   status: 'Done' },
      { id: 'p3_f3',  name: 'Fund Transfer',        description: 'Transfer money to other accounts',           priority: 'High',   status: 'Done' },
      { id: 'p3_f4',  name: 'Bill Pay',             description: 'Pay utility and telecom bills',              priority: 'High',   status: 'Done' },
      { id: 'p3_f5',  name: 'Transaction History',  description: 'View and filter past transactions',          priority: 'Medium', status: 'Done' },
      { id: 'p3_f6',  name: 'Notifications',        description: 'Push notifications for transactions',        priority: 'Medium', status: 'Done' },
      { id: 'p3_f7',  name: 'Card Management',      description: 'Block/unblock cards, view limits',           priority: 'Medium', status: 'Done' },
      { id: 'p3_f8',  name: 'Support Chat',         description: 'In-app customer support',                    priority: 'Low',    status: 'Done' },
      { id: 'p3_f9',  name: 'Settings',             description: 'App preferences and security settings',      priority: 'Low',    status: 'Done' },
      { id: 'p3_f10', name: 'Onboarding',           description: 'New user registration and KYC',              priority: 'High',   status: 'Done' },
    ],
    team: [
      { id: 'p3_t1', name: 'Muquaddas Fatima', role: 'pm',          email: 'muquaddasfatima28@gmail.com' },
      { id: 'p3_t2', name: 'Alex Johnson',     role: 'scrum_master', email: 'scrummaster@gmail.com' },
      { id: 'p3_t3', name: 'Hassan Qureshi',   role: 'developer',    email: 'dev9@gmail.com' },
      { id: 'p3_t4', name: 'Aisha Siddiqui',   role: 'developer',    email: 'dev10@gmail.com' },
      { id: 'p3_t5', name: 'Kamran Baig',      role: 'developer',    email: 'dev11@gmail.com' },
      { id: 'p3_t6', name: 'Sana Iqbal',       role: 'developer',    email: 'dev12@gmail.com' },
    ],
    estimations: [
      {
        id: 'p3_e1', version: 'v1', technique: 'Analogy', date: '2024-02-15',
        effort: '20 staff months', cost: '$100,000', duration: '7 months', status: 'Saved',
        effort_num: 20, cost_num: 100000, duration_num: 7,
        data: {
          analogyProject: 'E-Commerce Website', analogyLOC: 7600, analogyEffort: 18,
          analogyCost: 90000, analogyDuration: 6, newLOC: 8500, adjustmentFactor: 10,
          scaledEffort: 19.8, scaledCost: 99000, scaledDuration: 6.6,
          notes: 'Based on E-Commerce Website. Banking app has similar complexity but adds biometric and security overhead (+10% adjustment).',
        }
      },
      {
        id: 'p3_e2', version: 'v2', technique: 'Story Points', date: '2024-02-22',
        effort: '22 staff months', cost: '$110,000', duration: '7.5 months', status: 'Saved',
        effort_num: 22, cost_num: 110000, duration_num: 7.5,
        data: {
          features: [
            { name: 'Login / Biometric',  size: 'L',  businessValue: 10, recommendation: 'Include' },
            { name: 'Dashboard',          size: 'M',  businessValue: 9,  recommendation: 'Include' },
            { name: 'Fund Transfer',      size: 'XL', businessValue: 10, recommendation: 'Include' },
            { name: 'Bill Pay',           size: 'L',  businessValue: 8,  recommendation: 'Include' },
            { name: 'Transaction History',size: 'M',  businessValue: 8,  recommendation: 'Include' },
            { name: 'Notifications',      size: 'S',  businessValue: 7,  recommendation: 'Include' },
            { name: 'Card Management',    size: 'M',  businessValue: 7,  recommendation: 'Include' },
            { name: 'Support Chat',       size: 'M',  businessValue: 5,  recommendation: 'Consider dropping' },
            { name: 'Settings',           size: 'S',  businessValue: 6,  recommendation: 'Include' },
            { name: 'Onboarding',         size: 'L',  businessValue: 9,  recommendation: 'Include' },
          ]
        }
      },
    ],
    risks: [
      { id: 'p3_r1', description: 'Security vulnerabilities in biometric authentication', category: 'Technology',      probability: 35, impact: 5, cost_impact: 40000, risk_exposure: 14000, priority: 'High',   status: 'Resolved', mitigation: 'Third-party security audit',                        monitoring: 'Penetration testing monthly',           management: 'Emergency security patch process' },
      { id: 'p3_r2', description: 'Regulatory approval delays from central bank',         category: 'Business Impact', probability: 45, impact: 5, cost_impact: 30000, risk_exposure: 13500, priority: 'High',   status: 'Resolved', mitigation: 'Early engagement with regulators',                  monitoring: 'Track regulatory timeline',              management: 'Legal team on standby' },
      { id: 'p3_r3', description: 'App store rejection due to compliance issues',         category: 'Process',         probability: 30, impact: 4, cost_impact: 10000, risk_exposure: 3000,  priority: 'Medium', status: 'Resolved', mitigation: 'Pre-submission review against guidelines',          monitoring: 'Follow app store policy updates',        management: 'Have alternative distribution ready' },
      { id: 'p3_r4', description: 'Network latency affecting transaction processing',     category: 'Technology',      probability: 40, impact: 3, cost_impact: 8000,  risk_exposure: 3200,  priority: 'Medium', status: 'Resolved', mitigation: 'Implement offline-first architecture',              monitoring: 'Performance monitoring in production',   management: 'Fallback to SMS OTP if needed' },
      { id: 'p3_r5', description: 'Low user adoption due to UX complexity',              category: 'Customer',        probability: 25, impact: 2, cost_impact: 5000,  risk_exposure: 1250,  priority: 'Low',    status: 'Resolved', mitigation: 'Usability testing with real users',                monitoring: 'App store ratings and reviews',          management: 'UX improvement sprints post-launch' },
    ],
    comments: [
      { id: 'p3_c1', author: 'Muquaddas Fatima', text: 'Project delivered 2 weeks ahead of schedule! Excellent work everyone.',           timestamp: '2024-09-15T10:00:00Z', replies: [] },
      { id: 'p3_c2', author: 'Hassan Qureshi',   text: 'Biometric integration was complex but the third-party audit really helped.',       timestamp: '2024-09-12T16:00:00Z', replies: [] },
    ],
    tasks: [
      { id: 'p3_task1', name: 'Security audit',          assignee: 'Hassan Qureshi', priority: 'High',   due_date: '2024-09-10', status: 'Done', feature: 'Login / Biometric', description: 'Full penetration testing and OWASP audit' },
      { id: 'p3_task2', name: 'App store submission',    assignee: 'Kamran Baig',    priority: 'High',   due_date: '2024-09-20', status: 'Done', feature: 'Onboarding',        description: 'Submit to App Store and Google Play' },
      { id: 'p3_task3', name: 'Performance benchmarking',assignee: 'Sana Iqbal',     priority: 'Medium', due_date: '2024-09-08', status: 'Done', feature: 'Fund Transfer',     description: 'Load testing transaction throughput' },
    ],
    activity_log: [
      { id: 'p3_a1', user_name: 'Muquaddas Fatima', action: 'saved Estimation v2 (Story Points)',    timestamp: '2024-02-22T15:00:00Z' },
      { id: 'p3_a2', user_name: 'Hassan Qureshi',   action: 'updated Risk #1 status to Resolved',    timestamp: '2024-09-10T11:00:00Z' },
      { id: 'p3_a3', user_name: 'Kamran Baig',      action: 'completed App store submission',         timestamp: '2024-09-20T09:00:00Z' },
    ],
  },
  {
    id: 'p4', name: 'Learning Management System', domain: 'Web', status: 'Active',
    team_size: 6, start_date: '2024-05-01', deadline: '2025-02-28',
    description: 'Online learning platform with course creation, video streaming, quizzes, progress tracking, and certification. Supports 10,000+ concurrent students across 500+ courses.',
    features: [
      { id: 'p4_f1', name: 'Course Builder',       description: 'Drag-and-drop course creation with modules',  priority: 'High',   status: 'Done'        },
      { id: 'p4_f2', name: 'Video Streaming',      description: 'HD video hosting and adaptive streaming',     priority: 'High',   status: 'Done'        },
      { id: 'p4_f3', name: 'Quiz & Assessments',   description: 'Timed quizzes with auto-grading',            priority: 'High',   status: 'In Progress' },
      { id: 'p4_f4', name: 'Progress Tracking',    description: 'Student progress dashboards and analytics',   priority: 'Medium', status: 'In Progress' },
      { id: 'p4_f5', name: 'Certification',        description: 'Auto-generate certificates on completion',    priority: 'Medium', status: 'To Do'       },
      { id: 'p4_f6', name: 'Discussion Forums',    description: 'Per-course discussion boards and Q&A',       priority: 'Low',    status: 'To Do'       },
      { id: 'p4_f7', name: 'Payment Gateway',      description: 'Course purchase and subscription billing',    priority: 'High',   status: 'In Progress' },
      { id: 'p4_f8', name: 'Mobile App',           description: 'iOS and Android app for offline access',      priority: 'Medium', status: 'To Do'       },
      { id: 'p4_f9', name: 'Admin Dashboard',      description: 'Instructor and admin analytics',              priority: 'Medium', status: 'To Do'       },
    ],
    team: [
      { id: 'p4_t1', name: 'Muquaddas Fatima', role: 'pm',          email: 'muquaddasfatima28@gmail.com' },
      { id: 'p4_t2', name: 'Alex Johnson',     role: 'scrum_master', email: 'scrummaster@gmail.com' },
      { id: 'p4_t3', name: 'Tariq Mahmood',    role: 'developer',    email: 'dev13@gmail.com' },
      { id: 'p4_t4', name: 'Rabia Nawaz',      role: 'developer',    email: 'dev14@gmail.com' },
      { id: 'p4_t5', name: 'Imran Chaudhry',   role: 'developer',    email: 'dev15@gmail.com' },
      { id: 'p4_t6', name: 'Sana Iqbal',       role: 'developer',    email: 'dev12@gmail.com' },
    ],
    estimations: [
      {
        id: 'p4_e1', version: 'v1', technique: 'Expert Judgment', date: '2024-05-08',
        effort: '24 staff months', cost: '$120,000', duration: '8 months', status: 'Saved',
        effort_num: 24, cost_num: 120000, duration_num: 8,
        data: {
          tasks: [
            { name: 'Course Builder',     best: 20, likely: 30, worst: 45, expected: 30.83 },
            { name: 'Video Streaming',    best: 25, likely: 38, worst: 55, expected: 38.67 },
            { name: 'Quiz Engine',        best: 15, likely: 22, worst: 32, expected: 22.17 },
            { name: 'Progress Tracking',  best: 10, likely: 15, worst: 22, expected: 15.33 },
            { name: 'Certification',      best: 8,  likely: 12, worst: 18, expected: 12.33 },
            { name: 'Discussion Forums',  best: 10, likely: 16, worst: 24, expected: 16.33 },
            { name: 'Payment Gateway',    best: 18, likely: 28, worst: 40, expected: 28.33 },
            { name: 'Mobile App',         best: 30, likely: 45, worst: 65, expected: 45.83 },
            { name: 'Admin Dashboard',    best: 12, likely: 18, worst: 26, expected: 18.33 },
          ],
          totalExpected: 228, sd: 17.5,
        }
      },
      {
        id: 'p4_e2', version: 'v2', technique: 'Story Points', date: '2024-05-15',
        effort: '26 staff months', cost: '$130,000', duration: '8.5 months', status: 'Saved',
        effort_num: 26, cost_num: 130000, duration_num: 8.5,
        data: {
          velocity: 28, totalBacklogSP: 195, iterationLength: 2, iterationsNeeded: 7, totalWeeks: 14,
          features: [
            { name: 'Course Builder',    size: 'L',  businessValue: 9, recommendation: 'Include' },
            { name: 'Video Streaming',   size: 'XL', businessValue: 10,recommendation: 'Include' },
            { name: 'Quiz Engine',       size: 'M',  businessValue: 8, recommendation: 'Include' },
            { name: 'Progress Tracking', size: 'M',  businessValue: 8, recommendation: 'Include' },
            { name: 'Certification',     size: 'S',  businessValue: 7, recommendation: 'Include' },
            { name: 'Discussion Forums', size: 'M',  businessValue: 6, recommendation: 'Include' },
            { name: 'Payment Gateway',   size: 'L',  businessValue: 9, recommendation: 'Include' },
            { name: 'Mobile App',        size: 'XL', businessValue: 8, recommendation: 'Include' },
            { name: 'Admin Dashboard',   size: 'M',  businessValue: 7, recommendation: 'Include' },
          ]
        }
      },
    ],
    risks: [
      { id: 'p4_r1', description: 'Video CDN costs exceed budget',              category: 'Business Impact', probability: 60, impact: 4, cost_impact: 25000, risk_exposure: 15000, priority: 'High',   status: 'In Progress', mitigation: 'Negotiate CDN contract early',           monitoring: 'Monthly bandwidth usage review', management: 'Compress video before upload' },
      { id: 'p4_r2', description: 'Copyright violations in uploaded content',   category: 'Process',         probability: 45, impact: 5, cost_impact: 40000, risk_exposure: 18000, priority: 'High',   status: 'Open',        mitigation: 'Implement DMCA takedown workflow',       monitoring: 'Weekly content audit',           management: 'Legal team on standby' },
      { id: 'p4_r3', description: 'Scalability under 10k concurrent students', category: 'Technology',      probability: 50, impact: 4, cost_impact: 20000, risk_exposure: 10000, priority: 'High',   status: 'In Progress', mitigation: 'Load test early, auto-scale infrastructure',monitoring: 'Real-time server metrics',       management: 'Cloud burst capacity reserved' },
      { id: 'p4_r4', description: 'Payment gateway integration delays',         category: 'Technology',      probability: 35, impact: 3, cost_impact: 10000, risk_exposure: 3500,  priority: 'Medium', status: 'Open',        mitigation: 'Start Stripe integration in sprint 1',  monitoring: 'Weekly integration test runs',   management: 'Fallback to PayPal' },
      { id: 'p4_r5', description: 'Low instructor adoption',                    category: 'Customer',        probability: 40, impact: 3, cost_impact: 8000,  risk_exposure: 3200,  priority: 'Medium', status: 'Open',        mitigation: 'Free onboarding webinars for instructors',monitoring: 'Weekly signups metric',         management: 'Incentive program for early adopters' },
    ],
    comments: [
      { id: 'p4_c1', author: 'Alex Johnson',     text: 'Video streaming module is looking great. Streaming latency under 2 seconds.',    timestamp: '2024-09-10T09:00:00Z', replies: [] },
      { id: 'p4_c2', author: 'Tariq Mahmood',    text: 'Quiz engine needs more work on randomized question pools before handoff.',         timestamp: '2024-09-08T14:00:00Z', replies: [] },
      { id: 'p4_c3', author: 'Muquaddas Fatima', text: 'Payment gateway is top priority this sprint. Unblocking revenue.',                timestamp: '2024-09-05T10:00:00Z', replies: [] },
    ],
    tasks: [
      { id: 'p4_task1', name: 'Integrate Stripe payments',     assignee: 'Tariq Mahmood',  priority: 'High',   due_date: '2024-09-20', status: 'In Progress', feature: 'Payment Gateway',   description: 'Stripe checkout + webhook handling' },
      { id: 'p4_task2', name: 'Build quiz randomization engine',assignee: 'Rabia Nawaz',    priority: 'High',   due_date: '2024-09-25', status: 'To Do',       feature: 'Quiz & Assessments',description: 'Random question pool with anti-cheat' },
      { id: 'p4_task3', name: 'Design certificate template',   assignee: 'Sana Iqbal',     priority: 'Medium', due_date: '2024-10-05', status: 'To Do',       feature: 'Certification',     description: 'PDF certificate generator' },
      { id: 'p4_task4', name: 'Set up CDN for video delivery', assignee: 'Imran Chaudhry', priority: 'High',   due_date: '2024-09-18', status: 'Done',        feature: 'Video Streaming',   description: 'CloudFront distribution setup' },
    ],
    activity_log: [
      { id: 'p4_a1', user_name: 'Muquaddas Fatima', action: 'created project and added 9 features',       timestamp: '2024-05-01T10:00:00Z' },
      { id: 'p4_a2', user_name: 'Alex Johnson',      action: 'saved Estimation v2 (Story Points)',          timestamp: '2024-05-15T14:00:00Z' },
      { id: 'p4_a3', user_name: 'Imran Chaudhry',    action: 'completed CDN setup for video delivery',     timestamp: '2024-09-18T11:00:00Z' },
    ],
  },
  {
    id: 'p5', name: 'Smart Inventory System', domain: 'Desktop', status: 'Active',
    team_size: 4, start_date: '2024-06-15', deadline: '2025-01-31',
    description: 'Desktop-based inventory management system with barcode scanning, real-time stock alerts, supplier management, purchase orders, and automated reorder triggers for a retail chain.',
    features: [
      { id: 'p5_f1', name: 'Barcode Scanner',      description: 'USB and camera-based barcode scanning',     priority: 'High',   status: 'Done'        },
      { id: 'p5_f2', name: 'Stock Management',      description: 'Real-time stock levels across locations',   priority: 'High',   status: 'Done'        },
      { id: 'p5_f3', name: 'Supplier Management',   description: 'Supplier database and contact management',  priority: 'High',   status: 'In Progress' },
      { id: 'p5_f4', name: 'Purchase Orders',       description: 'Create and track purchase orders',         priority: 'High',   status: 'In Progress' },
      { id: 'p5_f5', name: 'Auto Reorder',          description: 'Trigger reorders when stock hits threshold',priority: 'Medium', status: 'To Do'       },
      { id: 'p5_f6', name: 'Sales Reports',         description: 'Daily, weekly, monthly sales reports',     priority: 'Medium', status: 'To Do'       },
      { id: 'p5_f7', name: 'Multi-location',        description: 'Manage stock across multiple warehouses',   priority: 'Low',    status: 'To Do'       },
    ],
    team: [
      { id: 'p5_t1', name: 'Muquaddas Fatima', role: 'pm',          email: 'muquaddasfatima28@gmail.com' },
      { id: 'p5_t2', name: 'Alex Johnson',     role: 'scrum_master', email: 'scrummaster@gmail.com' },
      { id: 'p5_t3', name: 'Kamran Baig',      role: 'developer',    email: 'dev11@gmail.com' },
      { id: 'p5_t4', name: 'Aisha Siddiqui',   role: 'developer',    email: 'dev10@gmail.com' },
    ],
    estimations: [
      {
        id: 'p5_e1', version: 'v1', technique: 'Analogy', date: '2024-06-20',
        effort: '14 staff months', cost: '$70,000', duration: '5.5 months', status: 'Saved',
        effort_num: 14, cost_num: 70000, duration_num: 5.5,
        data: {
          analogyProject: 'Hospital Management System', analogyLOC: 12000, analogyEffort: 28,
          analogyCost: 140000, analogyDuration: 9, newLOC: 5500, adjustmentFactor: -40,
          scaledEffort: 14.2, scaledCost: 71000, scaledDuration: 5.5,
          notes: 'Inventory system is roughly half the complexity of HMS. Desktop-only reduces frontend effort significantly.'
        }
      },
      {
        id: 'p5_e2', version: 'v2', technique: 'Fuzzy Logic', date: '2024-06-28',
        effort: '13 staff months', cost: '$65,000', duration: '5 months', status: 'Saved',
        effort_num: 13, cost_num: 65000, duration_num: 5,
        data: {
          locPerCategory: { verySmall: 80, small: 250, medium: 500, large: 1000, veryLarge: 2000 },
          featureClassifications: { p5_f1: 'medium', p5_f2: 'large', p5_f3: 'medium', p5_f4: 'large', p5_f5: 'small', p5_f6: 'medium', p5_f7: 'veryLarge' },
          totalLOC: 5830,
        }
      },
    ],
    risks: [
      { id: 'p5_r1', description: 'Barcode scanner hardware compatibility issues', category: 'Technology',      probability: 50, impact: 4, cost_impact: 12000, risk_exposure: 6000, priority: 'High',   status: 'Resolved',    mitigation: 'Test with 5 different scanner models',      monitoring: 'Weekly hardware QA',            management: 'Ship with pre-tested scanner bundle' },
      { id: 'p5_r2', description: 'Data migration from legacy spreadsheets',       category: 'Process',         probability: 65, impact: 3, cost_impact: 8000,  risk_exposure: 5200, priority: 'High',   status: 'In Progress', mitigation: 'Build CSV import wizard',                   monitoring: 'Track import success rate',     management: 'Manual data entry fallback' },
      { id: 'p5_r3', description: 'Multi-location sync conflicts',                 category: 'Technology',      probability: 40, impact: 4, cost_impact: 15000, risk_exposure: 6000, priority: 'Medium', status: 'Open',        mitigation: 'Implement optimistic locking on stock records',monitoring: 'Conflict rate dashboard',      management: 'Manual conflict resolution UI' },
      { id: 'p5_r4', description: 'Staff training time exceeds estimates',         category: 'Staff/People',    probability: 45, impact: 2, cost_impact: 5000,  risk_exposure: 2250, priority: 'Low',    status: 'Open',        mitigation: 'Build in-app tutorial system',              monitoring: 'Track tutorial completion rate',management: 'On-site training sessions' },
    ],
    comments: [
      { id: 'p5_c1', author: 'Kamran Baig',      text: 'Barcode scanner integration is solid. Tested with 8 different scanner models.',  timestamp: '2024-09-01T09:00:00Z', replies: [] },
      { id: 'p5_c2', author: 'Muquaddas Fatima', text: 'Client wants auto-reorder feature moved up in priority. Discussing scope change.', timestamp: '2024-08-28T14:00:00Z', replies: [] },
    ],
    tasks: [
      { id: 'p5_task1', name: 'Build supplier contact UI',     assignee: 'Aisha Siddiqui', priority: 'High',   due_date: '2024-09-15', status: 'In Progress', feature: 'Supplier Management', description: 'CRUD forms for supplier database' },
      { id: 'p5_task2', name: 'Purchase order PDF export',     assignee: 'Kamran Baig',    priority: 'Medium', due_date: '2024-09-22', status: 'To Do',       feature: 'Purchase Orders',    description: 'Generate printable PO as PDF' },
      { id: 'p5_task3', name: 'CSV stock import wizard',       assignee: 'Aisha Siddiqui', priority: 'High',   due_date: '2024-09-10', status: 'Done',        feature: 'Stock Management',   description: 'Import historical stock from Excel/CSV' },
    ],
    activity_log: [
      { id: 'p5_a1', user_name: 'Muquaddas Fatima', action: 'created project with 7 features',              timestamp: '2024-06-15T10:00:00Z' },
      { id: 'p5_a2', user_name: 'Alex Johnson',      action: 'saved Estimation v2 (Fuzzy Logic)',            timestamp: '2024-06-28T15:00:00Z' },
      { id: 'p5_a3', user_name: 'Kamran Baig',       action: 'resolved Risk #1 after hardware testing',     timestamp: '2024-09-01T09:30:00Z' },
    ],
  },
]

const NOTIFICATIONS = [
  { id: 'n1', type: 'deadline',   message: 'Hospital Management System deadline in 7 days',              project_id: 'p2', read: false, timestamp: '2024-11-23T10:00:00Z' },
  { id: 'n2', type: 'risk',       message: 'New High priority risk added to Mobile Banking App',          project_id: 'p3', read: false, timestamp: '2024-11-20T14:30:00Z' },
  { id: 'n3', type: 'estimation', message: 'E-Commerce Website — estimation v2 saved',                    project_id: 'p1', read: true,  timestamp: '2024-11-18T09:00:00Z' },
  { id: 'n4', type: 'task',       message: 'Ahmed Raza assigned you to Doctor Schedule module',           project_id: 'p2', read: true,  timestamp: '2024-11-15T11:00:00Z' },
  { id: 'n5', type: 'comment',    message: 'Bilal Ahmed mentioned you in a comment on E-Commerce Website',  project_id: 'p1', read: true,  timestamp: '2024-11-10T16:00:00Z' },
  { id: 'n6', type: 'risk',       message: 'High risk: Copyright violations flagged on Learning Management System', project_id: 'p4', read: false, timestamp: '2024-09-12T08:00:00Z' },
  { id: 'n7', type: 'task',       message: 'Tariq Mahmood completed CDN setup on Learning Management System',      project_id: 'p4', read: false, timestamp: '2024-09-18T11:30:00Z' },
  { id: 'n8', type: 'estimation', message: 'Smart Inventory System — Fuzzy Logic estimation v2 saved',             project_id: 'p5', read: true,  timestamp: '2024-06-28T15:00:00Z' },
  { id: 'n9', type: 'deadline',   message: 'Smart Inventory System deadline in 60 days',                           project_id: 'p5', read: false, timestamp: '2024-12-01T09:00:00Z' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function log(msg) { process.stdout.write(msg + '\n') }
function ok(label) { log(`  ✓ ${label}`) }
function fail(label, err) { log(`  ✗ ${label}: ${err?.message || err}`) }

async function insert(table, rows, label) {
  if (!rows?.length) return
  const { error } = await admin.from(table).upsert(rows, { onConflict: 'id' })
  if (error) fail(label, error)
  else ok(label)
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  log('\n── Creating users ──────────────────────────────')
  for (const u of USERS) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email, password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    })
    if (error && error.message.includes('already been registered')) {
      ok(`${u.email} (already exists)`)
      continue
    }
    if (error) { fail(u.email, error); continue }

    const { error: pe } = await admin.from('profiles').upsert({
      id: data.user.id, email: u.email, full_name: u.full_name, role: u.role,
    })
    if (pe) fail(`profile ${u.email}`, pe)
    else ok(`${u.email} — ${u.role}`)
  }

  log('\n── Seeding projects ────────────────────────────')
  for (const p of PROJECTS) {
    const { features, team, estimations, risks, comments, tasks, activity_log, ...proj } = p

    const addId = arr => arr.map(r => ({ ...r, project_id: proj.id }))

    await insert('projects', [proj], `project: ${proj.name}`)
    await insert('features',     addId(features),     `  features (${features.length})`)
    await insert('project_team', addId(team),         `  team (${team.length})`)
    await insert('estimations',  addId(estimations),  `  estimations (${estimations.length})`)
    await insert('risks',        addId(risks),        `  risks (${risks.length})`)
    await insert('comments',     addId(comments),     `  comments (${comments.length})`)
    await insert('tasks',        addId(tasks),        `  tasks (${tasks.length})`)
    await insert('activity_log', addId(activity_log), `  activity log (${activity_log.length})`)
  }

  log('\n── Seeding notifications ───────────────────────')
  await insert('notifications', NOTIFICATIONS, `notifications (${NOTIFICATIONS.length})`)

  log('\n Done! Login credentials:')
  log('  Scrum Master : scrummaster@gmail.com / aspm123')
  log('  Developers   : dev1@gmail.com … dev15@gmail.com / aspm123')
  log('  PM (existing): muquaddasfatima28@gmail.com\n')
}

main().catch(console.error)
