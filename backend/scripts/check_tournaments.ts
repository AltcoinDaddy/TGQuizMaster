import { supabase } from './config/supabase';

async function checkTournaments() {
    try {
        const { data: tournaments, error } = await supabase
            .from('tournaments')
            .select('*');

        if (error) {
            console.error('Error fetching tournaments:', error);
            return;
        }

        console.log(`TOTAL TOURNAMENTS: ${tournaments?.length}`);

        const { data: activeRooms } = await supabase
            .from('users')
            .select('telegram_id')
            .not('telegram_id', 'eq', 0); // Active users

        console.log(`TOTAL USERS: ${activeRooms?.length}`);

    } catch (e) {
        console.error('Execution error:', e);
    }
}

checkTournaments();
