-- Phase 1: Daily Rewards & Streak System + Remove balance_ton
-- Run this in Supabase SQL Editor

-- Remove balance_ton (TON is now fetched live from blockchain)
ALTER TABLE users DROP COLUMN IF EXISTS balance_ton;

-- Streak tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_current INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_last_claim DATE;

-- Daily quest counters
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_games_today INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_wins_today INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_reset_date DATE;
