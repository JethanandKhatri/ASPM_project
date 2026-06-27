-- =====================================================
-- DEMO PROJECT SEED — Smart Learning Management System
-- Run in: Supabase Dashboard > SQL Editor
-- Adds project p4 without touching existing data.
-- Safe to run once. If run again, PK constraint stops duplicates.
-- =====================================================

-- ─── 1. PROJECT ───────────────────────────────────────────────────────────────
INSERT INTO public.projects (id, name, domain, description, team_size, start_date, deadline, status, team_roles)
VALUES (
  'p4',
  'Smart Learning Management System',
  'EdTech',
  'A full-featured LMS for universities covering course management, video lectures, assessments, live sessions and progress tracking. Designed for 10,000+ concurrent students across 200+ courses.',
  6,
  '2025-09-01',
  '2026-08-31',
  'Active',
  '2 Full-Stack Developers, 1 QA Engineer, 1 UI/UX Designer, 1 Business Analyst'
);

-- ─── 2. FEATURES (MoSCoW + Acceptance Criteria + Story Points) ────────────────
INSERT INTO public.features (id, project_id, name, description, priority, status, acceptance_criteria, story_points) VALUES

('p4_f1', 'p4',
  'User Authentication & Roles',
  'Secure login with JWT and role-based access control for Admin, Instructor, and Student',
  'Must Have', 'Done',
  '["User can register with email and password","User can log in and receive a JWT access token","Admin can assign roles: Admin, Instructor, Student","Password reset via email OTP works correctly","Session expires after 24 hours of inactivity","Invalid login attempts are rate-limited after 5 tries"]'::jsonb,
  8),

('p4_f2', 'p4',
  'Course Creation & Management',
  'Instructors create, publish, and organise courses into modules and lessons with media uploads',
  'Must Have', 'Done',
  '["Instructor can create a course with title, description, and thumbnail","Course is organised into modules containing ordered lessons","Instructor can upload PDF, video, and quiz content per lesson","Course can be saved as Draft or Published","Published courses immediately appear in the student catalogue"]'::jsonb,
  13),

('p4_f3', 'p4',
  'Student Enrollment & Payment',
  'Students browse the catalogue and enrol in courses via Stripe checkout',
  'Must Have', 'In Progress',
  '["Student can search and filter the course catalogue by category and price","Stripe payment flow completes without error in under 5 seconds","Successful payment triggers automatic enrollment","Student receives confirmation email within 2 minutes of payment","Refund request can be raised within 7 days of enrollment"]'::jsonb,
  13),

('p4_f4', 'p4',
  'Video Lecture Delivery (CDN)',
  'Stream recorded lectures via AWS CloudFront with adaptive bitrate playback and resume support',
  'Must Have', 'In Progress',
  '["Video player loads within 3 seconds on a 10 Mbps connection","Adaptive bitrate switches quality without rebuffering","Student watch progress (%) is auto-saved every 30 seconds","Video resumes from last watched position on re-entry","Instructor can replace a video without losing student progress data"]'::jsonb,
  21),

('p4_f5', 'p4',
  'Assessments & Auto-Grading',
  'MCQ, true/false, and timed quizzes with automatic scoring and instant feedback',
  'Should Have', 'To Do',
  '["Instructor can create MCQ, true/false, and short-answer questions","Timer countdown is visible and enforced for timed quizzes","Auto-grading returns score within 5 seconds of submission","Student can review correct answers after the quiz deadline","Grade is automatically reflected in the progress dashboard"]'::jsonb,
  13),

('p4_f6', 'p4',
  'Student Progress Dashboard',
  'Visual dashboard showing course completion, quiz scores, and learning streaks',
  'Should Have', 'To Do',
  '["Dashboard shows completion percentage per course and per module","Weekly learning streak is calculated and displayed","Quiz score history is shown as a line chart","Instructor can view class-wide progress aggregates","Dashboard data refreshes within 1 minute of any student activity"]'::jsonb,
  8),

('p4_f7', 'p4',
  'Discussion Forums',
  'Course-level Q&A forums with upvoting, instructor pinning, and moderation tools',
  'Should Have', 'To Do',
  '["Student can post a question or reply within a course forum","Instructor can pin a reply as the accepted solution","Posts can be upvoted; highest-voted posts appear first","Abusive posts can be flagged and removed by moderators","Forum activity triggers a daily email digest for subscribed users"]'::jsonb,
  5),

