-- ASPM CASE Tool — Budget & Notifications migration
-- Run this in Supabase SQL Editor AFTER scrum_tables.sql

-- Add budget column to projects (ignored if already exists)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget NUMERIC DEFAULT 0;
