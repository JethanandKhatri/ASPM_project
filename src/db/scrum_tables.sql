-- ASPM CASE Tool — Scrum tables migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE IF NOT EXISTS sprints (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  goal                 TEXT DEFAULT '',
  start_date           DATE,
  end_date             DATE,
  status               TEXT DEFAULT 'planned',
  task_ids             JSONB DEFAULT '[]'::jsonb,
  capacity             JSONB DEFAULT '[]'::jsonb,
  completed_task_count INTEGER DEFAULT 0,
  completed_at         DATE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS standup_notes (
  id          TEXT PRIMARY KEY,
  date        DATE NOT NULL,
  member_name TEXT NOT NULL,
  did         TEXT DEFAULT '',
  will        TEXT DEFAULT '',
  blockers    TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dod_items (
  id         TEXT PRIMARY KEY,
  text       TEXT NOT NULL,
  cat        TEXT DEFAULT 'Quality',
  enabled    BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dod_checks (
  feature_id TEXT    NOT NULL,
  item_id    TEXT    NOT NULL REFERENCES dod_items(id) ON DELETE CASCADE,
  checked    BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (feature_id, item_id)
);
