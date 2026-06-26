-- =====================================================
-- ASPM v2 Migration: Epic / Story / Release Architecture
-- Run this in: Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Add product_owner to role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('pm','project_manager','scrum_master','developer','line_manager','admin','team_member','product_owner'));

-- =====================================================
-- 2. Epics table (layer above user stories)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.epics (
  id          text PRIMARY KEY,
  project_id  text REFERENCES public.projects(id) ON DELETE CASCADE,
  name        text NOT NULL,
  description text DEFAULT '',
  priority    text DEFAULT 'Medium',
  status      text DEFAULT 'To Do',
  color       text DEFAULT '#3B82F6',
  rank        integer DEFAULT 0,
  release_id  text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE public.epics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth users full access" ON public.epics;
CREATE POLICY "Auth users full access" ON public.epics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 3. Releases table
-- =====================================================
CREATE TABLE IF NOT EXISTS public.releases (
  id           text PRIMARY KEY,
  project_id   text REFERENCES public.projects(id) ON DELETE CASCADE,
  name         text NOT NULL,
  version      text DEFAULT '1.0.0',
  goal         text DEFAULT '',
  release_date date,
  status       text DEFAULT 'Planned',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.releases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth users full access" ON public.releases;
CREATE POLICY "Auth users full access" ON public.releases FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 4. Burndown snapshots (real daily burndown tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.burndown_snapshots (
  id               text PRIMARY KEY,
  sprint_id        text NOT NULL,
  snapshot_date    date NOT NULL,
  remaining_points integer DEFAULT 0,
  completed_points integer DEFAULT 0,
  created_at       timestamptz DEFAULT now(),
  UNIQUE (sprint_id, snapshot_date)
);

ALTER TABLE public.burndown_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth users full access" ON public.burndown_snapshots;
CREATE POLICY "Auth users full access" ON public.burndown_snapshots FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 5. Enhance features table → User Stories
-- =====================================================
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS epic_id             text;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS story_format        text    DEFAULT '';
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS acceptance_criteria jsonb   DEFAULT '[]';
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS story_owner         text    DEFAULT '';
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS story_points        integer DEFAULT 0;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS is_ready            boolean DEFAULT false;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS release_id          text;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS rank                integer DEFAULT 0;
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS risk_ids            jsonb   DEFAULT '[]';
ALTER TABLE public.features ADD COLUMN IF NOT EXISTS dor_checks          jsonb   DEFAULT '{}';

-- =====================================================
-- 6. Enhance tasks table
-- =====================================================
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS story_id     text;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS story_points integer DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS depends_on   jsonb   DEFAULT '[]';

-- =====================================================
-- 7. Enhance sprints table
-- =====================================================
ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS review_notes       text    DEFAULT '';
ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS release_id         text;
ALTER TABLE public.sprints ADD COLUMN IF NOT EXISTS committed_points   integer DEFAULT 0;

-- =====================================================
-- DONE. Run this entire file in Supabase SQL Editor.
-- After running, refresh the app — no data migration needed.
-- Existing features/tasks/sprints will have empty/null story fields.
-- =====================================================
