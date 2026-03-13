
import dotenv from 'dotenv';
dotenv.config();
import { supabase } from './src/config/supabase';

async function checkUserDb() {
    const telegramId = 1215058702;
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();
        
    if (error) {
        console.error('Error fetching user:', error);
        return;
    }
    
    console.log('User Data in DB:');
    console.log('- Telegram ID:', data.telegram_id);
    console.log('- Username:', data.username);
    console.log('- Chiliz Wallet:', data.chiliz_wallet_address);
    console.log('- TON Wallet:', data.wallet_address);
}

checkUserDb();
