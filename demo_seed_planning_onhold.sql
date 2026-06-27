-- =====================================================
-- DEMO SEED — Planning + On Hold Projects
-- p5: AI-Powered HR Management System  → Planning
-- p6: Customer Loyalty Rewards Platform → On Hold
-- Run in: Supabase Dashboard > SQL Editor
-- Safe to re-run — ON CONFLICT DO NOTHING prevents duplicates.
-- =====================================================

-- ═══════════════════════════════════════════════════
-- PROJECT p5 — AI-Powered HR Management System
-- Status: Planning  |  All features To Do  |  1 estimation
-- ═══════════════════════════════════════════════════

INSERT INTO public.projects (id, name, domain, description, team_size, start_date, deadline, status, team_roles)
VALUES (
  'p5',
  'AI-Powered HR Management System',
  'Web',
  'Cloud-based HR platform with AI-driven resume screening, payroll automation, leave tracking, and performance reviews. Targets mid-size organisations with 500–2,000 employees.',
  5,
  '2026-07-01',
  '2027-03-31',
  'Planning',
  '2 Backend Developers, 1 Frontend Developer, 1 QA Engineer, 1 Business Analyst'
) ON CONFLICT (id) DO NOTHING;

-- Features — all To Do, MoSCoW priorities, with Acceptance Criteria
INSERT INTO public.features (id, project_id, name, description, priority, status, acceptance_criteria, story_points)
VALUES
('p5_f1', 'p5', 'Employee Onboarding Portal',
  'Digital onboarding flow for new hires with document upload, policy acknowledgement, and IT provisioning checklist',
  'Must Have', 'To Do',
  '["New hire can complete onboarding in under 30 minutes","System auto-generates IT access request on completion","HR receives notification when onboarding is submitted","All required documents are validated before submission is accepted","Progress is saved at each step so the user can resume later"]'::jsonb, 13),

('p5_f2', 'p5', 'Leave & Attendance Management',
  'Employees apply for leave; managers approve or reject with automated balance calculations and calendar sync',
  'Must Have', 'To Do',
  '["Employee can apply for annual, sick, and unpaid leave","Manager receives approval request within 5 minutes","Leave balance updates immediately after approval","Calendar integration exports approved leave to Google/Outlook","System prevents leave application if balance is insufficient"]'::jsonb, 13),

('p5_f3', 'p5', 'Payroll Processing Engine',
  'Automated monthly payroll calculation with tax deductions, allowances, and PDF payslip generation',
  'Must Have', 'To Do',
  '["Payroll runs automatically on the 25th of each month","Tax deductions are calculated per the configured local tax table","Payslip PDF is emailed to employee within 1 hour of processing","HR can override or manually adjust individual payroll entries","Payroll history is accessible for the last 24 months"]'::jsonb, 21),

('p5_f4', 'p5', 'Performance Review System',
  '360-degree review cycles with goal setting, self-assessment, and manager scoring',
  'Should Have', 'To Do',
  '["HR can create a review cycle with defined start and end dates","Employee completes self-assessment before manager review opens","Manager can score competencies on a 1–5 scale with comments","Final score is visible to employee after HR publishes results","System sends reminders 7 and 3 days before review deadline"]'::jsonb, 13),

('p5_f5', 'p5', 'Recruitment & ATS Module',
  'Job posting, applicant tracking, and interview scheduling with pipeline kanban board',
  'Should Have', 'To Do',
  '["HR can post a job opening with description, requirements, and deadline","Applicants move through stages: Applied → Screening → Interview → Offer","Interview slots are bookable directly from the applicant''s profile","Automated rejection email is sent when applicant is declined","Hiring pipeline metrics are visible on the recruiter dashboard"]'::jsonb, 13),

('p5_f6', 'p5', 'Training & Development Tracker',
  'Assign mandatory training courses, track completion, and log certifications per employee',
  'Could Have', 'To Do',
  '["HR can assign a training course to an individual or department","Employee receives email notification with course link and deadline","Completion status updates automatically on course finish","Certificate expiry is tracked and alert sent 30 days before","Training completion rate is shown on the HR analytics dashboard"]'::jsonb, 8),

