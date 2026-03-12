import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function runMigration() {
    console.log('Running Migration 013: SportFi Dual-Track Schema...');

    const sql = `
        -- Table for tracking match pools and stakes
        CREATE TABLE IF NOT EXISTS public.match_stakes (
            game_id text PRIMARY KEY,
            total_pool numeric DEFAULT 0,
            platform_fee numeric DEFAULT 0,
            commission_rate numeric DEFAULT 0.10, -- 10% default
            track text DEFAULT 'PRO', -- SOCIAL or PRO
            entry_fee numeric DEFAULT 0,
            currency text DEFAULT 'CHZ',
            is_distributed boolean DEFAULT false,
            created_at timestamp with time zone DEFAULT now()
        );

        -- Ensure users table has necessary columns for survival and high scores
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS survival_high_score int8 DEFAULT 0,
        ADD COLUMN IF NOT EXISTS survival_last_played timestamp with time zone;
    `;

    try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('Migration failed via RPC. Please run the following SQL manually in Supabase SQL Editor:');
            console.log('------------------------------------------------------------');
            console.log(sql);
            console.log('------------------------------------------------------------');
            console.error('RPC Error details:', error);
        } else {
            console.log('Migration successfully applied via RPC.');
        }
    } catch (e: any) {
        console.error('Migration failed with exception:', e.message);
        console.log('Please run the following SQL manually in Supabase SQL Editor:');
        console.log('------------------------------------------------------------');
        console.log(sql);
        console.log('------------------------------------------------------------');
    }
}

runMigration();
