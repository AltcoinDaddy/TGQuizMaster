import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { telegramAuthMiddleware } from '../middleware/auth';

const router = Router();

// Streak Rewards Map
// Streak Rewards Map
// Type can be 'STARS' or 'CHEST'
const STREAK_REWARDS = [
    { day: 0, reward: 0, type: 'STARS' },
    { day: 1, reward: 50, type: 'STARS' },
    { day: 2, reward: 75, type: 'STARS' },
    { day: 3, reward: 0, type: 'CHEST' }, // Mystery Chest
    { day: 4, reward: 125, type: 'STARS' },
    { day: 5, reward: 150, type: 'STARS' },
    { day: 6, reward: 200, type: 'STARS' },
    { day: 7, reward: 0, type: 'CHEST' }, // Rare Chest
    { day: 8, reward: 300, type: 'STARS' },
    { day: 9, reward: 350, type: 'STARS' },
    { day: 10, reward: 400, type: 'STARS' },
    { day: 11, reward: 450, type: 'STARS' },
    { day: 12, reward: 500, type: 'STARS' },
    { day: 13, reward: 600, type: 'STARS' },
    { day: 14, reward: 0, type: 'CHEST' }, // Legendary Chest
];

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getYesterdayDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

function generateChestReward(day: number) {
    const random = Math.random();
    let stars = 0;
    let shards = 0;
    let powerup: string | null = null;

    if (day === 3) {
        // Common Chest: 50-100 Stars, 10% Shard
        stars = Math.floor(Math.random() * 51) + 50;
        if (random < 0.1) shards = 1;
    } else if (day === 7) {
        // Rare Chest: 100-200 Stars, 1 Shard guaranteed, 20% Power-Up
        stars = Math.floor(Math.random() * 101) + 100;
        shards = 1;
        powerup = Math.random() > 0.5 ? 'pu_5050' : 'pu_time';
    } else if (day === 14) {
        // Legendary Chest: 200-500 Stars, 2-3 Shards guaranteed, 1 Power-Up guaranteed
        stars = Math.floor(Math.random() * 301) + 200;
        shards = Math.floor(Math.random() * 2) + 2;
        powerup = Math.random() > 0.5 ? 'pu_5050' : 'pu_time';
    }

    return { stars, shards, powerup };
}

// GET /api/daily-reward — Check streak status
router.get('/daily-reward', async (req: Request, res: Response) => {
    try {
        const { telegramId } = req.query;
        if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });

        const userId = parseInt(telegramId as string);
        const today = getTodayDate();

        const { data: user, error } = await supabase
            .from('users')
            .select('streak_current, streak_last_claim, balance_stars')
            .eq('telegram_id', userId)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        let streakDay = user.streak_current || 0;
        const lastClaim = user.streak_last_claim;
        const alreadyClaimed = lastClaim === today;

        if (!alreadyClaimed) {
            if (lastClaim === getYesterdayDate()) {
                streakDay = Math.min((streakDay || 0) + 1, 14); // Extended to 14
            } else if (!lastClaim) {
                streakDay = 1;
            } else {
                streakDay = 1;
            }
        }

        const streakConfig = STREAK_REWARDS[streakDay] || STREAK_REWARDS[1];
        const { reward, type } = streakConfig;

        res.json({
            streakDay,
            reward,
            rewardType: type,
            claimable: !alreadyClaimed,
            alreadyClaimed,
            nextResetHours: alreadyClaimed ? Math.max(0, 24 - new Date().getUTCHours()) : 0
        });
    } catch (error: any) {
        console.error('Daily Reward API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch daily reward' });
    }
});