('p5_f7', 'p5', 'AI Resume Screening',
  'NLP-based resume parser that ranks applicants by job description match score',
  'Could Have', 'To Do',
  '["Resume parser extracts skills, experience, and education in under 10 seconds","Match score (0–100) is displayed per applicant relative to the job description","HR can set a minimum score threshold to auto-filter applicants","System flags bias keywords and suggests neutral alternatives","Model accuracy is measured at >= 80% against manual HR ranking"]'::jsonb, 13),

('p5_f8', 'p5', 'Employee Self-Service Portal',
  'Mobile-first portal for employees to update personal info, download payslips, and view HR policies',
  'Won''t Have', 'To Do',
  '["Employee can update personal contact details and bank account","Payslips for last 12 months are downloadable as PDF","Company policies are searchable by keyword","Profile photo upload supported with 2MB size limit","All changes trigger an audit log entry visible to HR"]'::jsonb, 8);

-- Team
INSERT INTO public.project_team (id, project_id, name, role, email)
VALUES
('p5_t1', 'p5', 'Bilal Haneef',     'project_manager', 'bilal@strix.com'),
('p5_t2', 'p5', 'Rida Noor',        'team_member',     'rida@strix.com'),
('p5_t3', 'p5', 'Kamran Shah',      'team_member',     'kamran@strix.com'),
('p5_t4', 'p5', 'Nadia Hussain',    'team_member',     'nadia@strix.com'),
('p5_t5', 'p5', 'Sana Ijaz',        'team_member',     'sana@strix.com')
ON CONFLICT (id) DO NOTHING;

-- Estimation — v1 only (project is in Planning phase, one initial estimate)
INSERT INTO public.estimations (id, project_id, version, technique, date, effort, cost, duration, status, effort_num, cost_num, duration_num, data)
VALUES ('p5_e1', 'p5', 'v1', 'Expert Judgment', '2026-07-10',
  '26 staff months', '$130,000', '9 months', 'Saved', 26, 130000, 9,
  '{
    "tasks": [
      {"name": "Employee Onboarding Portal",   "best": 20, "likely": 28, "worst": 40, "expected": 28.33},
      {"name": "Leave & Attendance Mgmt",      "best": 18, "likely": 25, "worst": 38, "expected": 25.33},
      {"name": "Payroll Processing Engine",    "best": 30, "likely": 45, "worst": 65, "expected": 45.83},
      {"name": "Performance Review System",    "best": 20, "likely": 28, "worst": 42, "expected": 28.67},
      {"name": "Recruitment & ATS Module",     "best": 22, "likely": 32, "worst": 48, "expected": 32.33},
      {"name": "Training & Dev Tracker",       "best": 12, "likely": 18, "worst": 28, "expected": 18.33},
      {"name": "AI Resume Screening",          "best": 25, "likely": 35, "worst": 55, "expected": 35.83}
    ],
    "totalExpected": 215,
    "sd": 21.2
  }'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Risks — all Open (project has not started execution)
INSERT INTO public.risks (id, project_id, description, category, probability, impact, cost_impact, risk_exposure, priority, status, mitigation, monitoring, management)
VALUES
('p5_r1', 'p5', 'Payroll tax rules differ per country, increasing compliance scope',
  'Business Impact', 55, 5, 35000, 19250, 'High', 'Open',
  'Define MVP scope to one country; use pluggable tax engine for future locales',
  'Track regulatory changes monthly; subscribe to payroll compliance newsletters',
  'Hire payroll compliance consultant for initial country; document extension architecture'),

('p5_r2', 'p5', 'Integration with client legacy HRMS breaks data migration',
  'Technology', 45, 4, 25000, 11250, 'High', 'Open',
  'Build ETL middleware layer with field-mapping configuration; run migration in staging first',
  'Weekly integration testing in staging environment from month 3 onwards',
  'Fallback: manual CSV import as an alternative to live API integration'),

