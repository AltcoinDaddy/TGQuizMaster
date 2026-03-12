-- Migration 009: SportFi / Chiliz Integration
-- Adds CHZ currency and SPORTFI_REWARD transaction type to support $CHZ rewards

-- 1. Expand the transaction type check to include SportFi reward types
ALTER TABLE public.transactions 
  DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'ENTRY_FEE', 'PRIZE', 'SHOP_PURCHASE', 'SPORTFI_REWARD', 'REFERRAL_BONUS', 'REFERRAL_REWARD', 'DAILY_REWARD', 'MYSTERY_CHEST'));

-- 2. Expand the currency check to include CHZ
ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_currency_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_currency_check
  CHECK (currency IN ('STARS', 'TON', 'CHZ'));

-- 3. Add a $CHZ balance column to the users table for quick lookups
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS balance_chz numeric DEFAULT 0;
