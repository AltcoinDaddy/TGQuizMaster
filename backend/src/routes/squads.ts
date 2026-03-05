import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { telegramAuthMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/squads - List top squads
router.get('/squads', async (req: Request, res: Response) => {
    try {
        const { data: squads, error } = await supabase
            .from('squads')
            .select('*')
            .order('weekly_xp', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json({ squads });
    } catch (error: any) {
        console.error('Squads List Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch squads' });
    }
});

// GET /api/squad/:id - Squad details
router.get('/squad/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: squad, error } = await supabase
            .from('squads')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !squad) {
            return res.status(404).json({ error: 'Squad not found' });
        }

        // Fetch top members for this squad
        const { data: members, error: membersError } = await supabase
            .from('users')
            .select('telegram_id, username, stats_xp')
            .eq('squad_id', id)
            .order('stats_xp', { ascending: false })
            .limit(20);

        res.json({ squad, members: members || [] });
    } catch (error: any) {
        console.error('Squad Detail Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch squad details' });
    }
});

// GET /api/squad/my - Current user's squad
router.get('/squad/my', telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const telegramId = req.telegramUser!.id;

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('squad_id')
            .eq('telegram_id', telegramId)
            .single();

        if (userError || !user || !user.squad_id) {
            return res.json({ squad: null });
        }

        const { data: squad, error: squadError } = await supabase
            .from('squads')
            .select('*')
            .eq('id', user.squad_id)
            .single();

        res.json({ squad: squad || null });
    } catch (error: any) {
        console.error('My Squad Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch your squad' });
    }
});

// POST /api/squad/join - Join a squad
router.post('/squad/join', telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const telegramId = req.telegramUser!.id;
        const { squadId } = req.body;

        if (!squadId) {
            return res.status(400).json({ error: 'Missing squadId' });
        }

        // Update user's squad
        const { error: updateError } = await supabase
            .from('users')
            .update({ squad_id: squadId })
            .eq('telegram_id', telegramId);

        if (updateError) throw updateError;

        // Increment squad member count
        const { data: squad } = await supabase.from('squads').select('member_count').eq('id', squadId).single();
        await supabase.from('squads').update({ member_count: (squad?.member_count || 0) + 1 }).eq('id', squadId);

        res.json({ success: true });
    } catch (error: any) {
        console.error('Join Squad Error:', error.message);
        res.status(500).json({ error: 'Failed to join squad' });
    }
});

// POST /api/squad/leave - Leave a squad
router.post('/squad/leave', telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const telegramId = req.telegramUser!.id;

        const { data: user } = await supabase.from('users').select('squad_id').eq('telegram_id', telegramId).single();
        if (!user || !user.squad_id) return res.json({ success: true });

        const oldSquadId = user.squad_id;

        const { error: updateError } = await supabase
            .from('users')
            .update({ squad_id: null })
            .eq('telegram_id', telegramId);

        if (updateError) throw updateError;

        // Decrement squad member count
        const { data: squad } = await supabase.from('squads').select('member_count').eq('id', oldSquadId).single();
        await supabase.from('squads').update({ member_count: Math.max(0, (squad?.member_count || 0) - 1) }).eq('id', oldSquadId);

        res.json({ success: true });
    } catch (error: any) {
        console.error('Leave Squad Error:', error.message);
        res.status(500).json({ error: 'Failed to leave squad' });
    }
});

// POST /api/squad/create - Create a new squad
router.post('/squad/create', telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const telegramId = req.telegramUser!.id;
        const { name, telegramLink } = req.body;

        if (!name) return res.status(400).json({ error: 'Missing name' });

        // Check if user already in a squad
        const { data: user } = await supabase.from('users').select('squad_id').eq('telegram_id', telegramId).single();
        if (user?.squad_id) return res.status(400).json({ error: 'Already in a squad' });

        // Create the squad
        const { data: squad, error: squadError } = await supabase
            .from('squads')
            .insert({
                name,
                telegram_id: null, // Optional: handle group verification later
                member_count: 1,
                creator_id: telegramId,
                avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
            })
            .select()
            .single();

        if (squadError) throw squadError;

        // Join the creator to the squad
        await supabase.from('users').update({ squad_id: squad.id }).eq('telegram_id', telegramId);

        res.json({ success: true, squad });
    } catch (error: any) {
        console.error('Create Squad Error:', error.message);
        res.status(500).json({ error: 'Failed to create squad' });
    }
});

export default router;

