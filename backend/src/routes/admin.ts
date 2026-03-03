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

// POST /api/admin/reengage — Send re-engagement messages to dormant users
router.post('/reengage', async (req: Request, res: Response) => {
    try {
        const adminIdHeader = req.headers['x-admin-id'];
        const allowedAdmins = (process.env.ADMIN_IDS || '').split(',').map(id => id.trim());

        if (!adminIdHeader || !allowedAdmins.includes(adminIdHeader as string)) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const daysInactive = parseInt(req.body.daysInactive as string) || 14;

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysInactive);
        const cutoffStr = cutoff.toISOString().split('T')[0]; // YYYY-MM-DD for streak_last_claim

        // Find users inactive for N+ days:
        // - streak_last_claim is null (never claimed) OR before cutoff
        // - AND created_at is before cutoff (exclude brand new users)
        const { data: dormantUsers, error } = await supabase
            .from('users')
            .select('telegram_id, username')
            .lt('created_at', cutoff.toISOString())
            .or(`streak_last_claim.is.null,streak_last_claim.lt.${cutoffStr}`);

        if (error) throw error;

        if (!dormantUsers || dormantUsers.length === 0) {
            return res.json({ success: true, message: 'No dormant users found', sent: 0 });
        }

        // Import notificationService from bot
        const { notificationService } = await import('../bot');
        if (!notificationService) {
            return res.status(503).json({ error: 'Notification service not initialized' });
        }

        let sent = 0, blocked = 0, failed = 0;

        for (const user of dormantUsers) {
            const result = await notificationService.notifyReengagement(
                user.telegram_id,
                user.username || ''
            );
            if (result.success) sent++;
            else if (result.blocked) blocked++;
            else failed++;

            // Rate limit: ~10/sec to be safe with Telegram
            await new Promise(r => setTimeout(r, 100));
        }

        console.log(`[REENGAGE] Sent: ${sent}, Blocked: ${blocked}, Failed: ${failed} (inactive >${daysInactive}d)`);

        res.json({
            success: true,
            stats: {
                totalDormant: dormantUsers.length,
                sent,
                blocked,
                failed
            }
        });
    } catch (error: any) {
        console.error('Re-engagement Error:', error.message);
        res.status(500).json({ error: 'Failed to send re-engagement messages' });
    }
});

// POST /api/admin/broadcast — Send a custom message to ALL users
router.post('/broadcast', async (req: Request, res: Response) => {
    try {
        const adminIdHeader = req.headers['x-admin-id'];
        const allowedAdmins = (process.env.ADMIN_IDS || '').split(',').map(id => id.trim());

        if (!adminIdHeader || !allowedAdmins.includes(adminIdHeader as string)) {
            return res.status(403).json({ success: false, error: 'Unauthorized' });
        }

        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Missing message' });

        const { data: allUsers, error } = await supabase
            .from('users')
            .select('telegram_id');

        if (error) throw error;

        const { notificationService } = await import('../bot');
        if (!notificationService) {
            return res.status(503).json({ error: 'Notification service not initialized' });
        }

        const userIds = (allUsers || []).map(u => u.telegram_id);
        const result = await notificationService.broadcastMessage(userIds, message);

        console.log(`[BROADCAST] Results:`, result);
        res.json({ success: true, stats: result });
    } catch (error: any) {
        console.error('Broadcast Error:', error.message);
        res.status(500).json({ error: 'Failed to broadcast' });
    }
});

export default router;
