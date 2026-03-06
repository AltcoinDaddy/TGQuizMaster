import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function syncReferralCounts() {
    console.log('--- Syncing Referral Counts ---');

    // 1. Fetch all users
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('telegram_id');

    if (userError) {
        console.error('Failed to fetch users:', userError.message);
        return;
    }

    console.log(`Found ${users.length} users to process.`);

    for (const user of users) {
        // 2. Count referrals for this user
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', user.telegram_id);

        if (countError) {
            console.error(`Failed to count referrals for ${user.telegram_id}:`, countError.message);
            continue;
        }

        const referralCount = count || 0;

        // 3. Update the user's stats_referrals column
        const { error: updateError } = await supabase
            .from('users')
            .update({ stats_referrals: referralCount })
            .eq('telegram_id', user.telegram_id);

        if (updateError) {
            console.error(`Failed to update stats_referrals for ${user.telegram_id}:`, updateError.message);
        } else {
            console.log(`Updated ${user.telegram_id}: ${referralCount} referrals`);
        }
    }

    console.log('--- Sync Finished ---');
    process.exit(0);
}

syncReferralCounts().catch(console.error);
