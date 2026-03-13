-- Migration 015: Fix RLS Security Linter Errors
-- This migration enables Row Level Security on tables identified by Supabase Linter 
-- to prevent accidental public data exposure.

-- 1. Tournament Seasons
ALTER TABLE IF EXISTS public.tournament_seasons ENABLE ROW LEVEL SECURITY;

-- 2. Squads
ALTER TABLE IF EXISTS public.squads ENABLE ROW LEVEL SECURITY;

-- 3. Match Stakes
ALTER TABLE IF EXISTS public.match_stakes ENABLE ROW LEVEL SECURITY;

-- Optional: Add a simple public read policy for squads as they are frequently viewed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'squads' AND policyname = 'Allow public read access to squads'
    ) THEN
        CREATE POLICY "Allow public read access to squads" ON public.squads
        FOR SELECT USING (true);
    END IF;
END $$;

-- Optional: Add a simple public read policy for seasons
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'tournament_seasons' AND policyname = 'Allow public read access to seasons'
    ) THEN
        CREATE POLICY "Allow public read access to seasons" ON public.tournament_seasons
        FOR SELECT USING (true);
    END IF;
END $$;