('p4_f8', 'p4',
  'Live Sessions (Zoom Integration)',
  'Instructors schedule and launch Zoom live classes directly from the platform',
  'Could Have', 'To Do',
  '["Instructor can schedule a session with date, time, duration, and topic","Zoom meeting link is auto-generated via the Zoom API","Students receive an email reminder 1 hour before the session","Session recording is automatically saved and linked to the course","Student attendance is logged per session for reporting"]'::jsonb,
  13),

('p4_f9', 'p4',
  'Certificate Generation (PDF)',
  'Auto-generate branded PDF certificates when students complete all course requirements',
  'Could Have', 'To Do',
  '["Certificate is generated within 30 seconds of 100% course completion","Certificate includes student name, course title, and completion date","A unique QR verification code is embedded in each certificate","Student can download PDF and share directly to LinkedIn","Instructor can preview the certificate template before publishing"]'::jsonb,
  5),

('p4_f10', 'p4',
  'AI Course Recommendations',
  'ML-based engine suggesting next courses based on learning history and peer behaviour',
  'Won''t Have', 'To Do',
  '["Engine suggests 3 relevant courses on the student home page","Recommendations update within 24 hours of course completion","Student can dismiss a recommendation and receive an alternative","Model click-through accuracy measured at >= 75%"]'::jsonb,
  21);

-- ─── 3. TEAM ──────────────────────────────────────────────────────────────────
INSERT INTO public.project_team (id, project_id, name, role, email) VALUES
('p4_t1', 'p4', 'Bilal Haneef',    'project_manager', 'bilal@strix.com'),
('p4_t2', 'p4', 'Ayesha Siddiqui', 'team_member',     'ayesha@strix.com'),
('p4_t3', 'p4', 'Hassan Mirza',    'team_member',     'hassan@strix.com'),
('p4_t4', 'p4', 'Zara Khan',       'team_member',     'zara@strix.com'),
('p4_t5', 'p4', 'Omar Farooq',     'team_member',     'omar@strix.com'),
('p4_t6', 'p4', 'Sana Ijaz',       'team_member',     'sana@strix.com');

-- ─── 4. ESTIMATIONS (3 techniques, all saved) ─────────────────────────────────

-- v1: Expert Judgment (PERT — best/likely/worst per feature)
INSERT INTO public.estimations (id, project_id, version, technique, date, effort, cost, duration, status, effort_num, cost_num, duration_num, data)
VALUES ('p4_e1', 'p4', 'v1', 'Expert Judgment', '2025-09-10',
  '24 staff months', '$120,000', '10 months', 'Saved', 24, 120000, 10,
  '{
    "tasks": [
      {"name": "User Auth & Roles",            "best": 15, "likely": 20, "worst": 30, "expected": 20.83},
      {"name": "Course Creation & Mgmt",       "best": 20, "likely": 30, "worst": 45, "expected": 30.83},
      {"name": "Student Enrollment & Payment", "best": 15, "likely": 22, "worst": 35, "expected": 23.00},
      {"name": "Video Lecture Delivery (CDN)", "best": 25, "likely": 40, "worst": 60, "expected": 40.83},
      {"name": "Assessments & Auto-Grading",   "best": 20, "likely": 30, "worst": 45, "expected": 30.83},
      {"name": "Student Progress Dashboard",   "best": 10, "likely": 15, "worst": 22, "expected": 15.33},
      {"name": "Discussion Forums",            "best":  8, "likely": 12, "worst": 18, "expected": 12.33},
      {"name": "Live Sessions (Zoom)",         "best": 15, "likely": 22, "worst": 35, "expected": 23.00},
      {"name": "Certificate Generation",       "best":  5, "likely":  8, "worst": 12, "expected":  8.17}
    ],
    "totalExpected": 205,
    "sd": 18.5
  }'::jsonb
);