// POST /api/claim-daily — Claim today's streak reward
router.post('/claim-daily', telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const telegramId = req.telegramUser!.id.toString();
        if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });

        const userId = parseInt(telegramId);
        const today = getTodayDate();

        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('streak_current, streak_last_claim, balance_stars')
            .eq('telegram_id', userId)
            .single();

        if (fetchError || !user) return res.status(404).json({ error: 'User not found' });

        if (user.streak_last_claim === today) {
            return res.status(400).json({ error: 'Already claimed today' });
        }

        let newStreak = 1;
        if (user.streak_last_claim === getYesterdayDate()) {
            newStreak = Math.min((user.streak_current || 0) + 1, 14);
        } else {
            newStreak = 1;
        }

        const streakConfig = STREAK_REWARDS[newStreak] || STREAK_REWARDS[1];
        let rewardAmount = streakConfig.reward;
        let chestItems: any = null;

        if (streakConfig.type === 'CHEST') {
            chestItems = generateChestReward(newStreak);
            rewardAmount = chestItems.stars;
        }

        // Fetch current values to update them correctly
        const { data: userData } = await supabase
            .from('users')
            .select('balance_stars, balance_shards, inventory_powerups, unlocked_avatars, balance_cp')
            .eq('telegram_id', userId)
            .single();

        if (!userData) throw new Error('User data missing');

        const newStars = (userData.balance_stars || 0) + rewardAmount;
        const newShards = (userData.balance_shards || 0) + (chestItems?.shards || 0);
        const newPowerups = { ...(userData.inventory_powerups || {}) };
        if (chestItems?.powerup) {
            newPowerups[chestItems.powerup] = (newPowerups[chestItems.powerup] || 0) + 1;
        }

        // Shard Logic for Avatar Unlock
        let unlockedAvatars = [...(userData.unlocked_avatars || [])];
        let shardsConsumed = 0;
        if (newShards >= 10 && !unlockedAvatars.includes('PREMIUM_CYBER_AVATAR')) {
            unlockedAvatars.push('PREMIUM_CYBER_AVATAR');
            shardsConsumed = 10;
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({
                streak_current: newStreak,
                streak_last_claim: today,
                balance_stars: newStars,
                balance_shards: newShards - shardsConsumed,
                inventory_powerups: newPowerups,
                unlocked_avatars: unlockedAvatars
            })
            .eq('telegram_id', userId);

        if (updateError) throw updateError;

        await supabase.from('transactions').insert({
            user_id: userId,
            type: 'DAILY_REWARD',
            amount: rewardAmount,
            currency: 'STARS',
            metadata: {
                streakDay: newStreak,
                rewardType: streakConfig.type,
                chestItems,
                avatarUnlocked: shardsConsumed > 0
            },
            status: 'COMPLETED'
        });

        console.log(`[DAILY] User ${userId} claimed Day ${newStreak} reward. Type: ${streakConfig.type}`);

        res.json({
            success: true,
            streakDay: newStreak,
            rewardType: streakConfig.type,
            reward: rewardAmount,
            chestItems,
            newBalance: newStars,
            newShards: newShards - shardsConsumed,
            avatarUnlocked: shardsConsumed > 0
        });
    } catch (error: any) {
        console.error('Claim Daily Error:', error.message);
        res.status(500).json({ error: 'Failed to claim daily reward' });
    }
});

// GET /api/quests — Fetch quest status
router.get('/quests', async (req: Request, res: Response) => {
    try {
        const { telegramId } = req.query;
        if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });

        const userId = parseInt(telegramId as string);
        const today = getTodayDate();

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();

        if (userError) throw userError;

        // Daily reset check
        if (user.daily_reset_date !== today) {
            await supabase.from('users').update({
                daily_games_today: 0,
                daily_wins_today: 0,
                daily_reset_date: today
            }).eq('telegram_id', userId);
            user.daily_games_today = 0;
            user.daily_wins_today = 0;
            user.daily_reset_date = today;
        }

        const { count: referralCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', userId);

        // Fetch all quest claims to distinguish between daily and one-time
        const { data: allClaims } = await supabase
            .from('transactions')
            .select('metadata, created_at')
            .eq('user_id', userId)
            .eq('type', 'PRIZE')
            .filter('metadata->>type', 'eq', 'QUEST_REWARD');

        const claimedIdsToday = (allClaims || [])
            .filter(tx => tx.created_at.startsWith(today))
            .map(tx => tx.metadata.questId);

        const claimedIdsEver = (allClaims || [])
            .map(tx => tx.metadata.questId);

        const dailyGames = user.daily_games_today || 0;
        const dailyWins = user.daily_wins_today || 0;

        const quests = [
            {
                id: '1', title: 'Play 2 Quizzes Today',
                progress: Math.min(dailyGames, 2), total: 2,
                reward: '20 Stars', type: 'stars',
                status: claimedIdsToday.includes('1') ? 'completed' : (dailyGames >= 2 ? 'claimable' : 'in-progress')
            },
            {
                id: '2', title: 'Win a Game Today',
                progress: Math.min(dailyWins, 1), total: 1,
                reward: '100 XP', type: 'xp',
                status: claimedIdsToday.includes('2') ? 'completed' : (dailyWins >= 1 ? 'claimable' : 'in-progress')
            },
            {
                id: '3', title: 'Invite 1 Friend',
                progress: Math.min(referralCount || 0, 1), total: 1,
                reward: '50 Stars', type: 'stars',
                status: claimedIdsToday.includes('3') ? 'completed' : ((referralCount || 0) >= 1 ? 'claimable' : 'in-progress')
            },
            {
                id: '4', title: 'Join TG Community',
                progress: 0, total: 1,
                reward: '100 Stars', type: 'stars',
                status: claimedIdsEver.includes('4') ? 'completed' : 'claimable' // Simple click-to-claim
            },
            {
                id: '5', title: 'Follow on X (Twitter)',
                progress: 0, total: 1,
                reward: '100 Stars', type: 'stars',
                status: claimedIdsEver.includes('5') ? 'completed' : 'claimable'
            },
            {
                id: '6', title: 'Claim Chili Yield',
                progress: 0, total: 1,
                reward: '50 CP', type: 'cp' as any,
                status: claimedIdsToday.includes('6') ? 'completed' : 'in-progress'
            }
        ];

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { count: weeklyClaimCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'PRIZE')
            .gte('created_at', oneWeekAgo.toISOString());

        const weeklyMilestone = {
            current: weeklyClaimCount || 0, target: 15, reward: 'Epic Mystery Chest'
        };

        res.json({ quests, weeklyMilestone });
    } catch (error: any) {
        console.error('Quests API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch quests' });
    }
});

