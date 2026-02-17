import TelegramBot from 'node-telegram-bot-api';

export class NotificationService {
    private bot: TelegramBot;

    constructor(bot: TelegramBot) {
        this.bot = bot;
    }

    // Notify a user about a new room being created
    async notifyRoomOpen(userId: number, roomDetails: { entryFee: number; currency: string; playerCount: number; maxPlayers: number }) {
        try {
            const message = `🎮 *New Room Open!*\n\n` +
                `Entry: ${roomDetails.entryFee} ${roomDetails.currency}\n` +
                `Players: ${roomDetails.playerCount}/${roomDetails.maxPlayers}\n\n` +
                `Jump in before it fills up! ⚡`;

            await this.bot.sendMessage(userId, message, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🎮 Join Now', web_app: { url: process.env.VITE_API_URL || 'https://tg-quiz-master.vercel.app' } }
                    ]]
                }
            });
        } catch (e: any) {
            // User may have blocked the bot — don't crash
            if (!e.message?.includes('bot was blocked')) {
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
                        { text: '🎁 Claim Reward', web_app: { url: process.env.VITE_API_URL || 'https://tg-quiz-master.vercel.app' } }
                    ]]
                }
            });
        } catch (e: any) {
            if (!e.message?.includes('bot was blocked')) {
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
            if (!e.message?.includes('bot was blocked')) {
                console.error(`[NOTIFY] Failed to send referral notification to ${userId}:`, e.message);
            }
        }
    }
}
