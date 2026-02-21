import { supabase } from './config/supabase';

async function analyzeTxs() {
    try {
        const { data: txs } = await supabase.from('transactions').select('user_id, type');
        if (!txs) return;

        const userStats = new Map();
        for (const t of txs) {
            if (!userStats.has(t.user_id)) {
                userStats.set(t.user_id, new Set());
            }
            userStats.get(t.user_id).add(t.type);
        }

        console.log(`TOTAL UNIQUE TRANSACTORS: ${userStats.size}`);
        userStats.forEach((types, id) => {
            console.log(`User ${id}: ${Array.from(types).join(', ')}`);
        });

    } catch (e) {
        console.error(e);
    }
}

analyzeTxs();
