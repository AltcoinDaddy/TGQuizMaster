import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
let APP_URL = process.env.VITE_APP_URL || 'https://tgquizmaster.online';
if (APP_URL.startsWith('http://192') || APP_URL.startsWith('http://localhost')) {
    APP_URL = 'https://tgquizmaster.online'; // Force HTTPS production URL for broadcast
}

if (!SUPABASE_URL || !SUPABASE_KEY || !BOT_TOKEN) {
    console.error('Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const bot = new TelegramBot(BOT_TOKEN);

const MESSAGE = `
🚀 *GRAND PRIX: SEASON 2 IS LIVE!* 🏆⚡

The ultimate SportFi marathon has begun! Compete for the biggest prize pool in our history and dominate the new specialized categories.

💰 *HUGE PRIZE POOL*:
🌟 *30,000,000 STARS*
💎 *5,000,000 CP* (TG Points)
*Top 30 players on the leaderboard split the mega pot!*

🏟️ *NEW SPECIALIZED TOPICS*:
⚽ Football | 🏎️ Motorsports | 🎮 eSports 
🎾 Tennis | 🏀 Basketball | 🥊 Combat Sports
🎬 Movies | 🎵 Music

🧠 *MIXED PRACTICE MODE*:
Every practice game now features a random mix of ALL categories! Test your knowledge across the entire SportFi universe.

The season ends in *14 days*. Don't wait—every correct answer in the Arena earns you more XP and CP as we prepare for the official launch!

*Ready to climb the ranks?* 🏁🎯
`.trim();

const KEYBOARD = {
    inline_keyboard: [[
        { text: '🏟️ Enter the Arena', web_app: { url: APP_URL } }
    ]]
};

async function broadcast() {
    console.log('--- Starting Season 2 Broadcast ---');

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
            if (sent % 10 === 0) console.log(`[${sent}/${users.length}] Progressing...`);
        } catch (e: any) {
            if (e.message?.includes('bot was blocked') || e.message?.includes('user is deactivated')) {
                blocked++;
            } else {
                failed++;
                console.error(`Failed for ${user.telegram_id}:`, e.message);
            }
        }
        // Rate limit: ~10 msgs/sec
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('--- Broadcast Finished ---');
    console.log(`Sent: ${sent}`);
    console.log(`Blocked: ${blocked}`);
    console.log(`Failed: ${failed}`);
    process.exit(0);
}

broadcast().catch(console.error);
