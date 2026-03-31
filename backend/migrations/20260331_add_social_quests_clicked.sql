-- Migration: Add social_quests_clicked column to users
-- Tracks whether a user has clicked GO to visit the TG/X social quest links.
-- Required to prevent claiming TG/X quest rewards without actually opening the links.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS social_quests_clicked JSONB DEFAULT '{}'::jsonb;
