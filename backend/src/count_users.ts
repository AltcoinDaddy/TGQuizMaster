import { supabase } from './config/supabase';

async function countUsers() {
    try {
        const { count, error } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error('Error fetching user count:', error);
            return;
        }

        console.log(`TOTAL USERS IN DATABASE: ${count ?? 0}`);

        const { count: activeCount, error: activeError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gt('stats_total_games', 0);

        if (!activeError) {
            console.log(`TOTAL USERS WHO PLAYED AT LEAST ONE GAME: ${activeCount ?? 0}`);
        }

        const { count: walletCount, error: walletError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .not('wallet_address', 'is', null);

        if (!walletError) {
            console.log(`TOTAL USERS WITH WALLET CONNECTED: ${walletCount ?? 0}`);
        }

        // Daily Breakdown
        console.log('\n--- DAILY SIGNUP BREAKDOWN (Last 10 Days) ---');
        for (let i = 0; i < 10; i++) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            start.setDate(start.getDate() - i);

            const end = new Date(start);
            end.setDate(end.getDate() + 1);

            const { count: dailyCount, error: dailyError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', start.toISOString())
                .lt('created_at', end.toISOString());

            if (!dailyError) {
                console.log(`${start.toISOString().split('T')[0]}: ${dailyCount ?? 0}`);
            }
        }

    } catch (e) {
        console.error('Execution error:', e);
    }
}

countUsers();
