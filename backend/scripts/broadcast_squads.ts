import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const APP_URL = process.env.VITE_APP_URL || 'https://tgquizmaster.online';

if (!SUPABASE_URL || !SUPABASE_KEY || !BOT_TOKEN) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const bot = new TelegramBot(BOT_TOKEN);

const MESSAGE = `
🛡️ *NEW FEATURE: Squads & Group Battles!* 🛡️

The ultimate team competition has arrived! Form your community, climb the ranks, and dominate the Arena.

🏆 *Weekly 100 TON Prize Pool*
The Top 3 Squads every week share **100 TON**!
🥇 1st: 50 TON
🥈 2nd: 30 TON
🥉 3rd: 20 TON

🚀 *Squad Leader Bonus*
Found or lead a squad to earn a **LIFETIME 5% XP BONUS** on all your game contributions!

🤝 *How to play?*
1. Open the App and tap the **Squads** card on the Home screen.
2. Join a squad from your favorite community or **Create your own**.
3. Every XP you earn helps your squad reach the top!

Recruit your friends and start your journey to 1st place! 🧠🔥
`.trim();

const KEYBOARD = {
    inline_keyboard: [[
        { text: '🛡️ Join a Squad Now', web_app: { url: APP_URL } }
    ]]
};

async function broadcast() {
    console.log('--- Starting Squads Feature Broadcast ---');

    // 1. Fetch all users
    const { data: users, error } = await supabase
        .from('users')
        .select('telegram_id, username')
        .not('telegram_id', 'is', null);

    if (error) {
        console.error('Failed to fetch users:', error.message);
        return;
    }

    console.log(`Targeting ${users.length} users...`);

    let sent = 0;
    let failed = 0;
    let blocked = 0;

    for (const user of users) {
        try {
            await bot.sendMessage(user.telegram_id, MESSAGE, {
                parse_mode: 'Markdown',
                reply_markup: KEYBOARD
            });
            sent++;
            console.log(`[${sent}/${users.length}] Sent to ${user.username || user.telegram_id}`);
        } catch (e: any) {
            if (e.message?.includes('bot was blocked') || e.message?.includes('user is deactivated')) {
                blocked++;
            } else {
                failed++;
                console.error(`Failed for ${user.telegram_id}:`, e.message);
            }
        }
        // Rate limit: ~10 msgs/sec to be safe
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('--- Broadcast Finished ---');
    console.log(`Sent: ${sent}`);
    console.log(`Blocked: ${blocked}`);
    console.log(`Failed: ${failed}`);
}

broadcast().catch(console.error);
