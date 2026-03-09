import { supabase } from '../config/supabase';

export interface RewardResult {
    success: boolean;
    error?: string;
    data?: any;
}

export type ChestType = 'COMMON' | 'RARE' | 'LEGENDARY' | 'MEGA';

export class RewardService {
    /**
     * Awards a specific amount of Stars to a user.
     */
    static async awardStars(userId: number, amount: number, metadata: any = {}): Promise<RewardResult> {
        try {
            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('balance_stars')
                .eq('telegram_id', userId)
                .single();

            if (fetchError || !user) throw new Error('User not found');

            const { error: updateError } = await supabase
                .from('users')
                .update({ balance_stars: (user.balance_stars || 0) + amount })
                .eq('telegram_id', userId);

            if (updateError) throw updateError;

            await supabase.from('transactions').insert({
                user_id: userId,
                type: 'PRIZE',
                amount: amount,
                currency: 'STARS',
                metadata: { ...metadata, service: 'RewardService' },
                status: 'COMPLETED'
            });

            return { success: true };
        } catch (error: any) {
            console.error(`[RewardService] Failed to award stars to ${userId}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Awards a shard to a user.
     */
    static async awardShard(userId: number, amount: number = 1): Promise<RewardResult> {
        try {
            const { data: user } = await supabase.from('users').select('inventory_shards').eq('telegram_id', userId).single();
            if (!user) throw new Error('User not found');

            await supabase.from('users').update({
                inventory_shards: (user.inventory_shards || 0) + amount
            }).eq('telegram_id', userId);

            return { success: true };
        } catch (error: any) {
            console.error(`[RewardService] Shard award failed for ${userId}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Awards a random chest reward to a user.
     */
    static async awardChest(userId: number, type: ChestType): Promise<RewardResult> {
        const reward = this.generateChestReward(type);
        console.log(`[RewardService] Awarding ${type} Chest to ${userId}:`, reward);

        if (reward.stars > 0) await this.awardStars(userId, reward.stars, { type: 'CHEST_STARS', chest: type });
        if (reward.shards > 0) await this.awardShard(userId, reward.shards);

        // Power-ups
        if (reward.powerup) {
            const { data: user } = await supabase.from('users').select('inventory_powerups').eq('telegram_id', userId).single();
            if (user) {
                const current = user.inventory_powerups || {};
                current[reward.powerup] = (current[reward.powerup] || 0) + 1;
                await supabase.from('users').update({ inventory_powerups: current }).eq('telegram_id', userId);
            }
        }

        return { success: true, data: reward };
    }

    private static generateChestReward(type: ChestType) {
        const random = Math.random();
        let stars = 0;
        let shards = 0;
        let powerup: string | null = null;

        switch (type) {
            case 'COMMON':
                stars = Math.floor(Math.random() * 51) + 50;
                if (random < 0.1) shards = 1;
                break;
            case 'RARE':
                stars = Math.floor(Math.random() * 101) + 100;
                shards = 1;
                powerup = Math.random() > 0.5 ? 'pu_5050' : 'pu_time';
                break;
            case 'LEGENDARY':
                stars = Math.floor(Math.random() * 301) + 200;
                shards = Math.floor(Math.random() * 2) + 2;
                powerup = Math.random() > 0.5 ? 'pu_5050' : 'pu_time';
                break;
            case 'MEGA':
                stars = Math.floor(Math.random() * 1001) + 1000;
                shards = Math.floor(Math.random() * 5) + 5;
                powerup = Math.random() > 0.5 ? 'pu_double' : 'pu_time';
                break;
        }

        return { stars, shards, powerup };
    }

    /**
     * Awards Tournament Season prizes to the top winners.
     */
    static async distributeSeasonPrizes(seasonId: string): Promise<RewardResult> {
        try {
            const { data: season, error: seasonError } = await supabase
                .from('tournament_seasons')
                .select('*')
                .eq('id', seasonId)
                .single();

            if (seasonError || !season) throw new Error('Season not found');
            if (season.status === 'finished') throw new Error('Season already finished');

            // 1. Get Top 30 Players by Season XP
            const { data: winners, error: winnersError } = await supabase
                .from('users')
                .select('telegram_id, username, season_xp')
                .eq('last_season_id', seasonId)
                .order('season_xp', { ascending: false })
                .limit(30);

            if (winnersError || !winners) throw winnersError;

            console.log(`[RewardService] Distributing prizes for Season: ${season.title} to ${winners.length} winners.`);

            const totalPrizePool = parseInt(season.prize_pool);

            // Prize Tiers (Simplified for now, can be made dynamic)
            // 1st: 25%, 2-10: split 50%, 11-30: split 25%
            for (let i = 0; i < winners.length; i++) {
                const winner = winners[i];
                let prize = 0;

                if (i === 0) {
                    prize = Math.floor(totalPrizePool * 0.25);
                } else if (i < 10) {
                    prize = Math.floor((totalPrizePool * 0.50) / 9);
                } else {
                    prize = Math.floor((totalPrizePool * 0.25) / 20);
                }

                if (prize > 0) {
                    await this.awardStars(winner.telegram_id, prize, { seasonId, rank: i + 1, type: 'SEASON_PRIZE' });
                }

                // Award Chests
                if (i === 0) await this.awardChest(winner.telegram_id, 'MEGA');
                else if (i < 10) await this.awardChest(winner.telegram_id, 'LEGENDARY');
                else if (i < 30) await this.awardChest(winner.telegram_id, 'RARE');
            }

            // 2. Mark Season as finished
            await supabase.from('tournament_seasons')
                .update({ status: 'finished' })
                .eq('id', seasonId);

            return { success: true, data: { winnersCount: winners.length } };
        } catch (error: any) {
            console.error(`[RewardService] Season distribution failed:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Increments Season XP for a user during an active season.
     */
    static async addSeasonXP(userId: number, xpAmount: number): Promise<RewardResult> {
        try {
            // Find active season
            const { data: activeSeason } = await supabase
                .from('tournament_seasons')
                .select('id')
                .eq('status', 'active')
                .single();

            if (!activeSeason) return { success: false, error: 'No active season' };

            const { data: user } = await supabase
                .from('users')
                .select('season_xp, last_season_id')
                .eq('telegram_id', userId)
                .single();

            if (!user) throw new Error('User not found');

            const updates: any = {
                season_xp: (user.last_season_id === activeSeason.id ? (user.season_xp || 0) : 0) + xpAmount,
                last_season_id: activeSeason.id
            };

            await supabase.from('users').update(updates).eq('telegram_id', userId);

            return { success: true };
        } catch (error: any) {
            console.error(`[RewardService] Failed to add Season XP to ${userId}:`, error.message);
            return { success: false, error: error.message };
        }
    }
}
