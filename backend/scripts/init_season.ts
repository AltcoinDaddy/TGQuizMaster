import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function initSeason() {
    console.log('🚀 Initializing Mega Tournament Season...');

    const startTime = new Date();
    const endTime = new Date();
    endTime.setDate(startTime.getDate() + 14); // 2 weeks

    const { data, error } = await supabase
        .from('tournament_seasons')
        .insert({
            title: 'GRAND PRIX: 20M STARS',
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            prize_pool: 20000000,
            currency: 'STARS',
            status: 'active',
            entry_fee: 50,
            metadata: {
                description: 'The ultimate 2-week marathon. Top 30 split 20 Million Stars!',
                theme: 'gold'
            }
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Failed to create season:', error.message);
    } else {
        console.log('✅ Mega Tournament Season Created:', data.id);
        console.log(`📅 Start: ${data.start_time}`);
        console.log(`⏳ End: ${data.end_time}`);
    }
}

initSeason();
