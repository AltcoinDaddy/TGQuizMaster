import TelegramBot from 'node-telegram-bot-api';

export class NotificationService {
    private bot: TelegramBot;

    constructor(bot: TelegramBot) {
        this.bot = bot;
    }

    // Helper to check if a Telegram error is ignorable (e.g. user blocked bot or chat not found)
    private isIgnorableError(e: any): boolean {
        const message = e.message || '';
        return (
            message.includes('bot was blocked') ||
            message.includes('chat not found') ||
            message.includes('user is deactivated') ||
            message.includes('forbidden')
        );
    }

    // Notify a user about a new room being created
    async notifyRoomOpen(userId: number, roomDetails: { roomId: string; entryFee: number; currency: string; playerCount: number; maxPlayers: number; category: string }) {
        try {
            // Use the Telegram Direct Link format to ensure the app opens as an overlay
            const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'TGQuizMasters_bot';
            // Slugify category (replace spaces with underscores) to comply with Telegram start_param rules
            const slugCategory = roomDetails.category.replace(/\s+/g, '_');
            const deepLinkUrl = `https://t.me/${botUsername}/tgquizmaster?startapp=room_${roomDetails.roomId}_m${roomDetails.maxPlayers}_c${slugCategory}`;

            const message = `🎮 *New Room Open!*\n\n` +
                `Entry: ${roomDetails.entryFee} ${roomDetails.currency}\n` +
                `Players: ${roomDetails.playerCount}/${roomDetails.maxPlayers}\n\n` +
                `🎁 *New Players*: Get *100 Stars FREE* when you join!\n\n` +
                `Jump in before it fills up! ⚡`;

            await this.bot.sendMessage(userId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🎮 Join Now', url: deepLinkUrl }
                    ]]
                }
            });
        } catch (e: any) {
            if (!this.isIgnorableError(e)) {
                console.error(`[NOTIFY] Failed to send room notification to ${userId}:`, e.message);
            }
        }
    }

    // Notify user about daily reward being ready
    async notifyDailyReward(userId: number, streakDay: number, reward: number) {
        try {
            const message = `🎁 *Daily Reward Ready!*\n\n` +
                `Day ${streakDay} Streak: +${reward} ⭐\n\n` +
                `Don't break your streak! Open the app to claim.`;

            await this.bot.sendMessage(userId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🎁 Claim Reward', web_app: { url: process.env.VITE_APP_URL || 'https://tgquizmaster.online' } }
                    ]]
                }
            });
        } catch (e: any) {
            if (!this.isIgnorableError(e)) {
                console.error(`[NOTIFY] Failed to send daily reward notification to ${userId}:`, e.message);
            }
        }
    }

    // Notify referrer when their friend joins
    async notifyReferralReward(userId: number, reward: number, referredUsername: string) {
        try {
            const message = `🎉 *Referral Reward!*\n\n` +
                `Your friend ${referredUsername} joined!\n` +
                `You earned +${reward} ⭐\n\n` +
                `Keep inviting friends for more rewards!`;

            await this.bot.sendMessage(userId, message, { parse_mode: 'Markdown' });
        } catch (e: any) {
            if (!this.isIgnorableError(e)) {
                console.error(`[NOTIFY] Failed to send referral notification to ${userId}:`, e.message);
            }
        }
    }

    // Re-engagement: bring back dormant users
    async notifyReengagement(userId: number, username: string) {
        try {
            const message =
                `👋 *Hey ${username || 'Quiz Master'}!*\n\n` +
                `We've missed you! 🧠\n\n` +
                `🆕 New quizzes and challenges are waiting\n` +
                `🎁 Come back and claim your *welcome-back bonus*\n` +
                `🏆 Climb the leaderboard — your spot is slipping!\n\n` +
                `Tap below to jump back in ⚡`;

            await this.bot.sendMessage(userId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🎮 Play Now', web_app: { url: process.env.VITE_APP_URL || 'https://tgquizmaster.online' } }
                    ]]
                }
            });
            return { success: true };
        } catch (e: any) {
            const ignored = this.isIgnorableError(e);
            if (!ignored) {
                console.error(`[NOTIFY] Re-engagement failed for ${userId}:`, e.message);
            }
            return { success: false, blocked: ignored };
        }
    }

    // Broadcast a custom message to a list of user IDs
    async broadcastMessage(userIds: number[], message: string, delayMs = 100) {
        let sent = 0;
        let failed = 0;
        let blocked = 0;

        for (const userId of userIds) {
            try {
                await this.bot.sendMessage(userId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [[
                            { text: '🎮 Open App', web_app: { url: process.env.VITE_APP_URL || 'https://tgquizmaster.online' } }
                        ]]
                    }
                });
                sent++;
            } catch (e: any) {
                if (this.isIgnorableError(e)) {
                    blocked++;
                } else {
                    failed++;
                    console.error(`[BROADCAST] Failed for ${userId}:`, e.message);
                }
            }
            // Rate limit: Telegram allows ~30 messages/sec, but be safe
            if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
        }

        return { sent, failed, blocked, total: userIds.length };
    }

    // Post final game results back to a group
    async notifyGroupResults(chatId: number, category: string, results: { username: string; score: number }[]) {
        try {
            if (results.length === 0) return;

            let message = `🏆 **Quiz Battle Finished!** 🏆\n` +
                `🏷 Category: \`${category}\`\n\n` +
                `**LEADERBOARD:**\n`;

            results.slice(0, 5).forEach((res, idx) => {
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '👤';
                message += `${medal} **${res.username}**: ${res.score} pts\n`;
            });

            message += `\nWell played everyone! Tap the menu button to start a new game anytime. ⚡`;

            await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
            console.log(`[NOTIFY-GROUP] Results posted to chat ${chatId}`);
        } catch (e: any) {
            console.error(`[NOTIFY-GROUP] Failed to post results to ${chatId}:`, e.message);
        }
    }
}
