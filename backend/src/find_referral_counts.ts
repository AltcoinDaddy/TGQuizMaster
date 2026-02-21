import { supabase } from './config/supabase';

async function findReferralCounts() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('telegram_id, username');

        if (error) {
            console.error('Error fetching users:', error);
            return;
        }

        for (const user of users) {
            const { count, error: refError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('referred_by', user.telegram_id);

            if (!refError && count === 7) {
                console.log(`USER ${user.username} (${user.telegram_id}) HAS EXACTLY 7 REFERRALS`);
            } else if (!refError && count !== null && count > 0) {
                console.log(`User ${user.username} has ${count} referrals`);
            }
        }

    } catch (e) {
        console.error('Execution error:', e);
    }
}

findReferralCounts();