// POST /api/claim-quest — Claim a quest reward (with server-side verification)
router.post('/claim-quest', telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.telegramUser!.id;
        const { questId } = req.body;

        if (!questId) return res.status(400).json({ error: 'Missing questId' });

        const { data: user } = await supabase.from('users').select('*').eq('telegram_id', userId).single();
        if (!user) return res.status(404).json({ error: 'User not found' });

        // One-time quest check
        const isOneTime = ['4', '5'].includes(questId);

        // Double-claim prevention
        const query = supabase
            .from('transactions')
            .select('id')
            .eq('user_id', userId)
            .eq('type', 'PRIZE')
            .filter('metadata->>questId', 'eq', questId);

        if (!isOneTime) {
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            query.gte('created_at', todayStart.toISOString());
        }

        const { data: existingClaim } = await query.limit(1);

        if (existingClaim && existingClaim.length > 0) {
            return res.status(400).json({ error: isOneTime ? 'Quest already claimed' : 'Quest already claimed today' });
        }

        // Server-side verification
        const dailyGames = user.daily_games_today || 0;
        const dailyWins = user.daily_wins_today || 0;
        const { count: referralCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', userId);

        const questVerification: Record<string, boolean> = {
            '1': dailyGames >= 2,
            '2': dailyWins >= 1,
            '3': (referralCount || 0) >= 1,
            '4': true, // Social follow (click-to-verify)
            '5': true,  // Social follow (click-to-verify)
            '6': true // Chili yield is claimed by clicking, no server-side verification needed here
        };

        if (!questVerification[questId]) {
            return res.status(400).json({ error: 'Quest not completed' });
        }

        const questRewards: Record<string, { type: 'stars' | 'xp' | 'cp'; amount: number }> = {
            '1': { type: 'stars', amount: 20 },
            '2': { type: 'xp', amount: 100 },
            '3': { type: 'stars', amount: 50 },
            '4': { type: 'stars', amount: 100 },
            '5': { type: 'stars', amount: 100 },
            '6': { type: 'cp', amount: 50 },
        };

        const reward = questRewards[questId];
        if (!reward) return res.status(400).json({ error: 'Invalid questId' });

        await supabase.from('transactions').insert({
            user_id: userId, type: 'PRIZE',
            amount: reward.amount,
            currency: reward.type === 'stars' ? 'STARS' : (reward.type === 'xp' ? 'XP' : 'CP'),
            metadata: { questId, type: 'QUEST_REWARD' },
            status: 'COMPLETED'
        });

        if (reward.type === 'stars') {
            await supabase.from('users')
                .update({ balance_stars: (user.balance_stars || 0) + reward.amount })
                .eq('telegram_id', userId);
        } else if (reward.type === 'xp') {
            await supabase.from('users')
                .update({ stats_xp: (user.stats_xp || 0) + reward.amount })
                .eq('telegram_id', userId);
        } else if (reward.type === 'cp') {
            const newCP = (BigInt(user.balance_cp || 0) + BigInt(reward.amount)).toString();
            await supabase.from('users')
                .update({ balance_cp: newCP })
                .eq('telegram_id', userId);
        }

        console.log(`[QUEST] User ${userId} claimed quest ${questId}: +${reward.amount} ${reward.type}`);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Claim Quest Error:', error.message);
        res.status(500).json({ error: 'Failed to claim quest' });
    }
});

