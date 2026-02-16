-- Phase 1: Daily Rewards & Streak System
-- Run this in Supabase SQL Editor

-- Streak tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_current INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_last_claim DATE;

-- Daily quest counters
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_games_today INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_wins_today INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_reset_date DATE;
