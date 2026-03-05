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
🎁 *NEW: Daily Mystery Chests!* 📦

Your daily rewards just got a massive upgrade! 🚀

Instead of the usual stars, you'll now receive **Mystery Chests** on Day 3, 7, and 14 of your streak!

*What's inside?*
✨ *Stars*: Up to 600 per claim!
⚡ *Power-Ups*: New "Shield" and "Time-Freeze" items!
💎 *Cyber Shards*: Collect 10 to unlock the **Premium Cyber Avatar**!

Don't break your streak—your first chest is waiting! 🧠🏆
`.trim();

const KEYBOARD = {
    inline_keyboard: [[
        { text: '🎁 Claim My Chest', web_app: { url: APP_URL } }
    ]]
};

async function broadcast() {
    console.log('--- Starting Mystery Chests Broadcast ---');

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
        // Rate limit: ~30 msgs/sec, take it slow
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('--- Broadcast Finished ---');
    console.log(`Sent: ${sent}`);
    console.log(`Blocked: ${blocked}`);
    console.log(`Failed: ${failed}`);
}

broadcast().catch(console.error);
