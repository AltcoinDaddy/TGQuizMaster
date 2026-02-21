import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { StarsService } from './utils/StarsService';
import { NotificationService } from './utils/NotificationService';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
export let starsService: StarsService;
export let notificationService: NotificationService;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is missing! Bot will not start.');
} else {
    const bot = new TelegramBot(token, { polling: true });
    starsService = new StarsService(bot);
    notificationService = new NotificationService(bot);

    // WebApp URL for the Menu Button (uses env or hardcoded fallback)
    const webAppUrl = process.env.VITE_APP_URL || 'https://tgquizmaster.online';

    console.log('Telegram Bot initializing...');

    // Polling Error Handling with backoff
    let pollingErrorCount = 0;
    bot.on('polling_error', (error) => {
        pollingErrorCount++;
        // Only log every 10th DNS error to prevent log spam
        if (error.message.includes('EAI_AGAIN') || error.message.includes('ENOTFOUND')) {
            if (pollingErrorCount % 10 === 1) {
                console.error(`Bot Polling Error (DNS failure, occurrence #${pollingErrorCount}): ${error.message}`);
            }
        } else {
            console.error('Bot Polling Error:', error.message);
        }
        if (error.message.includes('409 Conflict')) {
            console.error('CRITICAL: Another instance of this bot is already running. Please terminate other processes.');
        }
    });

    bot.on('error', (error) => {
        console.error('General Bot Error:', error.message);
    });

    console.log('Telegram Bot started and listening for commands.');

    // /start command with support for deep links (referrals)
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const firstName = msg.from?.first_name || 'Champion';
        const startParam = match ? match[1] : null;

        if (startParam && startParam.startsWith('ref_')) {
            const referrerId = startParam.replace('ref_', '');
            console.log(`User ${msg.from?.id} joined via referral from ${referrerId}`);

            try {
                const { supabase } = await import('./config/supabase');
                // Check if user exists, if not, create them with referred_by
                const { data: user, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('telegram_id', msg.from?.id)
                    .single();

                if (fetchError && fetchError.code === 'PGRST116') {
                    // New user via referral — gets 200 Stars welcome bonus
                    await supabase.from('users').insert({
                        telegram_id: msg.from?.id,
                        username: msg.from?.username || 'Anon_Player',
                        referred_by: parseInt(referrerId),
                        balance_stars: 200
                    });

                    // Log welcome bonus transaction
                    await supabase.from('transactions').insert({
                        user_id: msg.from?.id,
                        type: 'PRIZE',
                        amount: 200,
                        currency: 'STARS',
                        metadata: { type: 'WELCOME_BONUS_REFERRAL' },
                        status: 'COMPLETED'
                    });

                    // Reward the referrer with 50 Stars
                    const { data: referrer } = await supabase
                        .from('users')
                        .select('balance_stars')
                        .eq('telegram_id', parseInt(referrerId))
                        .single();

                    if (referrer) {
                        await supabase.from('users')
                            .update({ balance_stars: (referrer.balance_stars || 0) + 50 })
                            .eq('telegram_id', parseInt(referrerId));

                        await supabase.from('transactions').insert({
                            user_id: parseInt(referrerId),
                            type: 'PRIZE',
                            amount: 50,
                            currency: 'STARS',
                            metadata: { type: 'REFERRAL_REWARD', referredUser: msg.from?.id },
                            status: 'COMPLETED'
                        });

                        console.log(`[REFERRAL] Referrer ${referrerId} earned 50 Stars`);

                        // Notify the referrer via Telegram
                        notificationService.notifyReferralReward(
                            parseInt(referrerId),
                            50,
                            msg.from?.username || msg.from?.first_name || 'A friend'
                        );
                    }

                    console.log(`[REFERRAL] New user ${msg.from?.id} got 200 Stars welcome bonus`);
                } else if (user && !user.referred_by) {
                    // Existing user without referrer, update it
                    await supabase.from('users')
                        .update({ referred_by: parseInt(referrerId) })
                        .eq('telegram_id', msg.from?.id);
                    console.log(`[REFERRAL] Updated user ${msg.from?.id} with referrer ${referrerId}`);
                }
            } catch (e) {
                console.error('Referral storage failed:', e);
            }
        }

        bot.sendMessage(chatId, `Welcome to TGQuizMaster, ${firstName}! 🏆\n\nBattle other players in real-time, master trivia, and win real TON rewards.\n\nReady to play?`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🎮 Play Now', web_app: { url: webAppUrl } }
                    ],
                    [
                        { text: '📣 Join Community', url: 'https://t.me/TGQuizMaster' },
                        { text: '❓ How to Play', callback_data: 'how_to_play' }
                    ]
                ]
            }
        });
    });

    // Handle Pre-Checkout (Required for payments)
    bot.on('pre_checkout_query', (query) => {
        bot.answerPreCheckoutQuery(query.id, true);
    });

    // Handle Successful Payment
    bot.on('successful_payment', async (msg) => {
        const chatId = msg.chat.id;
        const payment = msg.successful_payment!;
        const payload = payment.invoice_payload;
        const amount = payment.total_amount; // For Stars, this is the amount

        // Verify and Credit User
        const result = await starsService.verifyPayment(msg.from?.id.toString() || '', payload, amount);

        if (result.success) {
            bot.sendMessage(chatId, `✅ **Payment Successful!**\n\nYou've received your items. Reload the app to see them! 🌟`);
        } else {
            bot.sendMessage(chatId, `⚠️ Payment received but verification failed. Please contact support.`);
        }
    });

    // Handle Callbacks
    bot.on('callback_query', (query) => {
        const chatId = query.message?.chat.id;
        if (!chatId) return;

        if (query.data === 'how_to_play') {
            bot.sendMessage(chatId, `📖 *How to Play TGQuizMaster*

🆓 *Start Free*
Tap Play → Free Practice to try a solo quiz round. No cost, earn Stars & XP for winning!

⚡ *Quick Play (10⭐)*
Tap Play → Stars tab → Quick Play. You're auto-matched into a 5-player room. Answer trivia questions fast — top 3 scorers split the prize pool!

🏆 *Create a Room*
Want custom stakes? Create your own Star room and set the entry fee (10-500⭐). Share with friends or wait for others to join.

💰 *How Scoring Works*
• 10 questions per match, 15 seconds each
• Faster correct answers = more points
• 1st place gets 60%, 2nd gets 30%, 3rd gets 10%

⭐ *Earning Stars*
• Win practice games: +5⭐
• Win tournaments: share the prize pool
• Daily rewards: claim every day for bigger bonuses
• Invite friends: earn 50⭐ per referral

🎁 *Daily Rewards*
Open the app daily to claim free Stars. Keep your streak alive for bigger rewards!`, { parse_mode: 'Markdown' });
        }
    });

    // Admin Command: Set Menu Button
    bot.onText(/\/setmenu/, async (msg) => {
        const chatId = msg.chat.id;
        try {
            await (bot as any).setChatMenuButton({
                chat_id: chatId,
                menu_button: {
                    type: 'web_app',
                    text: '🎮 Play',
                    web_app: { url: webAppUrl }
                }
            });
            bot.sendMessage(chatId, `✅ **Menu Button Updated!**\n\nYour menu button now points to: ${webAppUrl}`);
        } catch (error: any) {
            console.error('Failed to set menu button:', error.message);
            bot.sendMessage(chatId, `⚠️ Failed to update menu button: ${error.message}`);
        }
    });

    // Admin Command: Direct access to dashboard
    bot.onText(/\/admin/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from?.id.toString() || '';
        const allowedAdmins = (process.env.ADMIN_IDS || '').split(',').map(id => id.trim());

        console.log(`[BOT] Admin command received from ${userId}. Allowed: ${allowedAdmins.join(', ')}`);

        if (!allowedAdmins.includes(userId)) {
            console.warn(`[BOT-AUTH] Unauthorized admin command attempt from: ${userId}`);
            bot.sendMessage(chatId, `⚠️ **Access Denied**\n\nYour Telegram ID (\`${userId}\`) is not whitelisted for admin access. Please add it to your backend \`.env\` file.`);
            return;
        }

        const adminUrl = `${webAppUrl}/admin`;

        bot.sendMessage(chatId, `📊 **Admin Dashboard Access**\n\nTap the button below to view real-time statistics and user metrics.`, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { text: '📊 Open Dashboard', web_app: { url: adminUrl } }
                ]]
            }
        });
    });
}
