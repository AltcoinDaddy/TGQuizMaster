import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { StarsService } from './utils/StarsService';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is missing! Bot will not start.');
} else {
    const bot = new TelegramBot(token, { polling: true });
    const starsService = new StarsService(bot);

    // WebApp URL for the Menu Button (optional fallback)
    const webAppUrl = process.env.VITE_API_URL || 'https://your-mini-app-url.com';

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

    // /start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from?.first_name || 'Champion';

        bot.sendMessage(chatId, `Welcome to TGQuizMaster, ${firstName}! 🏆\n\nBattle other players in real-time, master trivia, and win real TON rewards.\n\nReady to play?`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🎮 Play Now', web_app: { url: webAppUrl } }
                    ],
                    [
                        { text: '📣 Join Community', url: 'https://t.me/tgquizmaster_community' },
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
}
