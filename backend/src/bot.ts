import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { StarsService } from './utils/StarsService';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
export let starsService: StarsService;

if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is missing! Bot will not start.');
} else {
    const bot = new TelegramBot(token, { polling: true });
    starsService = new StarsService(bot);

    // WebApp URL for the Menu Button (uses env or hardcoded fallback)
    const webAppUrl = process.env.VITE_API_URL || 'https://tg-quiz-master.vercel.app';

    console.log('Telegram Bot initializing...');

    // Polling Error Handling
    bot.on('polling_error', (error) => {
        console.error('Bot Polling Error:', error.message);
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
            bot.sendMessage(chatId, "📖 **How to Play TGQuizMaster**\n\n1. Launch the Mini App\n2. Join a Paid or Free tournament\n3. Answer questions as fast as possible\n4. Top 3 scorers win the prize pool!\n\nUse power-ups like 50/50 and Time Freeze to get an edge! ⚡️");
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
}
