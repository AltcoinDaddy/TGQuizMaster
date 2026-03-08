import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { supabase } from './config/supabase';
import { StarsService } from './utils/StarsService';
import { NotificationService } from './utils/NotificationService';
import { roomRegistry } from './utils/RoomRegistry';
import crypto from 'crypto';

dotenv.config();

console.log(`[BOT-ENV] Loaded keys: ${Object.keys(process.env).filter(k => !k.startsWith('npm_')).join(', ')}`);

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
    const adminIds = process.env.ADMIN_IDS || '';

    console.log(`Telegram Bot initializing...`);
    console.log(`[BOT] Admin IDs configured: ${adminIds}`);

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

    // Handle being added to a group (Onboarding)
    bot.on('new_chat_members', async (msg) => {
        const chatId = msg.chat.id;
        const newMembers = msg.new_chat_members || [];
        const botId = (await bot.getMe()).id;

        const isMe = newMembers.some(member => member.id === botId);

        if (isMe) {
            console.log(`[BOT] Added to group: ${msg.chat.title} (${chatId})`);
            const welcomeMsg =
                `👋 **Hello ${msg.chat.title}!** 🏆\n\n` +
                `I'm **TGQuizMaster**, your real-time trivia host! Battle your friends and community members right here in this chat.\n\n` +
                `🚀 **How to Start?**\n` +
                `Type \`/play\` followed by a category (optional) to initiate a battle!\n\n` +
                `*Examples:*\n` +
                `• \`/play\` (General knowledge)\n` +
                `• \`/play Crypto\`\n` +
                `• \`/play Sports\`\n\n` +
                `Ready to test your knowledge? Let's go! ⚡`;

            bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown' });
        }
    });

    // /start command with support for deep links (referrals)
    bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const firstName = msg.from?.first_name || 'Champion';
        const startParam = match ? match[1] : null;
        const telegramUserId = msg.from?.id;
        const telegramUsername = msg.from?.username || msg.from?.first_name || 'Anon_Player';

        // Always register user in the database on /start
        try {

            // Check if user already exists
            const { data: existingUser, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramUserId)
                .single();

            const isNewUser = fetchError && fetchError.code === 'PGRST116';
            const isReferral = startParam && startParam.startsWith('ref_');

            if (isNewUser) {
                if (isReferral) {
                    // New user via referral — gets 200 Stars welcome bonus
                    const referrerId = startParam!.replace('ref_', '');
                    console.log(`[BOT] New user ${telegramUserId} joined via referral from ${referrerId}`);

                    await supabase.from('users').insert({
                        telegram_id: telegramUserId,
                        username: telegramUsername,
                        referred_by: parseInt(referrerId),
                        balance_stars: 200
                    });

                    // Log welcome bonus transaction
                    await supabase.from('transactions').insert({
                        user_id: telegramUserId,
                        type: 'PRIZE',
                        amount: 200,
                        currency: 'STARS',
                        metadata: { type: 'WELCOME_BONUS_REFERRAL' },
                        status: 'COMPLETED'
                    });

                    // Reward the referrer with 50 Stars and increment referral count
                    const { data: referrer } = await supabase
                        .from('users')
                        .select('balance_stars, stats_referrals')
                        .eq('telegram_id', parseInt(referrerId))
                        .single();

                    if (referrer) {
                        await supabase.from('users').update({
                            balance_stars: (referrer.balance_stars || 0) + 50,
                            stats_referrals: (referrer.stats_referrals || 0) + 1
                        }).eq('telegram_id', parseInt(referrerId));

                        await supabase.from('transactions').insert({
                            user_id: parseInt(referrerId),
                            type: 'PRIZE',
                            amount: 50,
                            currency: 'STARS',
                            metadata: { type: 'REFERRAL_REWARD', referredUser: telegramUserId },
                            status: 'COMPLETED'
                        });

                        console.log(`[REFERRAL] Referrer ${referrerId} earned 50 Stars`);

                        notificationService.notifyReferralReward(
                            parseInt(referrerId),
                            50,
                            telegramUsername
                        );

                        // Check for referral tier milestone
                        try {
                            const { count: refCount } = await supabase
                                .from('users')
                                .select('*', { count: 'exact', head: true })
                                .eq('referred_by', parseInt(referrerId));

                            const totalRefs = (refCount || 0);
                            let newTier: string = 'NONE';
                            if (totalRefs >= 20) newTier = 'GOLD';
                            else if (totalRefs >= 5) newTier = 'SILVER';
                            else if (totalRefs >= 1) newTier = 'BRONZE';

                            const oldTier = (referrer as any).referral_tier || 'NONE';
                            if (newTier !== oldTier) {
                                await supabase.from('users')
                                    .update({ referral_tier: newTier })
                                    .eq('telegram_id', parseInt(referrerId));
                                console.log(`[REFERRAL] Referrer ${referrerId} unlocked ${newTier} tier!`);

                                const tierMessages: Record<string, string> = {
                                    'BRONZE': '🥉 You unlocked Bronze Referrer! You earned 50 Stars as a milestone bonus.',
                                    'SILVER': '🥈 You unlocked Silver Referrer! Your name now glows GOLD on the leaderboard! ✨',
                                    'GOLD': '🥇 You unlocked Gold Referrer! You now earn 5% lifetime commission on your referrals\' Star purchases! 💰'
                                };

                                if (tierMessages[newTier]) {
                                    try {
                                        const bot = (notificationService as any).bot;
                                        if (bot) {
                                            bot.sendMessage(parseInt(referrerId), `🏆 **Referral Milestone Unlocked!**\n\n${tierMessages[newTier]}\n\nTotal Referrals: ${totalRefs}`, { parse_mode: 'Markdown' });
                                        }
                                    } catch (e) {
                                        console.error('[REFERRAL] Tier notification failed:', e);
                                    }
                                }
                            }
                        } catch (e) {
                            console.error('[REFERRAL] Tier check failed:', e);
                        }
                    }

                    console.log(`[BOT] New referral user ${telegramUserId} registered with 200 Stars bonus`);
                } else {
                    // New user WITHOUT referral — gets 100 Stars welcome bonus
                    await supabase.from('users').insert({
                        telegram_id: telegramUserId,
                        username: telegramUsername,
                        balance_stars: 100
                    });

                    await supabase.from('transactions').insert({
                        user_id: telegramUserId,
                        type: 'PRIZE',
                        amount: 100,
                        currency: 'STARS',
                        metadata: { type: 'WELCOME_BONUS' },
                        status: 'COMPLETED'
                    });

                    console.log(`[BOT] New user ${telegramUserId} (@${telegramUsername}) registered with 100 Stars bonus`);
                }
            } else if (existingUser) {
                // Existing user — update username if changed, and handle late referral
                if (existingUser.username !== telegramUsername) {
                    await supabase.from('users')
                        .update({ username: telegramUsername })
                        .eq('telegram_id', telegramUserId);
                }

                if (isReferral && !existingUser.referred_by) {
                    const referrerId = startParam!.replace('ref_', '');
                    await supabase.from('users')
                        .update({ referred_by: parseInt(referrerId) })
                        .eq('telegram_id', telegramUserId);
                    console.log(`[REFERRAL] Updated user ${telegramUserId} with referrer ${referrerId}`);
                }

                console.log(`[BOT] Existing user ${telegramUserId} (@${telegramUsername}) pressed /start`);
            }
        } catch (e) {
            console.error('[BOT] User registration failed:', e);
        }

        bot.sendMessage(chatId, `Welcome to TGQuizMaster, ${firstName}! 🏆\n\nBattle other players in real-time, master trivia, and win real TON rewards.\n\nReady to play?`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🎮 Play Now', web_app: { url: webAppUrl } }
                    ],
                    [
                        { text: '📣 Join Telegram', url: 'https://t.me/TGQuizMaster' },
                        { text: '🐦 Follow X (Twitter)', url: 'https://x.com/TGQuizMaster' }
                    ],
                    [
                        { text: '❓ How to Play', callback_data: 'how_to_play' }
                    ]
                ]
            }
        });
    });

    // /play command (Group/Supergroup support)
    bot.onText(/\/(?:play|quiz)(?:\s+(.+))?/, async (msg, match) => {
        const chatId = msg.chat.id;
        const chatType = msg.chat.type;
        const userId = msg.from?.id;
        const firstName = msg.from?.first_name || 'Champion';
        const category = match ? match[1] : 'General';

        if (chatType === 'private') {
            bot.sendMessage(chatId, `Ready for a challenge, ${firstName}? 🏆`, {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🎮 Start Playing', web_app: { url: webAppUrl } }
                    ]]
                }
            });
            return;
        }

        try {
            const roomId = crypto.randomUUID();
            const entryFee = 10;
            const maxPlayers = 2;

            const manager = roomRegistry.createRoom(
                roomId,
                'stars',
                0,
                entryFee,
                maxPlayers,
                category
            );

            (manager as any).groupId = chatId;

            const inviteMessage =
                `🔥 **Quiz Battle Initiated!** 🔥\n\n` +
                `👤 **Host**: ${firstName}\n` +
                `🏷 **Category**: \`${category}\`\n` +
                `💰 **Entry**: ${entryFee} Stars\n` +
                `👥 **Max Players**: ${maxPlayers}\n\n` +
                `Tap below to join the battle! The game starts automatically when enough players join.`;

            const botUsername = (await bot.getMe()).username;
            await bot.sendMessage(chatId, inviteMessage, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🎮 Join & Play', url: `https://t.me/${botUsername}/tgquizmaster?startapp=room_${roomId}_m${maxPlayers}_c${category}_g1` }
                    ]]
                }
            });

        } catch (error: any) {
            console.error('[BOT-GROUP] Failed to start group room:', error.message);
            bot.sendMessage(chatId, `⚠️ Failed to start quiz: ${error.message}`);
        }
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
Open the app daily to claim free Stars. Keep your streak alive for bigger rewards!

🧠 *Knowledge Yield*
Earn $QUIZ Airdrop Points passively! Open the 'Yield' tab in the app to start harvesting. Higher total QP = bigger potential airdrop.`, { parse_mode: 'Markdown' });
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
