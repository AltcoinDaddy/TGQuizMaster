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
     * Awards CP (Chili Points) to a user.
     */
    static async awardCP(userId: number, amount: number): Promise<RewardResult> {
        try {
            const { data: user } = await supabase.from('users').select('balance_cp').eq('telegram_id', userId).single();
            if (!user) throw new Error('User not found');

            await supabase.from('users').update({
                balance_cp: (BigInt(user.balance_cp || 0) + BigInt(amount)).toString()
            }).eq('telegram_id', userId);

            return { success: true };
        } catch (error: any) {
            console.error(`[RewardService] CP award failed for ${userId}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Awards a shard to a user.
     */
    static async awardShard(userId: number, amount: number = 1): Promise<RewardResult> {
        try {
            const { data: user } = await supabase.from('users').select('balance_shards').eq('telegram_id', userId).single();
            if (!user) throw new Error('User not found');

            await supabase.from('users').update({
                balance_shards: (user.balance_shards || 0) + amount
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
            const cpPrizePool = season.metadata?.cp_prize_pool ? parseInt(season.metadata.cp_prize_pool) : 0;

            // Prize Tiers (Simplified for now, can be made dynamic)
            // 1st: 25%, 2-10: split 50%, 11-30: split 25%
            for (let i = 0; i < winners.length; i++) {
                const winner = winners[i];
                let prize = 0;
                let cpPrize = 0;

                if (i === 0) {
                    prize = Math.floor(totalPrizePool * 0.25);
                    cpPrize = Math.floor(cpPrizePool * 0.25);
                } else if (i < 10) {
                    prize = Math.floor((totalPrizePool * 0.50) / 9);
                    cpPrize = Math.floor((cpPrizePool * 0.50) / 9);
                } else {
                    prize = Math.floor((totalPrizePool * 0.25) / 20);
                    cpPrize = Math.floor((cpPrizePool * 0.25) / 20);
                }

                if (prize > 0) {
                    await this.awardStars(winner.telegram_id, prize, { seasonId, rank: i + 1, type: 'SEASON_PRIZE' });
                }
                
                if (cpPrize > 0) {
                    await this.awardCP(winner.telegram_id, cpPrize);
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

    /**
     * Performs a Lucky Spin for the user.
     * Enforces a 24-hour cooldown.
     */
    static async performLuckySpin(userId: number): Promise<RewardResult> {
        try {
            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('last_lucky_spin, balance_stars, balance_cp, balance_shards')
                .eq('telegram_id', userId)
                .single();

            if (fetchError || !user) throw new Error('User not found');

            // 1. Check Cooldown (24 hours)
            if (user.last_lucky_spin) {
                const lastSpin = new Date(user.last_lucky_spin).getTime();
                const now = Date.now();
                const hoursSince = (now - lastSpin) / (1000 * 60 * 60);
                
                if (hoursSince < 24) {
                    const remaining = 24 - hoursSince;
                    return { success: false, error: `Cooldown active. Wait ${Math.ceil(remaining)}h.` };
                }
            }

            // 2. Roll the Reward
            const roll = Math.random();
            let rewardType: 'STARS' | 'CP' | 'SHARD';
            let amount = 0;
            let label = '';

            if (roll < 0.7) {
                rewardType = 'STARS';
                amount = Math.floor(Math.random() * 451) + 50; // 50-500
                label = `${amount} Stars`;
                await this.awardStars(userId, amount, { type: 'LUCKY_SPIN' });
            } else if (roll < 0.9) {
                rewardType = 'CP';
                amount = Math.floor(Math.random() * 91) + 10; // 10-100
                label = `${amount} CP`;
                await this.awardCP(userId, amount);
            } else {
                rewardType = 'SHARD';
                amount = 1;
                label = `Avatar Shard`;
                await this.awardShard(userId, amount);
            }

            // 3. Update last_lucky_spin
            await supabase
                .from('users')
                .update({ last_lucky_spin: new Date().toISOString() })
                .eq('telegram_id', userId);

            return { 
                success: true, 
                data: { 
                    type: rewardType, 
                    amount, 
                    label,
                    roll 
                } 
            };
        } catch (error: any) {
            console.error(`[RewardService] Lucky Spin failed for ${userId}:`, error.message);
            return { success: false, error: error.message };
        }
    }

}
