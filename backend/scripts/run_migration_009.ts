import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

async function migrate() {
    console.log('[MIGRATION 009] SportFi / Chiliz Integration\n');

    // 1. Test current constraints by trying to insert a test CHZ transaction
    console.log('[TEST] Checking if CHZ currency is already supported...');
    const { error: testError } = await supabase.from('transactions').insert({
        user_id: 1215058702,
        type: 'SPORTFI_REWARD',
        amount: 0,
        currency: 'CHZ',
        metadata: { reason: 'Migration Test - Safe to Delete' },
        status: 'COMPLETED'
    });

    if (testError) {
        console.log(`[RESULT] CHZ insert FAILED: ${testError.message}`);
        console.log('\n⚠️  The CHECK constraints need to be updated.');
        console.log('Please run the following SQL in your Supabase Dashboard > SQL Editor:\n');
        console.log('----------- COPY BELOW -----------');
        console.log(`
ALTER TABLE public.transactions 
  DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('DEPOSIT', 'WITHDRAWAL', 'ENTRY_FEE', 'PRIZE', 'SHOP_PURCHASE', 'SPORTFI_REWARD', 'REFERRAL_BONUS', 'REFERRAL_REWARD', 'DAILY_REWARD', 'MYSTERY_CHEST'));

ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_currency_check;

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_currency_check
  CHECK (currency IN ('STARS', 'TON', 'CHZ'));

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS balance_chz numeric DEFAULT 0;
        `.trim());
        console.log('\n----------- END -----------');
    } else {
        console.log('[RESULT] ✅ CHZ insert succeeded! Constraints already support CHZ.');
        // Clean up test row
        await supabase.from('transactions')
            .delete()
            .eq('user_id', 1215058702)
            .eq('type', 'SPORTFI_REWARD')
            .eq('amount', 0);
        console.log('[CLEANUP] Test row removed.');
    }

    // 2. Check for balance_chz column
    console.log('\n[TEST] Checking if balance_chz column exists on users table...');
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('balance_chz')
        .eq('telegram_id', 1215058702)
        .single();

    if (userError) {
        console.log(`[RESULT] balance_chz column missing: ${userError.message}`);
        console.log('Include the ALTER TABLE above to add it.');
    } else {
        console.log(`[RESULT] ✅ balance_chz exists! Current value: ${user.balance_chz}`);
    }

    console.log('\n[DONE]');
}

migrate().catch(console.error);
