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
🏆 *NEW: Referral Milestone Rewards!*

We just upgraded the referral system with *3 powerful tiers*! 🚀

🥉 *Bronze* — Refer 1 friend → Earn *50 Stars* bonus
🥈 *Silver* — Refer 5 friends → Your name glows *GOLD ✨* on the leaderboard
🥇 *Gold* — Refer 20 friends → Earn *5% lifetime commission* on every Star purchase your referrals make!

The more friends you invite, the bigger your rewards. Gold tier = *passive income forever* 💰

👉 Open the app, tap *Refer & Earn*, and start sharing your link today!
`.trim();

const KEYBOARD = {
    inline_keyboard: [[
        { text: '🔗 Start Referring Now', web_app: { url: APP_URL } }
    ]]
};

async function broadcast() {
    console.log('--- Starting Referral Milestones Broadcast ---');

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
        // Rate limit: ~30 msgs/sec
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('--- Broadcast Finished ---');
    console.log(`Sent: ${sent}`);
    console.log(`Blocked: ${blocked}`);
    console.log(`Failed: ${failed}`);
}

broadcast().catch(console.error);