-- v2: Story Points (velocity-based backlog planning)
INSERT INTO public.estimations (id, project_id, version, technique, date, effort, cost, duration, status, effort_num, cost_num, duration_num, data)
VALUES ('p4_e2', 'p4', 'v2', 'Story Points', '2025-09-20',
  '22 staff months', '$115,000', '10 months', 'Saved', 22, 115000, 10,
  '{
    "velocity": 25,
    "totalBacklogSP": 250,
    "iterationLength": 2,
    "iterationsNeeded": 10,
    "totalWeeks": 20,
    "features": [
      {"name": "User Auth & Roles",            "size": "M",  "businessValue": 10, "recommendation": "Include"},
      {"name": "Course Creation & Mgmt",       "size": "L",  "businessValue": 10, "recommendation": "Include"},
      {"name": "Student Enrollment & Payment", "size": "L",  "businessValue":  9, "recommendation": "Include"},
      {"name": "Video Lecture Delivery (CDN)", "size": "XL", "businessValue":  9, "recommendation": "Include"},
      {"name": "Assessments & Auto-Grading",   "size": "L",  "businessValue":  8, "recommendation": "Include"},
      {"name": "Student Progress Dashboard",   "size": "M",  "businessValue":  8, "recommendation": "Include"},
      {"name": "Discussion Forums",            "size": "S",  "businessValue":  7, "recommendation": "Include"},
      {"name": "Live Sessions (Zoom)",         "size": "L",  "businessValue":  6, "recommendation": "Consider dropping"},
      {"name": "Certificate Generation",       "size": "S",  "businessValue":  7, "recommendation": "Include"},
      {"name": "AI Course Recommendations",    "size": "XL", "businessValue":  5, "recommendation": "Drop — out of scope"}
    ]
  }'::jsonb
);

-- v3: Fuzzy Logic (LOC classification)
INSERT INTO public.estimations (id, project_id, version, technique, date, effort, cost, duration, status, effort_num, cost_num, duration_num, data)
VALUES ('p4_e3', 'p4', 'v3', 'Fuzzy Logic', '2025-10-05',
  '22 staff months', '$110,000', '9 months', 'Saved', 22, 110000, 9,
  '{
    "locPerCategory": {
      "verySmall": 100,
      "small": 300,
      "medium": 600,
      "large": 1200,
      "veryLarge": 2400
    },
    "featureClassifications": {
      "p4_f1": "medium",
      "p4_f2": "large",
      "p4_f3": "large",
      "p4_f4": "veryLarge",
      "p4_f5": "large",
      "p4_f6": "medium",
      "p4_f7": "small",
      "p4_f8": "large",
      "p4_f9": "small",
      "p4_f10": "veryLarge"
    },
    "totalLOC": 10800
  }'::jsonb
);

-- ─── 5. RISKS ─────────────────────────────────────────────────────────────────
INSERT INTO public.risks (id, project_id, description, category, probability, impact, cost_impact, risk_exposure, priority, status, mitigation, monitoring, management) VALUES

('p4_r1', 'p4',
  'Video streaming CDN costs exceed cloud budget',
  'Technology', 60, 5, 30000, 18000, 'High', 'Open',
  'Negotiate AWS reserved capacity pricing; implement adaptive bitrate to reduce data transfer costs',
  'Review AWS Cost Explorer weekly; billing alert set at 80% of monthly cloud budget',
  'Pre-approved contingency of $25,000 reserved for infrastructure scaling; escalate to sponsor if exceeded'),

('p4_r2', 'p4',
  'Stripe payment gateway integration failure blocks student enrollment',
  'Technology', 50, 4, 30000, 15000, 'High', 'In Progress',
  'Use Stripe official SDK with full sandbox testing; implement webhook retry logic with exponential backoff',
  'Monitor Stripe status page daily; automated payment smoke tests run every 6 hours in staging',
  'Fallback to PayPal integration if Stripe is unavailable; manual enrollment process documented for critical cases'),

('p4_r3', 'p4',
  'FERPA student data privacy compliance gap identified',
  'Business Impact', 40, 5, 50000, 20000, 'High', 'In Progress',
  'Engage FERPA compliance consultant; implement data anonymisation, consent flows, and full audit logging',
  'Monthly compliance review with legal; automated PII scan on all new data exports and integrations',
  'Cyber insurance policy active; data breach response plan documented and tested quarterly'),

