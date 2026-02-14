
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReferralLogic() {
    console.log('🧪 Testing Database Referral Logic...');

    const referrerId = 111111; // Fake Referrer
    const refereeId = 222222;  // Fake Referee

    // 1. Cleanup previous test
    await supabase.from('users').delete().eq('telegram_id', referrerId);
    await supabase.from('users').delete().eq('telegram_id', refereeId);

    // 2. Create Referrer
    console.log('Creating Referrer (User A)...');
    const { error: err1 } = await supabase.from('users').insert({
        telegram_id: referrerId,
        username: 'Referrer_User',
        balance_stars: 0
    });
    if (err1) console.error('Error creating referrer:', err1);

    // 3. Create Referee (User B) linked to User A
    console.log('Creating Referee (User B) with referred_by = User A...');
    const { error: err2 } = await supabase.from('users').insert({
        telegram_id: refereeId,
        username: 'Referee_User',
        referred_by: referrerId,
        balance_stars: 0
    });
    if (err2) {
        console.error('❌ FAILED to create referee. This means the DB schema is likely wrong!');
        console.error('Error:', err2);
    } else {
        console.log('✅ Referee created successfully!');
    }

    // 4. Verify Count
    console.log('Verifying Referral Count for User A...');
    const { count, error: countErr } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', referrerId);

    if (countErr) console.error('Error counting:', countErr);

    console.log(`\n🎉 RESULT: User A has ${count} referrals.`);

    if (count === 1) {
        console.log('✅ DATABASE IS WORKING PERFECTLY.');
        console.log('The issue is definitely that the PRODUCTION BOT is not running the new code.');
    } else {
        console.log('❌ Database logic failed.');
    }

    // Cleanup
    await supabase.from('users').delete().eq('telegram_id', referrerId);
    await supabase.from('users').delete().eq('telegram_id', refereeId);
}

testReferralLogic();
