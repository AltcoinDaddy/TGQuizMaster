import { supabase } from './config/supabase';

async function listAllUsers() {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('telegram_id, username, created_at, stats_wins, stats_total_games')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return;
        }

        console.table(users);

    } catch (e) {
        console.error('Execution error:', e);
    }
}

listAllUsers();
