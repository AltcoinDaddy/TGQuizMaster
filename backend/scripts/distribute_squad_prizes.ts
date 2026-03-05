import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const PRIZE_POOL = 100; // 100 TON total
const DISTRIBUTION = [50, 30, 20]; // 50%, 30%, 20% for Top 3

async function distributePrizes() {
    console.log('--- Starting Weekly Squad Prize Distribution ---');

    // 1. Fetch top 3 squads by weekly_xp
    const { data: winners, error: winnersError } = await supabase
        .from('squads')
        .select('*')
        .gt('weekly_xp', 0)
        .order('weekly_xp', { ascending: false })
        .limit(3);

    if (winnersError) {
        console.error('Failed to fetch squad winners:', winnersError.message);
        return;
    }

    if (!winners || winners.length === 0) {
        console.log('No squads with XP found this week. Skipping distribution.');
    } else {
        console.log(`Found ${winners.length} squads with XP.`);

        for (const [index, squad] of winners.entries()) {
            const rank = index + 1;
            const amount = DISTRIBUTION[index] || 0;

            console.log(`Rank ${rank}: ${squad.name} (${squad.weekly_xp} XP) -> ${amount} TON`);

            // Log the prize
            await supabase.from('squad_prizes').insert({
                squad_id: squad.id,
                rank,
                amount,
                currency: 'TON'
            });

            // Note: In a production environment, you'd trigger a TON wallet transfer here.
            // For now, we log the winners and they can be processed manually or via a smart contract.
        }
    }

    // 2. Reset weekly_xp for ALL squads
    console.log('Resetting weekly_xp for all squads...');
    const { error: resetError } = await supabase
        .from('squads')
        .update({ weekly_xp: 0 })
        .not('id', 'is', null); // Update all

    if (resetError) {
        console.error('Failed to reset weekly_xp:', resetError.message);
    } else {
        console.log('Weekly XP reset successfully.');
    }

    console.log('--- Distribution Finished ---');
}

distributePrizes().catch(console.error);
