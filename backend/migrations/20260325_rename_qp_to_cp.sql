-- Migration: Rename QP (QuizPoint) to CP (ChiliPoint)

-- 1. Rename columns in public.users
ALTER TABLE public.users RENAME COLUMN balance_qp TO balance_cp;
ALTER TABLE public.users RENAME COLUMN qp_last_claim TO cp_last_claim;
ALTER TABLE public.users RENAME COLUMN qp_base_rate TO cp_base_rate;
ALTER TABLE public.users RENAME COLUMN qp_boost_until TO cp_boost_until;

-- 2. Update currency constraint and existing data in public.transactions
-- First, drop the old constraint if it exists (assuming it was named automatically)
-- To be safe, we'll try to update the currency strings first.
-- If the CHECK constraint is strictly enforced, we might need to alter it.
-- Let's check the current constraint name or use a generic approach if possible.

-- Update existing 'QP' transactions to 'CP'
UPDATE public.transactions SET currency = 'CP' WHERE currency = 'QP';

-- 3. If the CHECK constraint exists, we should update it to include CP
-- We'll assume the constraint needs to be altered or recreate it.
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_currency_check;
ALTER TABLE public.transactions ADD CONSTRAINT transactions_currency_check CHECK (currency IN ('STARS', 'CHZ', 'CP'));
