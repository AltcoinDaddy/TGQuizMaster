import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { telegramAuthMiddleware } from '../middleware/auth';
import { financialRateLimit } from '../middleware/rateLimit';

const router = Router();

// Shop Items (static data — move to DB in the future)
const SHOP_ITEMS = {
    stars: [
        { id: 's1', title: 'Star Bundle', description: 'Start your journey', price: 50, currency: 'Stars', reward: '1,000 Stars', color: 'yellow-400' },
        { id: 's2', title: 'Star Chest', description: 'Most popular choice', price: 250, currency: 'Stars', reward: '6,000 Stars', tag: 'BEST VALUE', color: 'yellow-400' },
        { id: 's3', title: 'Star Vault', description: 'For the ultimate masters', price: 1000, currency: 'Stars', reward: '30,000 Stars', color: 'yellow-400' }
    ],
    avatars: [
        { id: 'a1', title: 'Neon Glitch', description: 'Animated Frame', price: 500, currency: 'Stars', reward: 'NFT Avatar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJoJylJGktSTFhUfJdOVEmw1ozWpc8h-K9YKXlf-076p2a28wUyRQsSP-KmOgeizOi6c0O-cwUscuyxcYta4Qzlvxpf3V28xTSdGezOsojgY8VIEGye61sAR2uLYZvYQRXKNYUIkMP-JJCz1Iml2rnlQo7abJGIeqgTvXexQxF8IgBOdVmztnQ1YZNckUP7xpHFv-FF4x94DyKxks98fDY6W2GefcpXnOCPdrIuz5gOaNscs3KJwpb48g4CYV-IPAUfYVhvWTh2OA', color: 'primary' },
        { id: 'a2', title: 'Cyber Master', description: 'Premium Identity', price: 750, currency: 'Stars', reward: 'Legendary', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPahSwwA2M4HVR_vLV-lILzXC7xQf0Nox1bVuLcsHHMHaNB0P3tMJvfGAQhR8bjUciAoIGO6E9seaasLxRgULaniBkCmuWpyaweimfuakUNq2fAldQAcHIaImzziiR_16iI4yzrB3lav7O12FjqznvenQ2Bh7I-6f8ZAbJDvQTpblSoiTPnuFmX11iPLcMbsHgsUBjNOm9xx_-uuFtqiOjfUgtxs_MXfi_1w781LIrxGzYltnxrPtJ3k1O_f0P1B8qBuyrWzvlPWs', color: 'accent-purple' },
        { id: 'a3', title: 'Quiz Crown', description: 'Legendary Icon', price: 1200, currency: 'Stars', reward: 'Mythic', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpxvQnPLgvRsdJag0ER3UXSPs0e4Hs_EXeQMs10qLZI63j4W69n5WSnHjbC2ZFM6SZUF6DEuscPqqvkdw6MGkdyMA1xGOT4FNal-D6FHvTJCZEwLNitNulAPX8nU76wCAuwGHfauWHdN3PFV_IQF_AGlus2_ahPcsfr1mYYcjDaN4BAWV9ciFrZnHSG9UyhQ9-jhGkmCVbisnuWHtUDYGpB3VhlaVf6onab2vnMA3l9Llngng8mUcB2hNgkxZcSfDn6ZMit_xobvc', color: 'accent-gold' }
    ],
    powerups: [
        { id: 'pu_5050', title: '50/50', description: 'Removes 2 wrong answers', price: 100, currency: 'Stars', reward: '1x Use', icon: '🎯', color: 'primary' },
        { id: 'pu_time', title: 'Extra Time', description: '+10 seconds on a question', price: 75, currency: 'Stars', reward: '1x Use', icon: '⏰', color: 'yellow-400' },
        { id: 'pu_double', title: 'Double Points', description: '2x score on next answer', price: 150, currency: 'Stars', reward: '1x Use', icon: '⚡', color: 'accent-purple' }
    ]
};

const POWERUP_COSTS: Record<string, number> = {
    'pu_5050': 100,
    'pu_time': 75,
    'pu_double': 150
};

const PRO_COST = 500;

// GET /api/shop
router.get('/', async (_req: Request, res: Response) => {
    res.json({ shopItems: SHOP_ITEMS });
});

// POST /api/shop/buy-powerup
router.post('/buy-powerup', financialRateLimit, telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const telegramId = req.telegramUser!.id.toString();
        const { powerUpId, cost } = req.body;
        if (!telegramId || !powerUpId) return res.status(400).json({ success: false, error: 'Missing fields' });

        const expectedCost = POWERUP_COSTS[powerUpId];
        if (!expectedCost) return res.status(400).json({ success: false, error: 'Invalid power-up' });

        const userId = parseInt(telegramId);

        const { data: user, error } = await supabase
            .from('users')
            .select('balance_stars, inventory')
            .eq('telegram_id', userId)
            .single();

        if (error || !user) return res.status(404).json({ success: false, error: 'User not found' });
        if ((user.balance_stars || 0) < expectedCost) {
            return res.status(400).json({ success: false, error: 'Not enough Stars' });
        }

        const newBalance = (user.balance_stars || 0) - expectedCost;
        const newInventory = [...(user.inventory || []), powerUpId];

        await supabase.from('users').update({
            balance_stars: newBalance,
            inventory: newInventory
        }).eq('telegram_id', userId);

        await supabase.from('transactions').insert({
            user_id: userId,
            type: 'SHOP_PURCHASE',
            amount: expectedCost,
            currency: 'STARS',
            metadata: { item: powerUpId, type: 'powerup' },
            status: 'COMPLETED'
        });

        console.log(`[SHOP] User ${telegramId} bought ${powerUpId} for ${expectedCost} Stars`);
        res.json({ success: true, newBalance, inventory: newInventory });
    } catch (e) {
        console.error('Buy power-up error:', e);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST /api/shop/buy-pro
router.post('/buy-pro', financialRateLimit, telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const telegramId = req.telegramUser!.id.toString();
        if (!telegramId) return res.status(400).json({ success: false, error: 'Missing telegramId' });

        const userId = parseInt(telegramId);

        const { data: user, error } = await supabase.from('users').select('balance_stars, is_pro').eq('telegram_id', userId).single();
        if (error || !user) return res.status(404).json({ success: false, error: 'User not found' });

        if (user.is_pro) return res.status(400).json({ success: false, error: 'Already Pro' });
        if ((user.balance_stars || 0) < PRO_COST) return res.status(400).json({ success: false, error: 'Not enough Stars' });

        const newBalance = (user.balance_stars || 0) - PRO_COST;
        await supabase.from('users').update({
            balance_stars: newBalance,
            is_pro: true
        }).eq('telegram_id', userId);

        await supabase.from('transactions').insert({
            user_id: userId,
            type: 'SHOP_PURCHASE',
            amount: PRO_COST,
            currency: 'STARS',
            metadata: { item: 'pro_subscription', type: 'subscription' },
            status: 'COMPLETED'
        });

        console.log(`[SHOP] User ${telegramId} bought PRO for ${PRO_COST} Stars`);
        res.json({ success: true, isPro: true, newBalance });
    } catch (e) {
        console.error('Buy Pro error:', e);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// POST /api/shop/create-payment-link
router.post('/create-payment-link', financialRateLimit, telegramAuthMiddleware, async (req: Request, res: Response) => {
    try {
        const { title, description, payload, amount } = req.body;

        if (!title || !amount) {
            return res.status(400).json({ error: 'Missing title or amount' });
        }

        // Import starsService directly to avoid circular imports
        const { starsService } = await import('../bot');
        if (!starsService) {
            return res.status(503).json({ error: 'Bot service not initialized' });
        }

        const invoiceLink = await starsService.getInvoiceLink(title, description, payload, parseFloat(amount));
        res.json({ invoiceLink });
    } catch (err: any) {
        console.error('Payment Link Error:', err.message);
        res.status(500).json({ error: 'Failed to create payment link' });
    }
});

export default router;
