import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!
);

async function migrate() {
    console.log('[MIGRATION 010] Chiliz Dual-Wallet Support\n');

    console.log('[ACTION] Adding column chiliz_wallet_address to users table...');
    const { error } = await supabase.rpc('execute_sql', {
        sql_query: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chiliz_wallet_address text;'
    });

    // Fallback if RPC execute_sql is not available/enabled
    if (error) {
        console.log(`[ALT] execute_sql RPC failed: ${error.message}`);
        console.log('Please run this in your Supabase SQL Editor manually:');
        console.log('\nALTER TABLE public.users ADD COLUMN IF NOT EXISTS chiliz_wallet_address text;\n');
    } else {
        console.log('[RESULT] ✅ Column added successfully via RPC.');
    }

    console.log('[DONE]');
}

migrate().catch(console.error);
