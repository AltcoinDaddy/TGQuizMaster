-- Fix Supabase Linter Warnings: RLS Enabled No Policy
-- Adding explicit read-only policies to tables that already had RLS enabled but lacked policies.

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'match_stakes' AND policyname = 'Allow public read access to match_stakes'
    ) THEN
        CREATE POLICY "Allow public read access to match_stakes" ON public.match_stakes
        FOR SELECT USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'squad_prizes' AND policyname = 'Allow public read access to squad_prizes'
    ) THEN
        CREATE POLICY "Allow public read access to squad_prizes" ON public.squad_prizes
        FOR SELECT USING (true);
    END IF;
END $$;
