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
     * Awards QP (Quiz Points) to a user.
     */
    static async awardQP(userId: number, amount: number): Promise<RewardResult> {
        try {
            const { data: user } = await supabase.from('users').select('balance_qp').eq('telegram_id', userId).single();
            if (!user) throw new Error('User not found');

            await supabase.from('users').update({
                balance_qp: (user.balance_qp || 0) + amount
            }).eq('telegram_id', userId);

            return { success: true };
        } catch (error: any) {
            console.error(`[RewardService] QP award failed for ${userId}:`, error.message);
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

    /**
     * Performs a Lucky Spin for the user.
     * Enforces a 24-hour cooldown.
     */
    static async performLuckySpin(userId: number): Promise<RewardResult> {
        try {
            const { data: user, error: fetchError } = await supabase
                .from('users')
                .select('last_lucky_spin, balance_stars, balance_qp, balance_chz, inventory_shards')
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
            let rewardType: 'STARS' | 'QP' | 'CHZ' | 'SHARD';
            let amount = 0;
            let label = '';

            if (roll < 0.6) {
                rewardType = 'STARS';
                amount = Math.floor(Math.random() * 451) + 50; // 50-500
                label = `${amount} Stars`;
                await this.awardStars(userId, amount, { type: 'LUCKY_SPIN' });
            } else if (roll < 0.8) {
                rewardType = 'QP';
                amount = Math.floor(Math.random() * 91) + 10; // 10-100
                label = `${amount} QP`;
                await this.awardQP(userId, amount);
            } else if (roll < 0.9) {
                rewardType = 'CHZ';
                amount = Math.floor(Math.random() * 5) + 1; // 1-5
                label = `${amount} $CHZ`;
                const { ChilizService } = await import('./ChilizService');
                await ChilizService.distributeCHZReward(userId, amount, 'Lucky Spin daily reward');
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

    /**
     * Distributes prizes for a SportFi match from the match_stakes pool.
     */
    static async distributeSportFiPrizes(gameId: string, winners: { id: string, score: number }[]): Promise<RewardResult> {
        try {
            console.log(`[SportFi] Distributing prizes for Game ${gameId}...`);

            // 1. Fetch match stake data
            const { data: stake, error: stakeError } = await supabase
                .from('match_stakes')
                .select('*')
                .eq('game_id', gameId)
                .single();

            if (stakeError || !stake) throw new Error('Match stakes not found');
            if (stake.is_distributed) throw new Error('Prizes already distributed');

            const totalPool = parseFloat(stake.total_pool);
            if (totalPool <= 0) return { success: true, data: { message: 'Zero pool, skipping' } };

            // 2. Calculate Platform Fee (e.g., 10%)
            const platformFee = totalPool * stake.commission_rate;
            const netPool = totalPool - platformFee;

            // 3. Prize Split (Top 3)
            // 1st: 60%, 2nd: 30%, 3rd: 10%
            const splits = [0.6, 0.3, 0.1];
            const distributions: any[] = [];

            for (let i = 0; i < Math.min(winners.length, 3); i++) {
                const winner = winners[i];
                const prizeAmount = netPool * splits[i];
                if (prizeAmount <= 0) continue;

                const userId = parseInt(winner.id);
                
                // Tiered Commission Check: Holding Fan Tokens reduces commission
                const { ChilizService } = await import('./ChilizService');
                const isHolder = await ChilizService.verifyFanTokenHold(userId, { tokenSymbol: 'BAR', minAmount: 1 }); // BAR as placeholder
                
                // If holder, give them a 5% bonus (effectively reducing their commission share)
                const holderBonus = isHolder ? 1.10 : 1.0; // 10% bonus on their share
                const adjustedPrize = prizeAmount * holderBonus;

                // Fetch user to update balance (Internal Credit)
                const { data: user } = await supabase.from('users').select('balance_chz').eq('telegram_id', userId).single();
                if (user) {
                    await supabase.from('users').update({
                        balance_chz: (user.balance_chz || 0) + adjustedPrize
                    }).eq('telegram_id', userId);

                    await supabase.from('transactions').insert({
                        user_id: userId,
                        type: 'SPORTFI_REWARD',
                        amount: adjustedPrize,
                        currency: 'CHZ',
                        metadata: { 
                            gameId, 
                            rank: i + 1, 
                            pool: totalPool,
                            isHolder,
                            bonusApplied: isHolder ? '10%' : 'None'
                        },
                        status: 'COMPLETED'
                    });

                    distributions.push({ userId, amount: adjustedPrize, rank: i + 1, isHolder });
                }
            }

            // 4. Update match_stakes as distributed
            await supabase.from('match_stakes').update({
                is_distributed: true,
                platform_fee: platformFee
            }).eq('game_id', gameId);

            // 5. Log Platform Fee as transaction
            if (platformFee > 0) {
                await supabase.from('transactions').insert({
                    user_id: 0, // Platform Account
                    type: 'PLATFORM_RAKE',
                    amount: platformFee,
                    currency: 'CHZ',
                    metadata: { gameId, pool: totalPool },
                    status: 'COMPLETED'
                });
            }

            return { success: true, data: { distributions, platformFee } };
        } catch (error: any) {
            console.error(`[SportFi] Prize distribution failed for ${gameId}:`, error.message);
            return { success: false, error: error.message };
        }
    }
}
