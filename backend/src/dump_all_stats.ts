import { supabase } from './config/supabase';

async function dumpStats() {
    try {
        const { data: users } = await supabase.from('users').select('*');
        if (!users) return;

        console.log(`TOTAL USERS: ${users.length}`);
        console.log(`USERS WITH XP > 0: ${users.filter(u => (u.stats_xp || 0) > 0).length}`);
        console.log(`USERS WITH WINS > 0: ${users.filter(u => (u.stats_wins || 0) > 0).length}`);
        console.log(`USERS WITH WALLET: ${users.filter(u => u.wallet_address).length}`);
        console.log(`USERS WITH REFERRER: ${users.filter(u => u.referred_by).length}`);

        const { data: tourneys } = await supabase.from('tournaments').select('*');
        console.log(`TOTAL TOURNAMENTS: ${tourneys?.length}`);

        const { data: txs } = await supabase.from('transactions').select('*');
        console.log(`TOTAL TRANSACTIONS: ${txs?.length}`);

        // Check referral counts specifically
        const refMap = new Map();
        for (const u of users) {
            if (u.referred_by) {
                refMap.set(u.referred_by, (refMap.get(u.referred_by) || 0) + 1);
            }
        }
        console.log("REFERRAL COUNTS PER ID:");
        refMap.forEach((count, id) => console.log(`  ID ${id}: ${count}`));

        // Check created_at distribution
        const dateMap = new Map();
        for (const u of users) {
            const date = u.created_at.split('T')[0];
            dateMap.set(date, (dateMap.get(date) || 0) + 1);
        }
        console.log("USERS BY DATE:");
        dateMap.forEach((count, date) => console.log(`  ${date}: ${count}`));

    } catch (e) {
        console.error(e);
    }
}

dumpStats();
