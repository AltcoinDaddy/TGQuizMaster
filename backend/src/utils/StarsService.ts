import TelegramBot from 'node-telegram-bot-api';

export class StarsService {
    private bot: TelegramBot;

    constructor(bot: TelegramBot) {
        this.bot = bot;
    }

    async createInvoice(chatId: number, title: string, description: string, payload: string, amount: number) {
        const prices = [{ label: 'Stars', amount }];

        console.log(`Creating Stars Invoice for ${chatId}: ${title} (${amount} Stars)`);

        return await this.bot.sendInvoice(
            chatId,
            title,
            description,
            payload,
            '', // Provider token (empty for Stars)
            'XTR', // Currency for Telegram Stars
            prices
        );
    }

    // New method for Mini Apps
    async getInvoiceLink(title: string, description: string, payload: string, amount: number) {
        const prices = [{ label: 'Stars', amount: Math.floor(amount) }]; // Amount must be integer

        // Use raw API call if method not available in type definition, or rely on bot instance
        console.log(`Generating Invoice Link: ${title} (${amount} XTR)`);

        try {
            // node-telegram-bot-api might not have createInvoiceLink typed yet, casting to any
            const link = await (this.bot as any).createInvoiceLink(
                title,
                description,
                payload,
                "", // provider_token is empty for Stars
                "XTR",
                prices
            );
            return link;
        } catch (error: any) {
            console.error('Failed to create invoice link:', error.message);
            throw error;
        }
    }

    // Shop item payload → in-game Stars reward mapping
    private static SHOP_REWARDS: Record<string, number> = {
        's1': 1000,     // Star Bundle: 50 Telegram Stars → 1,000 in-game Stars
        's2': 5000,     // Star Mega: 200 Telegram Stars → 5,000 in-game Stars
        's3': 20000,    // Star Ultra: 500 Telegram Stars → 20,000 in-game Stars
    };

    // Verification logic for successful payments
    async verifyPayment(userId: string, payload: string, telegramStarsAmount: number) {
        // Map payload to actual in-game Stars reward (or use Telegram Stars amount as fallback)
        const rewardAmount = StarsService.SHOP_REWARDS[payload] || telegramStarsAmount;
        console.log(`[PAYMENT] Verifying: User=${userId} | Paid=${telegramStarsAmount} TG Stars | Reward=${rewardAmount} Stars | Item=${payload}`);

        try {
            const { supabase } = await import('../config/supabase');
            const upsertId = parseInt(userId);

            // 1. Check User Existence (or create)
            let { data: user, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', upsertId)
                .single();

            if (fetchError || !user) {
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        telegram_id: upsertId,
                        username: 'Unknown',
                        balance_stars: 0
                    })
                    .select()
                    .single();
                if (!createError) user = newUser;
            }

            if (user) {
                const updates: any = {
                    balance_stars: (user.balance_stars || 0) + rewardAmount
                };

                // Add to inventory
                if (payload.startsWith('a')) {
                    const currentInv = user.inventory || [];
                    if (!currentInv.includes(payload)) {
                        updates.inventory = [...currentInv, payload];
                    }
                }

                await supabase.from('users').update(updates).eq('telegram_id', upsertId);
                console.log(`[DB] User ${userId} balance updated.`);
            }

            // 2. Log Transaction
            await supabase.from('transactions').insert({
                user_id: upsertId,
                type: 'DEPOSIT',
                amount: rewardAmount,
                currency: 'STARS',
                metadata: { item: payload },
                status: 'COMPLETED'
            });

            return {
                success: true,
                unlockedItem: payload,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Payment verification failed:', error);
            return { success: false };
        }
    }
}
