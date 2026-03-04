-- Migration 006: Mystery Chests & Gacha
-- run in Supabase SQL editor

ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_shards INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS inventory_powerups JSONB DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS unlocked_avatars TEXT[] DEFAULT ARRAY[]::text[];

-- Update existing users to have default empty powerups
UPDATE users SET inventory_powerups = '{}'::jsonb WHERE inventory_powerups IS NULL;
UPDATE users SET unlocked_avatars = ARRAY[]::text[] WHERE unlocked_avatars IS NULL;
