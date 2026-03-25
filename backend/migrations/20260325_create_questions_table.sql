-- Create Questions Table for ChiliQuiz SportFi
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL,
    text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings
    correct_answer TEXT NOT NULL,
    difficulty TEXT DEFAULT 'medium',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    source TEXT DEFAULT 'local'
);

-- Index for faster random selection within category
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow public read (or authenticated if preferred)
CREATE POLICY "Allow public read access to questions"
ON public.questions FOR SELECT
TO anon
USING (true);

-- Allow service role to manage questions (for bulk imports)
CREATE POLICY "Allow service role full access"
ON public.questions FOR ALL
TO service_role
USING (true);

-- Sample insert for verification
-- INSERT INTO public.questions (category, text, options, correct_answer, difficulty) 
-- VALUES ('football', 'Which club won the UEFA Champions League in 2023?', '["Inter Milan", "Manchester City", "Real Madrid", "Liverpool"]', 'Manchester City', 'medium');
