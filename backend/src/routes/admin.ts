import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET /api/admin/stats
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const adminIdHeader = req.headers['x-admin-id'];
        const allowedAdmins = (process.env.ADMIN_IDS || '').split(',').map(id => id.trim());

        if (!adminIdHeader || !allowedAdmins.includes(adminIdHeader as string)) {
            console.warn(`[AUTH] Unauthorized admin stats access attempt from ID: ${adminIdHeader}`);
            return res.status(403).json({ success: false, error: 'Unauthorized Access' });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { count: totalUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        const { count: monthlyUsers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thirtyDaysAgo.toISOString());

        const { count: activePlayers } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gt('stats_total_games', 0);

        const { data: tourStats } = await supabase
            .from('tournaments')
            .select('prize_pool');

        const totalPrizePool = (tourStats || []).reduce((sum, t) => sum + (t.prize_pool || 0), 0);

        const { data: transactingUsers } = await supabase
            .from('transactions')
            .select('user_id');

        const economicallyActiveCount = new Set((transactingUsers || []).map(tx => tx.user_id)).size;

        // Daily signups for last 7 days
        const dailySignups: Record<string, number> = {};
        for (let i = 0; i < 7; i++) {
            const dayStart = new Date();
            dayStart.setDate(dayStart.getDate() - i);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayEnd.getDate() + 1);

            const { count: dayCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', dayStart.toISOString())
                .lt('created_at', dayEnd.toISOString());

            dailySignups[dayStart.toISOString().split('T')[0]] = dayCount || 0;
        }

        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers || 0,
                monthlySignups: monthlyUsers || 0,
                activePlayers: activePlayers || 0,
                economicallyActiveUsers: economicallyActiveCount,
                totalTournaments: tourStats?.length || 0,
                totalPrizePool: totalPrizePool.toFixed(2),
                dailySignups
            }
        });
    } catch (error: any) {
        console.error('Admin Stats Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

export default router;