('p4_r4', 'p4',
  'Scope creep from new faculty feature requests expanding backlog',
  'Schedule', 50, 3, 16000, 8000, 'Medium', 'Open',
  'Formal change request process with PM sign-off; MoSCoW re-prioritisation at every sprint review',
  'Track all change requests with effort estimate; reviewed at bi-weekly steering committee',
  'Time-box all new requests to the next major release; communicate deadline impact to stakeholders in writing'),

('p4_r5', 'p4',
  'Browser compatibility issues on older student devices',
  'Technology', 30, 2, 10000, 3000, 'Medium', 'Open',
  'Target ES2019 transpilation with Babel; test on Chrome 80+, Firefox 78+, Safari 13+, Edge 88+',
  'Cross-browser CI pipeline runs on every pull request; BrowserStack test matrix maintained',
  'Progressive enhancement fallback for unsupported features; compatibility notice displayed to unsupported browsers'),

('p4_r6', 'p4',
  'Timezone mismatches causing incorrect live session scheduling for international students',
  'Customer', 20, 2, 10000, 2000, 'Low', 'Resolved',
  'Store all session times in UTC; display in student''s local timezone using the browser Intl API',
  'QA tests across 5 timezone regions before each release; tested in UTC+0, +5:30, +8, -5, -8',
  'Timezone-aware session scheduler shipped in Sprint 3 (Nov 2025); zero timezone-related incidents reported since');

-- ─── 6. TASKS ─────────────────────────────────────────────────────────────────
INSERT INTO public.tasks (id, project_id, name, assignee, priority, due_date, status, feature, description) VALUES

('p4_task1', 'p4',
  'JWT auth backend with refresh token rotation',
  'Hassan Mirza', 'Must Have', '2025-11-15', 'Done',
  'User Authentication & Roles',
  'Implement JWT access tokens (15-min TTL) with refresh token rotation stored in HttpOnly cookies. Rate-limit endpoint at 5 attempts/15 min.'),

('p4_task2', 'p4',
  'Course editor drag-and-drop lesson ordering',
  'Omar Farooq', 'Must Have', '2025-12-10', 'Done',
  'Course Creation & Management',
  'React DnD-based lesson reordering within modules; persist sort order to backend on drop event with optimistic UI.'),

('p4_task3', 'p4',
  'Stripe Checkout Session + webhook enrollment handler',
  'Hassan Mirza', 'Must Have', '2026-07-15', 'In Progress',
  'Student Enrollment & Payment',
  'Backend creates Stripe Checkout Session; handle payment_intent.succeeded webhook to trigger automatic enrollment and send confirmation email.'),

('p4_task4', 'p4',
  'AWS S3 upload pipeline + CloudFront distribution',
  'Ayesha Siddiqui', 'Must Have', '2026-07-30', 'In Progress',
  'Video Lecture Delivery (CDN)',
  'Presigned S3 upload from browser; transcode via AWS MediaConvert to HLS; distribute via CloudFront signed URLs with 24-hour expiry.'),

('p4_task5', 'p4',
  'Quiz engine with MCQ auto-grading',
  'Ayesha Siddiqui', 'Should Have', '2026-08-15', 'To Do',
  'Assessments & Auto-Grading',
  'Server-side quiz submission handler; compare against encrypted answer key; return per-question feedback and final score in < 5 seconds.'),

('p4_task6', 'p4',
  'Student analytics charts (Recharts)',
  'Hassan Mirza', 'Should Have', '2026-08-18', 'To Do',
  'Student Progress Dashboard',
  'Line chart for quiz score history; radial progress ring per course; learning streak counter with local timezone correction.'),

('p4_task7', 'p4',
  'Forum CRUD + moderator flag and pin actions',
  'Ayesha Siddiqui', 'Should Have', '2026-08-22', 'To Do',
  'Discussion Forums',
  'REST endpoints for post/reply create, read, update, delete; role-check for pin/delete; upvote with idempotent toggle; daily digest email job.'),

('p4_task8', 'p4',
  'Video streaming load test — 1,000 concurrent viewers',
  'Zara Khan', 'Must Have', '2026-07-25', 'To Do',
  'Video Lecture Delivery (CDN)',
  'JMeter test plan simulating 1,000 simultaneous HLS stream requests. Target: p95 latency < 500 ms, zero dropped streams under load.');

