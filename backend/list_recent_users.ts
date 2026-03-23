import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './src/config/supabase';

async function listRecentUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('telegram_id, username, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
        
    if (error) {
        console.error('Error fetching users:', error);
        return;
    }
    
    console.log('Recent Users in DB:');
    data.forEach(user => {
        console.log(`- ID: ${user.telegram_id}, Username: ${user.username}, Created: ${user.created_at}`);
    });
}

listRecentUsers();
