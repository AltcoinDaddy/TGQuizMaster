-- Migration 010: Add Chiliz wallet address column for dual-chain support
-- Users now have TWO wallet addresses: wallet_address (TON) and chiliz_wallet_address (Chiliz Chain)

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS chiliz_wallet_address text;
