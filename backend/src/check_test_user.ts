import { supabase } from './config/supabase';

async function checkUser(telegramId: string) {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', telegramId)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            return;
        }

        console.log('USER DATA:', JSON.stringify(user, null, 2));

        const { count, error: refError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', telegramId);

        if (!refError) {
            console.log(`REFERRAL COUNT: ${count ?? 0}`);
        }

    } catch (e) {
        console.error('Execution error:', e);
    }
}

checkUser('123456789');
