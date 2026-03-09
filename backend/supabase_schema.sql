-- Users Table
create table public.users (
  telegram_id bigint primary key,
  username text,
  first_name text,
  is_pro boolean default false,
  balance_stars int default 0,
  balance_ton numeric default 0.0,
  stats_total_games int default 0,
  stats_wins int default 0,
  stats_streak int default 0,
  stats_level int default 1,
  stats_xp int default 0,
  inventory text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tournaments Table
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text check (status in ('upcoming', 'live', 'finished')) default 'upcoming',
  prize_pool int not null,
  currency text check (currency in ('STARS', 'TON')) not null,
  entry_fee int default 0,
  start_time timestamp with time zone default timezone('utc'::text, now()),
  winners jsonb default '[]'::jsonb
);

-- Transactions Table
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id bigint references public.users(telegram_id),
  type text check (type in ('DEPOSIT', 'WITHDRAWAL', 'ENTRY_FEE', 'PRIZE', 'SHOP_PURCHASE')),
  amount numeric not null,
  currency text check (currency in ('STARS', 'TON')),
  metadata jsonb default '{}'::jsonb,
  status text default 'COMPLETED',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Policies (Optional: Enable RLS for security if exposing to frontend directly, 
-- but since we are using backend service role, it's bypassed)
alter table public.users enable row level security;
alter table public.tournaments enable row level security;
alter table public.transactions enable row level security;

-- Tournament Seasons (2-week marathons)
CREATE TABLE tournament_seasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    prize_pool BIGINT NOT NULL, -- 20,000,000 etc
    currency TEXT DEFAULT 'STARS',
    status TEXT DEFAULT 'active', -- 'active', 'finished'
    entry_fee INT DEFAULT 50, -- Added entry fee column
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Link rewards to seasons
ALTER TABLE users ADD COLUMN IF NOT EXISTS season_xp BIGINT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_season_id UUID REFERENCES tournament_seasons(id);

CREATE INDEX IF NOT EXISTS idx_seasons_active ON tournament_seasons(status) WHERE status = 'active';
