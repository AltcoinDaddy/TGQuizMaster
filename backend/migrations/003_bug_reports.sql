-- Bug Reports Table
CREATE TABLE IF NOT EXISTS bug_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(telegram_id),
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'new', -- new, reviewed, resolved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for admin queries
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
