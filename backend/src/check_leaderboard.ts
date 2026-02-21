import { supabase } from './config/supabase';

async function checkLeaderboard() {
    try {
        const { data: players, error } = await supabase
            .from('users')
            .select('username, stats_wins, stats_xp')
            .order('stats_wins', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching leaderboard:', error);
            return;
        }

        console.log(`LEADERBOARD PLAYER COUNT: ${players?.length}`);
        console.log('PLAYERS:', JSON.stringify(players, null, 2));

    } catch (e) {
        console.error('Execution error:', e);
    }
}

checkLeaderboard();
