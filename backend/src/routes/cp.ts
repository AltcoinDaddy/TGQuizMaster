import express from 'express';
import { supabase } from '../config/supabase';
import { telegramAuthMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/cp-status
router.get('/cp-status', telegramAuthMiddleware, async (req: any, res) => {
    const userId = req.telegramUser.id;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('balance_cp, cp_last_claim, cp_base_rate, cp_boost_until')
            .eq('telegram_id', userId)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        const now = new Date();
        const lastClaim = new Date(user.cp_last_claim);
        const diffMs = now.getTime() - lastClaim.getTime();
        const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));

        // Calculate rate with boosters
        let currentRate = user.cp_base_rate || 100;
        if (user.cp_boost_until && new Date(user.cp_boost_until) > now) {
            currentRate *= 1.5; // 50% boost for now
        }

        // 8-hour cap
        const accumulated = Math.min(diffHours * currentRate, 8 * currentRate);

        res.json({
            balance: user.balance_cp || 0,
            accumulated: Math.floor(accumulated),
            rate: currentRate,
            lastClaim: user.cp_last_claim,
            boostUntil: user.cp_boost_until,
            maxCapacity: 8 * currentRate
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

// POST /api/claim-cp
router.post('/claim-cp', telegramAuthMiddleware, async (req: any, res) => {
    const userId = req.telegramUser.id;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('balance_cp, cp_last_claim, cp_base_rate, cp_boost_until')
            .eq('telegram_id', userId)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        const now = new Date();
        const lastClaim = new Date(user.cp_last_claim);
        const diffMs = now.getTime() - lastClaim.getTime();
        const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));

        let currentRate = user.cp_base_rate || 100;
        if (user.cp_boost_until && new Date(user.cp_boost_until) > now) {
            currentRate *= 1.5;
        }

        const accumulated = Math.floor(Math.min(diffHours * currentRate, 8 * currentRate));

        if (accumulated < 1) {
            return res.status(400).json({ error: 'Nothing to claim yet' });
        }

        const newBalance = (BigInt(user.balance_cp || 0) + BigInt(accumulated)).toString();

        const { error: updateError } = await supabase
            .from('users')
            .update({
                balance_cp: newBalance,
                cp_last_claim: now.toISOString()
            })
            .eq('telegram_id', userId);

        if (updateError) throw updateError;

        // Log transaction
        await supabase.from('transactions').insert({
            user_id: userId,
            type: 'PRIZE',
            amount: accumulated,
            currency: 'CP',
            metadata: { type: 'CP_YIELD_CLAIM' },
            status: 'COMPLETED'
        });

        res.json({
            success: true,
            claimed: accumulated,
            newBalance: newBalance
        });
    } catch (e: any) {
        res.status(500).json({ error: e.message });
    }
});

export default router;