-- ─── 7. ACTIVITY LOG ──────────────────────────────────────────────────────────
INSERT INTO public.activity_log (id, project_id, user_name, action, timestamp) VALUES
('p4_a1',  'p4', 'Bilal Haneef',    'created project Smart Learning Management System',                        '2025-09-01T09:00:00Z'),
('p4_a2',  'p4', 'Bilal Haneef',    'added 10 features with MoSCoW priorities and acceptance criteria',        '2025-09-02T10:30:00Z'),
('p4_a3',  'p4', 'Bilal Haneef',    'saved Estimation v1 (Expert Judgment) — 24 staff months / $120,000',     '2025-09-10T14:00:00Z'),
('p4_a4',  'p4', 'Bilal Haneef',    'saved Estimation v2 (Story Points) — 22 staff months / $115,000',        '2025-09-20T11:00:00Z'),
('p4_a5',  'p4', 'Bilal Haneef',    'saved Estimation v3 (Fuzzy Logic) — 22 staff months / $110,000',         '2025-10-05T15:00:00Z'),
('p4_a6',  'p4', 'Bilal Haneef',    'added 6 risks — 3 High, 2 Medium, 1 Low across Technology and Business', '2025-10-15T09:30:00Z'),
('p4_a7',  'p4', 'Hassan Mirza',    'changed feature "User Authentication & Roles" status: To Do → Done',      '2025-11-20T16:00:00Z'),
('p4_a8',  'p4', 'Omar Farooq',     'changed feature "Course Creation & Management" status: To Do → Done',     '2025-12-15T13:00:00Z'),
('p4_a9',  'p4', 'Bilal Haneef',    'changed feature "Student Enrollment & Payment" status: To Do → In Progress', '2026-01-10T09:00:00Z'),
('p4_a10', 'p4', 'Bilal Haneef',    'changed feature "Video Lecture Delivery (CDN)" status: To Do → In Progress', '2026-02-01T09:00:00Z'),
('p4_a11', 'p4', 'Sana Ijaz',       'updated Risk "FERPA compliance gap" status: Open → In Progress',          '2026-03-01T10:00:00Z'),
('p4_a12', 'p4', 'Zara Khan',       'marked Risk "Timezone mismatches" as Resolved — timezone scheduler deployed', '2026-04-15T14:00:00Z'),
('p4_a13', 'p4', 'Bilal Haneef',    'updated Risk "Stripe integration failure" status: Open → In Progress',    '2026-05-01T09:00:00Z'),
('p4_a14', 'p4', 'Ayesha Siddiqui', 'added task: AWS S3 upload pipeline + CloudFront distribution',            '2026-05-15T11:00:00Z'),
('p4_a15', 'p4', 'Zara Khan',       'added task: Video streaming load test — 1,000 concurrent viewers',        '2026-06-10T10:00:00Z');

-- ─── 8. COMMENTS ──────────────────────────────────────────────────────────────
INSERT INTO public.comments (id, project_id, author, text, timestamp, replies) VALUES

('p4_c1', 'p4', 'Bilal Haneef',
  'Sprint 5 planning complete. Stripe integration is our critical path this sprint — Hassan is leading, Zara will start payment test cases in parallel. Target: full payment flow done by July 15 so enrollment unblocks.',
  '2026-03-15T10:00:00Z', '[]'::jsonb),

('p4_c2', 'p4', 'Ayesha Siddiqui',
  'Video upload pipeline is ~60% complete. S3 bucket and presigned URL endpoint are working. CloudFront distribution and MediaConvert transcoding job are pending AWS IAM role approval — raised ticket with DevOps.',
  '2026-05-10T14:30:00Z', '[]'::jsonb),

('p4_c3', 'p4', 'Zara Khan',
  'Starting regression testing for the payment and enrollment flow next week. 42 test cases documented covering happy path, edge cases, refund flow, and webhook failure scenarios. Will share TestRail report by July 20.',
  '2026-06-20T09:00:00Z', '[]'::jsonb);

-- ─── DONE ─────────────────────────────────────────────────────────────────────
SELECT 'Demo project p4 (Smart LMS) seeded successfully — refresh the app to see it.' AS result;
