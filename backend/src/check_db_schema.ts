
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

async function checkColumns() {
    const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)
        .single();
        
    if (error) {
        console.error('Fetch error:', error);
        return;
    }
    
    console.log('User Columns:', Object.keys(user));
}

checkColumns();