('p5_r3', 'p5', 'AI resume screening model produces biased rankings',
  'Business Impact', 40, 4, 20000, 8000, 'Medium', 'Open',
  'Use bias-audited pre-trained NLP model; include diverse training dataset; add human override',
  'Quarterly bias audit against demographic benchmarks; track false-positive rejection rates',
  'Disable AI screening and fall back to manual shortlisting if bias audit fails threshold'),

('p5_r4', 'p5', 'HR staff resistance to replacing existing manual processes',
  'Customer', 50, 3, 15000, 7500, 'Medium', 'Open',
  'Run HR co-design workshops during planning; include HR leads in UAT',
  'Monthly adoption readiness survey; track onboarding completion rate post-launch',
  'Assign change management lead; provide 2-week parallel-run period before full cutover'),

('p5_r5', 'p5', 'Scope expansion from stakeholder wish-list during planning',
  'Schedule', 35, 2, 10000, 3500, 'Low', 'Open',
  'Lock scope to signed-off feature list; all additions require formal change request',
  'Review scope document at each sprint planning; flag any additions to steering committee',
  'Move out-of-scope requests to v2 roadmap document; communicate timeline impact clearly')
ON CONFLICT (id) DO NOTHING;

-- Tasks — all To Do (planning phase, no execution yet)
INSERT INTO public.tasks (id, project_id, name, assignee, priority, due_date, status, feature, description)
VALUES
('p5_task1', 'p5', 'Finalise payroll tax engine architecture', 'Kamran Shah', 'Must Have', '2026-07-25', 'To Do',
  'Payroll Processing Engine', 'Design pluggable tax rule engine supporting configurable deduction tables per locale'),
('p5_task2', 'p5', 'HRMS legacy API discovery and field mapping', 'Rida Noor', 'Must Have', '2026-07-28', 'To Do',
  'Employee Onboarding Portal', 'Document all existing HRMS API endpoints; map fields to new schema; identify gaps'),
('p5_task3', 'p5', 'UI/UX wireframes for onboarding flow', 'Nadia Hussain', 'Must Have', '2026-08-05', 'To Do',
  'Employee Onboarding Portal', 'Design lo-fi wireframes for 6-step onboarding wizard; review with HR stakeholders'),
('p5_task4', 'p5', 'AI model vendor evaluation (NLP resume parsing)', 'Sana Ijaz', 'Could Have', '2026-08-10', 'To Do',
  'AI Resume Screening', 'Evaluate 3 NLP vendors: OpenAI embeddings, spaCy, and HuggingFace; produce comparison matrix'),
('p5_task5', 'p5', 'Database schema design — HR core entities', 'Kamran Shah', 'Must Have', '2026-08-15', 'To Do',
  'Leave & Attendance Management', 'Design ERD for Employee, Department, Leave, Payroll, and Review entities with audit trail')
ON CONFLICT (id) DO NOTHING;

