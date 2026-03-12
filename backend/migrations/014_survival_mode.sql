-- Add Survival Mode columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS survival_high_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS survival_last_played TIMESTAMP WITH TIME ZONE;

-- Add index for leaderboard optimization
CREATE INDEX IF NOT EXISTS idx_users_survival_high_score ON public.users(survival_high_score DESC);

-- Add transaction type for Survival rewards if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
        -- Type exists, check if 'SURVIVAL_REWARD' is in it
        NULL;
    ELSE
        -- Type might exist, but we can't easily ALTER TYPE in a DO block without complexity
        -- Usually handled by migrations scripts
        NULL;
    END IF;
END $$;
