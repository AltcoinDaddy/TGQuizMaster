-- Create Squads Table
CREATE TABLE IF NOT EXISTS public.squads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    telegram_id BIGINT UNIQUE, -- The ID of the Telegram Group/Channel
    avatar_url TEXT,
    total_xp BIGINT DEFAULT 0,
    weekly_xp BIGINT DEFAULT 0,
    member_count INT DEFAULT 0,
    creator_id BIGINT, -- Telegram ID of the creator
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add squad_id to Users Table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS squad_id UUID REFERENCES public.squads(id);

-- Create index for faster squad lookups and rankings
CREATE INDEX IF NOT EXISTS idx_squads_weekly_xp ON public.squads (weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_users_squad_id ON public.users (squad_id);


-- Create Squad Prizes Table (History)
CREATE TABLE IF NOT EXISTS public.squad_prizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    squad_id UUID REFERENCES public.squads(id),
    rank INT,
    amount NUMERIC,
    currency TEXT DEFAULT 'CHZ',
    distributed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.squad_prizes ENABLE ROW LEVEL SECURITY;

