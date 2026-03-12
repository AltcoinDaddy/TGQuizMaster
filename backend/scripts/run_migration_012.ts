import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function runMigration() {
    console.log('Running Migration 012: Adding Survival Mode columns...');

    const sql = `
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS survival_high_score int8 DEFAULT 0,
        ADD COLUMN IF NOT EXISTS survival_last_played timestamp with time zone;
    `;

    try {
        // Try to execute via RPC if available, or just log for manual entry
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
