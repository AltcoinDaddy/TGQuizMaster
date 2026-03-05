import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { getTonBalance } from '../utils/tonBalance';
import { telegramAuthMiddleware } from '../middleware/auth';
import { withdrawalRateLimit } from '../middleware/rateLimit';

const router = Router();

// GET /api/leaderboard
router.get('/leaderboard', async (req: Request, res: Response) => {
    const { period } = req.query; // 'daily', 'weekly', 'allTime'

    try {
        // For now we sort by global stats_xp. 
        // In the future, this can be mapped to stats_xp_daily, stats_xp_weekly, etc.
        const { data: topPlayers, error } = await supabase
            .from('users')
            .select('*, squads(name)')
            .order('stats_xp', { ascending: false })
            .limit(50);

        if (error) throw error;

        const leaderboard = topPlayers.map((p, index) => ({
            rank: index + 1,
            name: p.username || `Player ${p.telegram_id}`,
            score: `${p.stats_xp || 0} XP`,
            isTop: index === 0,
            xp: p.stats_xp || 0,
            reward: `${p.stats_xp || 0} XP`,
            telegramId: p.telegram_id.toString(),
            totalWins: p.stats_wins || 0,
            hasGoldName: ['SILVER', 'GOLD'].includes(p.referral_tier || '')
        }));

        res.json({ leaderboard });
    } catch (error: any) {
        console.error('Leaderboard Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// GET /api/history
router.get('/history', async (req: Request, res: Response) => {
    const { telegramId } = req.query;

    if (!telegramId) {
        return res.status(400).json({ error: 'Missing telegramId' });
    }

    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, stats_wins, stats_total_games')
            .eq('telegram_id', telegramId)
            .single();

        if (userError || !user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { data: history, error } = await supabase
            .from('game_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching history:', error);
            return res.status(500).json({ error: 'Failed to fetch history' });
        }

        const { data: transactions } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('type', 'PRIZE');

        const totalEarnings = (transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
        const winRate = user.stats_total_games > 0
            ? Math.round((user.stats_wins / user.stats_total_games) * 100)
            : 0;

        const formattedHistory = history.map((game, index) => ({
            id: game.id,
            title: game.mode === 'tournament' ? 'Tournament Match' : 'Ranked Duel',
            date: new Date(game.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
            rank: game.rank || 0,
            reward: game.reward_amount > 0 ? `+${game.reward_amount} ${game.reward_currency}` : '---',
            accuracy: `${game.accuracy || 0}%`,
            speed: `${game.avg_speed || 0}s`,
            status: game.rank === 1 ? 'WINNER' : 'PARTICIPANT'
        }));

        res.json({
            history: formattedHistory,
            stats: { totalEarnings, winRate }
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/withdraw
router.post('/withdraw', withdrawalRateLimit, telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const userId = req.telegramUser!.id;
        const { amount, address } = req.body;
        const withdrawAmount = parseFloat(amount);

        if (!amount || !address) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Verify wallet ownership
        const { data: user } = await supabase
            .from('users')
            .select('wallet_address')
            .eq('telegram_id', userId)
            .single();

        if (!user || !user.wallet_address) {
            return res.status(400).json({ error: 'No wallet connected to your account' });
        }

        if (user.wallet_address !== address) {
            console.warn(`[SECURITY] Withdrawal wallet mismatch for user ${userId}: stored=${user.wallet_address}, requested=${address}`);
            return res.status(403).json({ error: 'Wallet address does not match your account' });
        }

        // 2. Minimum withdrawal
        if (withdrawAmount < 0.1) {
            return res.status(400).json({ error: 'Minimum withdrawal is 0.1 TON' });
        }

        // 3. Daily limit
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const { count: todayWithdrawals } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'WITHDRAWAL')
            .gte('created_at', todayStart.toISOString());

        if ((todayWithdrawals || 0) >= 1) {
            return res.status(400).json({ error: 'Daily withdrawal limit reached (1 per day)' });
        }

        // 4. Check on-chain balance
        const liveBalance = await getTonBalance(address);
        if (liveBalance < withdrawAmount) {
            return res.status(400).json({ error: 'Insufficient on-chain balance' });
        }

        // 5. Create pending transaction
        const { error: txError } = await supabase
            .from('transactions')
            .insert({
                user_id: userId,
                type: 'WITHDRAWAL',
                amount: -withdrawAmount,
                currency: 'TON',
                metadata: { destination: address },
                status: 'PENDING'
            });

        if (txError) throw txError;

        console.log(`[WITHDRAW] User ${userId} requested ${withdrawAmount} TON to ${address}`);
        res.json({ success: true, message: 'Withdrawal request submitted for processing' });
    } catch (error: any) {
        console.error('Withdrawals API Error:', error.message);
        res.status(500).json({ error: 'Failed to process withdrawal' });
    }
});

// POST /api/settings
router.post('/settings', telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const { telegramId, settings } = req.body;
        if (!telegramId || !settings) return res.status(400).json({ success: false, error: 'Missing fields' });

        const userId = parseInt(telegramId);

        const { error } = await supabase.from('users').update({ settings }).eq('telegram_id', userId);
        if (error) throw error;

        res.json({ success: true });
    } catch (e) {
        console.error('Save settings error:', e);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST /api/bug-report
router.post('/bug-report', telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const { telegramId, type, description } = req.body;
        if (!telegramId || !description) return res.status(400).json({ success: false, error: 'Missing fields' });

        const userId = parseInt(telegramId);

        const { error } = await supabase.from('bug_reports').insert({
            user_id: userId,
            type: type || 'Other',
            description,
            status: 'new'
        });

        if (error) throw error;

        console.log(`[BUG REPORT] User ${telegramId} reported: ${description.substring(0, 50)}...`);
        res.json({ success: true, message: 'Report submitted successfully' });
    } catch (e) {
        console.error('Bug report error:', e);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

export default router;
