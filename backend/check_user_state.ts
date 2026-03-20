
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function checkUser(userId: number) {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', userId)
        .single();
        
    if (error) {
        console.error('Fetch user error:', error);
        return;
    }
    
    console.log('User State:');
    console.log(JSON.stringify({
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        balance_stars: user.balance_stars
    }, null, 2));
}

checkUser(1215058702);