-- Activity Log
INSERT INTO public.activity_log (id, project_id, user_name, action, timestamp)
VALUES
('p5_a1', 'p5', 'Bilal Haneef', 'created project AI-Powered HR Management System', '2026-07-01T09:00:00Z'),
('p5_a2', 'p5', 'Bilal Haneef', 'added 8 features with MoSCoW priorities and acceptance criteria', '2026-07-02T10:00:00Z'),
('p5_a3', 'p5', 'Sana Ijaz',    'completed stakeholder requirements workshop — 3 sessions, 12 attendees', '2026-07-05T14:00:00Z'),
('p5_a4', 'p5', 'Bilal Haneef', 'saved Estimation v1 (Expert Judgment) — 26 staff months / $130,000', '2026-07-10T11:00:00Z'),
('p5_a5', 'p5', 'Bilal Haneef', 'added 5 risks — 2 High, 2 Medium, 1 Low', '2026-07-12T09:30:00Z'),
('p5_a6', 'p5', 'Nadia Hussain', 'uploaded project charter and signed scope document to SharePoint', '2026-07-15T13:00:00Z'),
('p5_a7', 'p5', 'Bilal Haneef', 'kick-off meeting held — all stakeholders confirmed, sprint 1 starts Aug 1', '2026-07-20T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Comments
INSERT INTO public.comments (id, project_id, author, text, timestamp, replies)
VALUES
('p5_c1', 'p5', 'Bilal Haneef',
  'Kick-off complete. Scope locked to 7 features for v1 — Employee Self-Service Portal deferred to v2. Sprint 1 starts August 1. Key risk: payroll compliance scope must be resolved in week 1.',
  '2026-07-20T10:30:00Z', '[]'::jsonb),
('p5_c2', 'p5', 'Sana Ijaz',
  'Requirements workshops done. HR team confirmed payroll module is the highest priority — they want it live before the November payroll run. Will flag if scope creep appears in sprint planning.',
  '2026-07-22T14:00:00Z', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════
-- PROJECT p6 — Customer Loyalty Rewards Platform
-- Status: On Hold  |  Paused mid-execution (budget freeze)
-- ═══════════════════════════════════════════════════

INSERT INTO public.projects (id, name, domain, description, team_size, start_date, deadline, status, team_roles)
VALUES (
  'p6',
  'Customer Loyalty Rewards Platform',
  'Mobile',
  'Cross-platform mobile app for a retail loyalty programme with points earning, tiered rewards, partner integrations, and a redemption catalogue. Paused in October 2025 due to Q4 budget freeze.',
  5,
  '2025-05-01',
  '2025-12-31',
  'On Hold',
  '2 Mobile Developers, 1 Backend Developer, 1 QA Engineer, 1 UI/UX Designer'
) ON CONFLICT (id) DO NOTHING;

-- Features — mixed statuses showing mid-execution pause
INSERT INTO public.features (id, project_id, name, description, priority, status, acceptance_criteria, story_points)
VALUES
('p6_f1', 'p6', 'User Registration & Profile',
  'Customer registration with phone OTP, profile management, and linked loyalty card',
  'Must Have', 'Done',
  '["Customer can register with mobile number and email","OTP is delivered within 30 seconds","Profile shows loyalty card number, tier, and points balance","Customer can update name, email, and profile photo","Account deletion removes all PII within 24 hours"]'::jsonb, 8),

('p6_f2', 'p6', 'Points Earning System',
  'Award points on qualifying purchases via POS integration and QR code scan at checkout',
  'Must Have', 'Done',
  '["Points are credited within 60 seconds of a qualifying purchase","QR code scan at POS correctly identifies the customer account","Points calculation applies the correct multiplier for the customer''s tier","Customer receives push notification confirming points earned","Points history is viewable in the app with transaction date and amount"]'::jsonb, 13),

('p6_f3', 'p6', 'Rewards Catalogue',
  'Browsable catalogue of rewards redeemable with points — vouchers, products, and experiences',
  'Must Have', 'In Progress',
  '["Catalogue displays all available rewards with point cost and availability","Customer can filter by category and sort by points cost","Out-of-stock rewards are greyed out and not redeemable","Each reward shows estimated delivery time or collection method","Catalogue refreshes daily from the partner inventory feed"]'::jsonb, 13),

('p6_f4', 'p6', 'Points Redemption Flow',
  'End-to-end redemption with stock check, confirmation, and digital voucher delivery',
  'Must Have', 'In Progress',
  '["Customer can redeem points if balance is sufficient","Stock check runs in real-time before redemption is confirmed","Digital voucher is delivered to the app within 2 minutes","Redemption deducts points from balance immediately","Customer can view all past redemptions with status and expiry"]'::jsonb, 13),

('p6_f5', 'p6', 'Tier Management (Bronze / Silver / Gold)',
  'Automatic tier upgrade and downgrade based on 12-month rolling spend',
  'Should Have', 'To Do',
  '["Tiers are Bronze (0–999 pts), Silver (1,000–4,999 pts), Gold (5,000+ pts)","Tier upgrades trigger an in-app celebration animation and push notification","Gold tier members earn 2× points on all purchases","Tier is recalculated on the first day of each month","Customer can see progress bar showing points needed for next tier"]'::jsonb, 8),

('p6_f6', 'p6', 'Partner Integration API',
  'REST API allowing retail partners to query balances, award points, and trigger redemptions',
  'Should Have', 'To Do',
  '["API supports OAuth 2.0 authentication for partner apps","Balance query responds in under 200 ms at p95","Points award endpoint is idempotent — duplicate requests are ignored","API returns standardised error codes with human-readable messages","Partner sandbox environment available for integration testing"]'::jsonb, 13),

('p6_f7', 'p6', 'Push Notifications & Offers',
  'Personalised push notifications for bonus point events, expiry reminders, and exclusive offers',
  'Could Have', 'To Do',
  '["Customer can opt in or out of each notification category","Bonus point offer notifications are sent at most once per day","Points expiry reminder is sent 14 days and 3 days before expiry","Notification open rate is tracked and reported in the partner dashboard","Notifications are not sent between 10 PM and 8 AM local time"]'::jsonb, 5),

('p6_f8', 'p6', 'Partner Analytics Dashboard',
  'Web dashboard showing redemption rates, active users, and points economics per partner',
  'Won''t Have', 'To Do',
  '["Dashboard shows daily active users, points issued, and redemptions","Partner can filter by date range and outlet location","Data export to CSV available for all metrics","Dashboard refreshes every 4 hours","Access is restricted to partner admin accounts only"]'::jsonb, 13);

-- Team
INSERT INTO public.project_team (id, project_id, name, role, email)
VALUES
('p6_t1', 'p6', 'Bilal Haneef',    'project_manager', 'bilal@strix.com'),
('p6_t2', 'p6', 'Ayesha Siddiqui', 'team_member',     'ayesha@strix.com'),
('p6_t3', 'p6', 'Omar Farooq',     'team_member',     'omar@strix.com'),
('p6_t4', 'p6', 'Zara Khan',       'team_member',     'zara@strix.com'),
('p6_t5', 'p6', 'Hassan Mirza',    'team_member',     'hassan@strix.com')
ON CONFLICT (id) DO NOTHING;

-- Estimations — 2 runs done before project was paused
INSERT INTO public.estimations (id, project_id, version, technique, date, effort, cost, duration, status, effort_num, cost_num, duration_num, data)
VALUES
('p6_e1', 'p6', 'v1', 'Analogy', '2025-05-10',
  '16 staff months', '$80,000', '8 months', 'Saved', 16, 80000, 8,
  '{
    "analogyProject": "Mobile Banking App",
    "analogyLOC": 8500,
    "analogyEffort": 20,
    "analogyCost": 100000,
    "analogyDuration": 7,
    "newLOC": 6800,
    "adjustmentFactor": -15,
    "scaledEffort": 16.2,
    "scaledCost": 81000,
    "scaledDuration": 7.5,
    "notes": "Based on Mobile Banking App. Loyalty app is simpler (no biometric/payment compliance) but adds partner API complexity. Applied -15% adjustment."
  }'::jsonb),

('p6_e2', 'p6', 'v2', 'Story Points', '2025-05-20',
  '18 staff months', '$90,000', '8 months', 'Saved', 18, 90000, 8,
  '{
    "velocity": 22,
    "totalBacklogSP": 175,
    "iterationLength": 2,
    "iterationsNeeded": 8,
    "totalWeeks": 16,
    "features": [
      {"name": "User Registration & Profile",  "size": "M",  "businessValue": 10, "recommendation": "Include"},
      {"name": "Points Earning System",         "size": "L",  "businessValue": 10, "recommendation": "Include"},
      {"name": "Rewards Catalogue",             "size": "L",  "businessValue":  9, "recommendation": "Include"},
      {"name": "Points Redemption Flow",        "size": "L",  "businessValue":  9, "recommendation": "Include"},
      {"name": "Tier Management",               "size": "M",  "businessValue":  8, "recommendation": "Include"},
      {"name": "Partner Integration API",       "size": "L",  "businessValue":  8, "recommendation": "Include"},
      {"name": "Push Notifications & Offers",   "size": "S",  "businessValue":  6, "recommendation": "Include"},
      {"name": "Partner Analytics Dashboard",   "size": "L",  "businessValue":  5, "recommendation": "Drop — out of scope"}
    ]
  }'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Risks — mixed statuses (project was paused mid-execution)
INSERT INTO public.risks (id, project_id, description, category, probability, impact, cost_impact, risk_exposure, priority, status, mitigation, monitoring, management)
VALUES
('p6_r1', 'p6', 'POS integration delays from retail partner IT team',
  'Technology', 60, 5, 30000, 18000, 'High', 'In Progress',
  'Assign dedicated integration engineer; provide partner with sandbox environment and step-by-step guide',
  'Weekly integration status call with partner IT; escalate to partner account manager if blocked > 1 week',
  'Build manual QR-only fallback mode that does not require POS API for launch'),

('p6_r2', 'p6', 'Budget freeze halts project mid-execution',
  'Schedule', 100, 5, 40000, 40000, 'High', 'In Progress',
  'Document current state thoroughly; freeze all feature branches with clear handover notes',
  'Monthly check-in with finance sponsor on budget reinstatement timeline',
  'Project re-scoped to reduced v1 (features 1–4 only) if budget is partially reinstated'),

('p6_r3', 'p6', 'Points ledger double-credit bug under high load',
  'Technology', 35, 5, 25000, 8750, 'High', 'Open',
  'Implement idempotency keys on all points award endpoints; add database-level unique constraint',
  'Run load tests at 2× expected peak before re-launch; monitor transaction logs for duplicates',
  'Auto-rollback transaction if duplicate is detected; alert on-call engineer immediately'),

('p6_r4', 'p6', 'Low customer download rate at launch',
  'Customer', 45, 3, 12000, 5400, 'Medium', 'Open',
  'Partner with retail stores for in-store QR code campaign; incentivise first registration with 500 bonus points',
  'Track daily install and activation rate post-launch; review against targets weekly',
  'Increase marketing budget by $5,000 if week-2 install rate is below 60% of target'),

('p6_r5', 'p6', 'App store rejection due to missing privacy disclosures',
  'Process', 25, 2, 5000, 1250, 'Low', 'Resolved',
  'Pre-submission review against App Store and Google Play guidelines; add explicit data usage disclosure',
  'Submit to TestFlight/Internal Testing 2 weeks before public launch',
  'Privacy policy reviewed by legal and approved Nov 2025 — risk closed')
ON CONFLICT (id) DO NOTHING;

-- Tasks — mix of Done (before pause) and frozen In Progress / To Do
INSERT INTO public.tasks (id, project_id, name, assignee, priority, due_date, status, feature, description)
VALUES
('p6_task1', 'p6', 'Phone OTP registration flow', 'Ayesha Siddiqui', 'Must Have', '2025-06-30', 'Done',
  'User Registration & Profile', 'Firebase Auth OTP with 60-second expiry; profile creation on first login'),
('p6_task2', 'p6', 'POS QR code scan + points credit API', 'Hassan Mirza', 'Must Have', '2025-07-31', 'Done',
  'Points Earning System', 'REST endpoint receives QR scan event from POS; credits points with idempotency key'),
('p6_task3', 'p6', 'Rewards catalogue UI (browse + filter)', 'Omar Farooq', 'Must Have', '2025-09-15', 'In Progress',
  'Rewards Catalogue', 'React Native FlatList with category filter chips; skeleton loader while fetching — PAUSED at ~70%'),
('p6_task4', 'p6', 'Redemption flow — stock check + voucher delivery', 'Hassan Mirza', 'Must Have', '2025-10-01', 'In Progress',
  'Points Redemption Flow', 'Atomic transaction: deduct points + reserve stock + generate voucher code — PAUSED at ~40%'),
('p6_task5', 'p6', 'Tier upgrade calculation cron job', 'Hassan Mirza', 'Should Have', '2025-10-31', 'To Do',
  'Tier Management (Bronze / Silver / Gold)', 'Monthly scheduled job recalculates tier based on rolling 12-month spend; triggers notifications'),
('p6_task6', 'p6', 'Partner OAuth 2.0 API gateway', 'Ayesha Siddiqui', 'Should Have', '2025-11-15', 'To Do',
  'Partner Integration API', 'API gateway with client credentials flow; rate limiting at 100 req/min per partner'),
('p6_task7', 'p6', 'Regression test suite for points engine', 'Zara Khan', 'Must Have', '2025-09-30', 'Done',
  'Points Earning System', '45 automated test cases covering earn, balance, expiry, and edge cases — all passing')
ON CONFLICT (id) DO NOTHING;

-- Activity Log — shows project lifecycle including the pause
INSERT INTO public.activity_log (id, project_id, user_name, action, timestamp)
VALUES
('p6_a1',  'p6', 'Bilal Haneef',    'created project Customer Loyalty Rewards Platform',                    '2025-05-01T09:00:00Z'),
('p6_a2',  'p6', 'Bilal Haneef',    'saved Estimation v1 (Analogy) — 16 staff months / $80,000',           '2025-05-10T14:00:00Z'),
('p6_a3',  'p6', 'Bilal Haneef',    'saved Estimation v2 (Story Points) — 18 staff months / $90,000',      '2025-05-20T11:00:00Z'),
('p6_a4',  'p6', 'Bilal Haneef',    'added 5 risks — 2 High, 2 Medium, 1 Low',                             '2025-05-25T09:30:00Z'),
('p6_a5',  'p6', 'Ayesha Siddiqui', 'changed feature "User Registration & Profile" status: To Do → Done',   '2025-07-05T16:00:00Z'),
('p6_a6',  'p6', 'Hassan Mirza',    'changed feature "Points Earning System" status: To Do → Done',          '2025-08-10T14:00:00Z'),
('p6_a7',  'p6', 'Zara Khan',       'marked Risk "App store rejection" as Resolved',                         '2025-09-05T10:00:00Z'),
('p6_a8',  'p6', 'Omar Farooq',     'changed feature "Rewards Catalogue" status: To Do → In Progress',       '2025-09-10T09:00:00Z'),
('p6_a9',  'p6', 'Hassan Mirza',    'changed feature "Points Redemption Flow" status: To Do → In Progress',  '2025-09-20T11:00:00Z'),
('p6_a10', 'p6', 'Bilal Haneef',    'PROJECT PAUSED — Q4 budget freeze approved by board on Oct 15 2025',   '2025-10-15T17:00:00Z'),
('p6_a11', 'p6', 'Bilal Haneef',    'changed project status: Active → On Hold',                              '2025-10-15T17:05:00Z'),
('p6_a12', 'p6', 'Bilal Haneef',    'all in-progress tasks frozen — handover notes committed to repo',       '2025-10-16T10:00:00Z'),
('p6_a13', 'p6', 'Sana Ijaz',       'budget reinstatement proposal submitted to finance committee',           '2026-01-10T09:00:00Z'),
('p6_a14', 'p6', 'Bilal Haneef',    'finance committee review scheduled for Q3 2026 — awaiting approval',    '2026-04-01T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Comments — capture the on-hold narrative
INSERT INTO public.comments (id, project_id, author, text, timestamp, replies)
VALUES
('p6_c1', 'p6', 'Bilal Haneef',
  'Project is now On Hold as of Oct 15, 2025. Board approved a Q4 budget freeze across all non-critical digital initiatives. Features 1 and 2 are fully done (Registration, Points Earning). Features 3 and 4 (Catalogue, Redemption) are paused at 70% and 40% respectively. All code is committed and documented.',
  '2025-10-15T17:30:00Z', '[]'::jsonb),

('p6_c2', 'p6', 'Hassan Mirza',
  'Handover notes pushed to the repo wiki. The redemption flow atomic transaction is the tricky part — the idempotency key logic is not yet wired to the voucher delivery step. Whoever resumes will need to pick up from PR #47.',
  '2025-10-16T11:00:00Z', '[]'::jsonb),

('p6_c3', 'p6', 'Bilal Haneef',
  'Budget reinstatement proposal submitted to finance in January. Realistic re-start is Q3 2026 if approved. Estimated 6 weeks to complete features 3 and 4, then 4 more weeks for Tier Management and Partner API. Total re-start cost approx $35,000.',
  '2026-04-01T09:30:00Z', '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ─── DONE ─────────────────────────────────────────────────────────────────────
SELECT 'p5 (Planning: AI HR System) and p6 (On Hold: Loyalty Platform) seeded successfully.' AS result;
