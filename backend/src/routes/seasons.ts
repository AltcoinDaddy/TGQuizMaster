import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET /api/tournament-season/active
router.get('/active', async (req: Request, res: Response) => {
    try {
        const { data: season, error } = await supabase
            .from('tournament_seasons')
            .select('*')
            .eq('status', 'active')
            .order('end_time', { ascending: true })
            .limit(1)
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.json({ success: true, season: season || null });
    } catch (error: any) {
        console.error('Fetch Active Season Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch active season' });
    }
});

// GET /api/tournament-season/:id/leaderboard
router.get('/:id/leaderboard', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data: performers, error } = await supabase
            .from('users')
            .select('telegram_id, username, season_xp')
            .eq('last_season_id', id)
            .order('season_xp', { ascending: false })
            .limit(100);

        if (error) throw error;

        res.json({ success: true, leaderboard: performers || [] });
    } catch (error: any) {
        console.error('Fetch Season Leaderboard Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

export default router;
