import { supabase } from './config/supabase';

async function checkTxs() {
    try {
        const { data: txs } = await supabase.from('transactions').select('user_id');
        if (!txs) return;

        const uniqueUsers = new Set(txs.map(t => t.user_id));
        console.log(`UNIQUE TRANSACTING USERS: ${uniqueUsers.size}`);
        console.log("USER IDs:", Array.from(uniqueUsers));

    } catch (e) {
        console.error(e);
    }
}

checkTxs();