// GET /api/achievements
router.get('/achievements', async (req: Request, res: Response) => {
    try {
        const { telegramId } = req.query;
        if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });

        const userId = parseInt(telegramId as string);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();

        if (error) throw error;

        const definitions = [
            { id: '1', title: '10 Day Streak', description: "You've maintained perfect daily activity for 10 consecutive days.", requirement: (u: any) => false, reward: 'Legendary', color: 'primary', icon: 'Zap' },
            { id: '2', title: 'Crypto King', description: 'Win 5 tournaments.', requirement: (u: any) => (u.stats_wins || 0) >= 5, reward: 'Rare', color: 'yellow-400', icon: 'Star' },
            { id: '3', title: 'Mind Reader', description: 'Answer 10 questions correctly in under 1 second.', requirement: (u: any) => false, reward: 'Legendary', color: 'purple-400', icon: 'Sparkles' },
            { id: '4', title: 'Guardian', description: 'Play 50 games.', requirement: (u: any) => (u.stats_total_games || 0) >= 50, reward: 'Rare', color: 'blue-400', icon: 'Shield' }
        ];

        const achievements = definitions.map(def => ({
            id: def.id, title: def.title, description: def.description,
            status: def.requirement(user) ? 'unlocked' : 'locked',
            date: def.requirement(user) ? 'Unlocked' : undefined,
            rarity: def.reward, color: def.color, icon: def.icon
        }));

        const score = {
            total: user.stats_xp || 0,
            rank: (user.stats_xp || 0) > 1000 ? 'Quiz Master' : 'Quiz Novice',
            nextRank: (user.stats_xp || 0) > 1000 ? 'Quiz God' : 'Quiz Master',
            progress: ((user.stats_xp || 0) % 1000) / 10
        };

        const unlockedCount = achievements.filter(a => a.status === 'unlocked').length;

        res.json({ achievements, score, totalCount: definitions.length, unlockedCount });
    } catch (error: any) {
        console.error('Achievements API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

// POST /api/refill-energy — Refill practice energy via Ad
router.post('/refill-energy', telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.telegramUser!.id;

        // Fetch user to check current energy
        const { data: user, error } = await supabase
            .from('users')
            .select('daily_games_today')
            .eq('telegram_id', userId)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        // Decrease the counter by 1 (refilling 1 game)
        // Ensure it doesn't go below 0
        const currentGames = user.daily_games_today || 0;
        const newCount = Math.max(0, currentGames - 1);

        await supabase.from('users')
            .update({ daily_games_today: newCount })
            .eq('telegram_id', userId);

        console.log(`[ENERGY] User ${userId} refilled energy via ad. New daily_games_today: ${newCount}`);

        res.json({ success: true, dailyGamesToday: newCount });
    } catch (e: any) {
        console.error('Refill energy error:', e.message);
        res.status(500).json({ error: 'Failed to refill energy' });
    }
});

/**
 * GET /api/ads/callback
 * Public endpoint for AdsGram Server-to-Server (S2S) rewards.
 * AdsGram replaces [userId] with the actual Telegram ID.
 */
router.get('/ads/callback', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).send('Missing userId');
        }

        const telegramId = userId.toString();

        // Reward the user (refill energy)
        const { data: user, error } = await supabase
            .from('users')
            .select('daily_games_today')
            .eq('telegram_id', telegramId)
            .single();

        if (error || !user) {
            return res.status(404).send('User not found');
        }

        const currentGames = user.daily_games_today || 0;
        const newCount = Math.max(0, currentGames - 1);

        await supabase.from('users')
            .update({ daily_games_today: newCount })
            .eq('telegram_id', telegramId);

        console.log(`[ADS-CALLBACK] User ${telegramId} rewarded via S2S callback. New count: ${newCount}`);

        // AdsGram expects a simple text response or 200 OK
        res.status(200).send('OK');
    } catch (e) {
        console.error('[ADS-CALLBACK] Error:', e);
        res.status(500).send('Internal Error');
    }
});

export default router;
