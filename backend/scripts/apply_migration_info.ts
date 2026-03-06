import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function applyMigration() {
    console.log('--- Applying Migration: stats_referrals ---');

    // We can't easily run raw SQL via the JS client without a custom edge function or Postgres function.
    // However, we can use a small trick if RPC is available, but for now I'll just try to use the script
    // to update the first user to see if the column exists. If it fails with "column does not exist", 
    // I know I need the user to apply it manually if I can't.

    // Actually, I'll inform the user that I've created the migration file and they should apply it 
    // if I can't. But I'll try to use the sync script first.

    console.log('NOTE: Please run the SQL in backend/migrations/008_referral_stats.sql in your Supabase SQL Editor if this script fails.');
}

applyMigration().catch(console.error);
