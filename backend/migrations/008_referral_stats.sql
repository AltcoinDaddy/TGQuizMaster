-- Add stats_referrals column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stats_referrals INT DEFAULT 0;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_users_stats_referrals ON public.users (stats_referrals DESC);

-- Comment for clarity
COMMENT ON COLUMN public.users.stats_referrals IS 'Count of successfully referred users';
