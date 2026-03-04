import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { telegramAuthMiddleware } from '../middleware/auth';

const router = Router();

// Streak Rewards Map
const STREAK_REWARDS = [0, 50, 75, 100, 150, 200, 300, 500]; // index 0 unused, day 1-7

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getYesterdayDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
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
                streakDay = Math.min((streakDay || 0) + 1, 7);
            } else if (!lastClaim) {
                streakDay = 1;
            } else {
                streakDay = 1;
            }
        }

        const reward = STREAK_REWARDS[streakDay] || 50;

        res.json({
            streakDay,
            reward,
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
            newStreak = Math.min((user.streak_current || 0) + 1, 7);
        } else {
            newStreak = 1;
        }

        const reward = STREAK_REWARDS[newStreak] || 50;
        const newBalance = (user.balance_stars || 0) + reward;

        const { error: updateError } = await supabase
            .from('users')
            .update({
                streak_current: newStreak,
                streak_last_claim: today,
                balance_stars: newBalance
            })
            .eq('telegram_id', userId);

        if (updateError) throw updateError;

        await supabase.from('transactions').insert({
            user_id: userId,
            type: 'DAILY_REWARD',
            amount: reward,
            currency: 'STARS',
            metadata: { streakDay: newStreak },
            status: 'COMPLETED'
        });

        console.log(`[DAILY] User ${userId} claimed Day ${newStreak} reward: ${reward} Stars`);

        res.json({
            success: true,
            streakDay: newStreak,
            reward,
            newBalance
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
                id: '1', title: 'Play 3 Quizzes Today',
                progress: Math.min(dailyGames, 3), total: 3,
                reward: '20 Stars', type: 'stars',
                status: claimedIdsToday.includes('1') ? 'completed' : (dailyGames >= 3 ? 'claimable' : 'in-progress')
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
            '1': dailyGames >= 3,
            '2': dailyWins >= 1,
            '3': (referralCount || 0) >= 1,
            '4': true, // Social follow (click-to-verify)
            '5': true  // Social follow (click-to-verify)
        };

        if (!questVerification[questId]) {
            return res.status(400).json({ error: 'Quest not completed' });
        }

        const questRewards: Record<string, { type: 'stars' | 'xp'; amount: number }> = {
            '1': { type: 'stars', amount: 20 },
            '2': { type: 'xp', amount: 100 },
            '3': { type: 'stars', amount: 50 },
            '4': { type: 'stars', amount: 100 },
            '5': { type: 'stars', amount: 100 }
        };

        const reward = questRewards[questId];
        if (!reward) return res.status(400).json({ error: 'Invalid questId' });

        await supabase.from('transactions').insert({
            user_id: userId, type: 'PRIZE',
            amount: reward.amount,
            currency: reward.type === 'stars' ? 'STARS' : 'XP',
            metadata: { questId, type: 'QUEST_REWARD' },
            status: 'COMPLETED'
        });

        if (reward.type === 'stars') {
            await supabase.from('users')
                .update({ balance_stars: (user.balance_stars || 0) + reward.amount })
                .eq('telegram_id', userId);
        } else {
            await supabase.from('users')
                .update({ stats_xp: (user.stats_xp || 0) + reward.amount })
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

export default router;
