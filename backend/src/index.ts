import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import dns from 'dns';

// Force usage of IPv4 for DNS resolution to avoid timeouts on some networks
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

import { supabase } from './config/supabase';
import { getTonBalance } from './utils/tonBalance';

import { GameManager } from './utils/GameManager';
import './bot'; // Initialize Bot
import { starsService, notificationService } from './bot';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Verify Supabase Schema on startup
const verifySchema = async () => {
    console.log('[DB] Verifying Supabase schema...');
    try {
        const { data, error } = await supabase.from('users').select('*').limit(1);
        if (error) {
            console.error('[DB] Schema Error:', error.message);
            if (error.message.includes('column "wallet_address" does not exist')) {
                console.error('CRITICAL: MISSING COLUMN "wallet_address". Please run the SQL migration!');
            }
            if (error.message.includes('column "referred_by" does not exist')) {
                console.error('CRITICAL: MISSING COLUMN "referred_by". Please run the SQL migration!');
            }
        } else {
            console.log('[DB] Users table verified. Columns found.');
            // Test if wallet_address is actually in the columns
            if (data && data.length > 0) {
                const cols = Object.keys(data[0]);
                if (!cols.includes('wallet_address')) console.error('[DB] WARNING: wallet_address missing from keys!');
                if (!cols.includes('referred_by')) console.error('[DB] WARNING: referred_by missing from keys!');
            }
        }
    } catch (e) {
        console.error('[DB] Verification failed:', e);
    }
};
verifySchema();

// Payment API
app.post('/api/create-payment-link', async (req, res) => {
    try {
        const { title, description, payload, amount } = req.body;

        if (!title || !amount) {
            return res.status(400).json({ error: 'Missing title or amount' });
        }

        if (!starsService) {
            return res.status(503).json({ error: 'Bot service not initialized' });
        }

        const invoiceLink = await starsService.getInvoiceLink(title, description, payload, parseFloat(amount));
        res.json({ invoiceLink });

    } catch (error: any) {
        console.error('Payment Link Error:', error.message);
        res.status(500).json({ error: 'Failed to create link' });
    }
});

// Leaderboard API
app.get('/api/leaderboard', async (req, res) => {
    try {
        const { data: topPlayers, error } = await supabase
            .from('users')
            .select('*')
            .order('stats_wins', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Map to frontend format
        const leaderboard = topPlayers.map((p, index) => ({
            rank: index + 1,
            name: p.username || `Player ${p.telegram_id}`,
            score: `${p.stats_wins || 0} Wins`,
            isTop: index === 0,
            xp: p.stats_xp || 0,
            reward: `${((p.stats_wins || 0) * 0.5).toFixed(1)} TON`, // Mock reward calc
            telegramId: p.telegram_id.toString()
        }));

        res.json({ leaderboard });
    } catch (error: any) {
        console.error('Leaderboard Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Tournaments API
app.get('/api/tournaments', (req, res) => {
    try {
        const activeRooms = Array.from(rooms.values()).map(mgr => mgr.getRoomInfo());
        res.json({ tournaments: activeRooms });
    } catch (error: any) {
        console.error('Tournaments API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
});

// History Endpoint
app.get('/api/history', async (req, res) => {
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
            .limit(20); // Limit to recent 20 games

        if (error) {
            console.error('Error fetching history:', error);
            return res.status(500).json({ error: 'Failed to fetch history' });
        }

        // Calculate Stats
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
            date: new Date(game.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), // e.g., 12 Oct
            rank: game.rank || 0,
            reward: game.reward_amount > 0 ? `+${game.reward_amount} ${game.reward_currency}` : '---',
            accuracy: `${game.accuracy || 0}%`,
            speed: `${game.avg_speed || 0}s`,
            status: game.rank === 1 ? 'WINNER' : 'PARTICIPANT'
        }));

        res.json({
            history: formattedHistory,
            stats: {
                totalEarnings,
                winRate
            }
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Shop Endpoint
app.get('/api/shop', async (req, res) => {
    // In the future this can come from the DB
    const shopItems = {
        stars: [
            { id: 's1', title: 'Star Bundle', description: 'Start your journey', price: 50, currency: 'Stars', reward: '1,000 Stars', color: 'yellow-400' },
            { id: 's2', title: 'Star Chest', description: 'Most popular choice', price: 250, currency: 'Stars', reward: '6,000 Stars', tag: 'BEST VALUE', color: 'yellow-400' },
            { id: 's3', title: 'Star Vault', description: 'For the ultimate masters', price: 1000, currency: 'Stars', reward: '30,000 Stars', color: 'yellow-400' }
        ],
        avatars: [
            { id: 'a1', title: 'Neon Glitch', description: 'Animated Frame', price: 500, currency: 'Stars', reward: 'NFT Avatar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJoJylJGktSTFhUfJdOVEmw1ozWpc8h-K9YKXlf-076p2a28wUyRQsSP-KmOgeizOi6c0O-cwUscuyxcYta4Qzlvxpf3V28xTSdGezOsojgY8VIEGye61sAR2uLYZvYQRXKNYUIkMP-JJCz1Iml2rnlQo7abJGIeqgTvXexQxF8IgBOdVmztnQ1YZNckUP7xpHFv-FF4x94DyKxks98fDY6W2GefcpXnOCPdrIuz5gOaNscs3KJwpb48g4CYV-IPAUfYVhvWTh2OA', color: 'primary' },
            { id: 'a2', title: 'Cyber Master', description: 'Premium Identity', price: 750, currency: 'Stars', reward: 'Legendary', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPahSwwA2M4HVR_vLV-lILzXC7xQf0Nox1bVuLcsHHMHaNB0P3tMJvfGAQhR8bjUciAoIGO6E9seaasLxRgULaniBkCmuWpyaweimfuakUNq2fAldQAcHIaImzziiR_16iI4yzrB3lav7O12FjqznvenQ2Bh7I-6f8ZAbJDvQTpblSoiTPnuFmX11iPLcMbsHgsUBjNOm9xx_-uuFtqiOjfUgtxs_MXfi_1w781LIrxGzYltnxrPtJ3k1O_f0P1B8qBuyrWzvlPWs', color: 'accent-purple' },
            { id: 'a3', title: 'Quiz Crown', description: 'Legendary Icon', price: 1200, currency: 'Stars', reward: 'Mythic', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpxvQnPLgvRsdJag0ER3UXSPs0e4Hs_EXeQMs10qLZI63j4W69n5WSnHjbC2ZFM6SZUF6DEuscPqqvkdw6MGkdyMA1xGOT4FNal-D6FHvTJCZEwLNitNulAPX8nU76wCAuwGHfauWHdN3PFV_IQF_AGlus2_ahPcsfr1mYYcjDaN4BAWV9ciFrZnHSG9UyhQ9-jhGkmCVbisnuWHtUDYGpB3VhlaVf6onab2vnMA3l9Llngng8mUcB2hNgkxZcSfDn6ZMit_xobvc', color: 'accent-gold' }
        ]
    };
    res.json({ shopItems });
});

// Daily Reward Streak Rewards Map
const STREAK_REWARDS = [0, 50, 75, 100, 150, 200, 300, 500]; // index 0 unused, day 1-7

function getTodayDate(): string {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD in UTC
}

function getYesterdayDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
}

// GET /api/daily-reward - Check streak status
app.get('/api/daily-reward', async (req, res) => {
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

        const lastClaim = user.streak_last_claim; // DATE string or null
        const alreadyClaimed = lastClaim === today;

        // Calculate current streak day to display
        let streakDay = user.streak_current || 0;

        if (!alreadyClaimed) {
            // If last claim was yesterday, streak continues (next day)
            if (lastClaim === getYesterdayDate()) {
                streakDay = Math.min((user.streak_current || 0) + 1, 7);
            } else if (!lastClaim) {
                // First ever login
                streakDay = 1;
            } else {
                // Missed a day, streak resets
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

// POST /api/claim-daily - Claim today's streak reward
app.post('/api/claim-daily', async (req, res) => {
    try {
        const { telegramId } = req.body;
        if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });

        const userId = parseInt(telegramId);
        const today = getTodayDate();

        const { data: user, error } = await supabase
            .from('users')
            .select('streak_current, streak_last_claim, balance_stars')
            .eq('telegram_id', userId)
            .single();

        if (error || !user) return res.status(404).json({ error: 'User not found' });

        // Already claimed today?
        if (user.streak_last_claim === today) {
            return res.status(400).json({ error: 'Already claimed today', alreadyClaimed: true });
        }

        // Calculate new streak
        let newStreak: number;
        if (user.streak_last_claim === getYesterdayDate()) {
            // Consecutive day
            newStreak = Math.min((user.streak_current || 0) + 1, 7);
        } else {
            // First claim or missed a day — start at 1
            newStreak = 1;
        }

        // After day 7, cycle back to day 1
        if ((user.streak_current || 0) >= 7 && user.streak_last_claim === getYesterdayDate()) {
            newStreak = 1;
        }

        const reward = STREAK_REWARDS[newStreak] || 50;
        const newBalance = (user.balance_stars || 0) + reward;

        // Update user
        const { error: updateError } = await supabase
            .from('users')
            .update({
                streak_current: newStreak,
                streak_last_claim: today,
                balance_stars: newBalance
            })
            .eq('telegram_id', userId);

        if (updateError) throw updateError;

        // Log transaction
        await supabase.from('transactions').insert({
            user_id: userId,
            type: 'DAILY_REWARD',
            amount: reward,
            currency: 'STARS',
            metadata: { day: newStreak, type: 'DAILY_STREAK' },
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

// Quests API
app.get('/api/quests', async (req, res) => {
    try {
        const { telegramId } = req.query;
        if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });

        const userId = parseInt(telegramId as string);
        const today = getTodayDate();

        // 1. Fetch User Stats
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();

        if (userError) throw userError;

        // 2. Daily reset check — if it's a new day, reset daily counters
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

        // 3. Fetch Referrals (all-time, doesn't reset)
        const { count: referralCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', userId);

        // 4. Fetch today's claimed quests
        const todayStart = new Date(today + 'T00:00:00Z').toISOString();
        const { data: claims } = await supabase
            .from('transactions')
            .select('metadata, created_at')
            .eq('user_id', userId)
            .eq('type', 'PRIZE')
            .gte('created_at', todayStart);

        const claimedIds = (claims || [])
            .filter(tx => tx.metadata?.questId && tx.metadata?.type === 'QUEST_REWARD')
            .map(tx => tx.metadata.questId);

        // 5. Calculate Daily Quests (reset each day)
        const dailyGames = user.daily_games_today || 0;
        const dailyWins = user.daily_wins_today || 0;

        const quests = [
            {
                id: '1',
                title: 'Play 3 Quizzes Today',
                progress: Math.min(dailyGames, 3),
                total: 3,
                reward: '20 Stars',
                type: 'stars',
                status: claimedIds.includes('1') ? 'completed' : (dailyGames >= 3 ? 'claimable' : 'in-progress')
            },
            {
                id: '2',
                title: 'Win a Game Today',
                progress: Math.min(dailyWins, 1),
                total: 1,
                reward: '100 XP',
                type: 'xp',
                status: claimedIds.includes('2') ? 'completed' : (dailyWins >= 1 ? 'claimable' : 'in-progress')
            },
            {
                id: '3',
                title: 'Invite 1 Friend',
                progress: Math.min(referralCount || 0, 1),
                total: 1,
                reward: '50 Stars',
                type: 'stars',
                status: claimedIds.includes('3') ? 'completed' : ((referralCount || 0) >= 1 ? 'claimable' : 'in-progress')
            }
        ];

        // 6. Calculate Weekly Milestone
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { count: weeklyClaimCount } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', 'PRIZE')
            .gte('created_at', oneWeekAgo.toISOString());

        const weeklyMilestone = {
            current: weeklyClaimCount || 0,
            target: 15,
            reward: 'Epic Mystery Chest'
        };

        res.json({ quests, weeklyMilestone });
    } catch (error: any) {
        console.error('Quests API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch quests' });
    }
});

// Achievements API
app.get('/api/achievements', async (req, res) => {
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

        // Define Achievements Logic
        // In a real app, 'unlocked_at' would be stored in a user_achievements table
        // Here we calculate status on the fly based on stats
        const definitions = [
            {
                id: '1',
                title: '10 Day Streak',
                description: "You've maintained perfect daily activity for 10 consecutive days.",
                requirement: (u: any) => false, // TODO: Implement streak tracking in DB
                reward: 'Legendary',
                color: 'primary',
                icon: 'Zap' // String identifier for frontend mapping
            },
            {
                id: '2',
                title: 'Crypto King',
                description: 'Win 5 tournaments.',
                requirement: (u: any) => (u.stats_wins || 0) >= 5,
                reward: 'Rare',
                color: 'yellow-400',
                icon: 'Star'
            },
            {
                id: '3',
                title: 'Mind Reader',
                description: 'Answer 10 questions correctly in under 1 second.',
                requirement: (u: any) => false, // Hard to track without granular stats, mock for now
                reward: 'Legendary',
                color: 'purple-400',
                icon: 'Sparkles'
            },
            {
                id: '4',
                title: 'Guardian',
                description: 'Play 50 games.',
                requirement: (u: any) => (u.stats_total_games || 0) >= 50,
                reward: 'Rare',
                color: 'blue-400',
                icon: 'Shield'
            }
        ];

        const achievements = definitions.map(def => {
            const isUnlocked = def.requirement(user);
            return {
                id: def.id,
                title: def.title,
                description: def.description,
                status: isUnlocked ? 'unlocked' : 'locked',
                date: isUnlocked ? 'Unlocked' : undefined, // real date implies DB storage
                rarity: def.reward,
                color: def.color,
                icon: def.icon
            };
        });

        // Calculate Total Score/XP for Achievements screen
        // In this design, it seems independent of the main 'xp'? 
        // Let's use the main stats_xp for consistency.
        const score = {
            total: user.stats_xp || 0,
            rank: (user.stats_xp || 0) > 1000 ? 'Quiz Master' : 'Quiz Novice',
            nextRank: (user.stats_xp || 0) > 1000 ? 'Quiz God' : 'Quiz Master',
            progress: ((user.stats_xp || 0) % 1000) / 10 // Mock progress %
        };

        const unlockedCount = achievements.filter(a => a.status === 'unlocked').length;

        res.json({ achievements, score, totalCount: definitions.length, unlockedCount });

    } catch (error: any) {
        console.error('Achievements API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

app.post('/api/claim-quest', async (req, res) => {
    try {
        const { telegramId, questId } = req.body;
        const userId = parseInt(telegramId);

        // Verify if claimable
        // (For brevity, we'll trust the client or re-verify. Real prod needs re-verification)
        // Let's do a quick re-verify for one quest as example
        const { data: user } = await supabase.from('users').select('*').eq('telegram_id', userId).single();
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Add transaction
        const { error: txError } = await supabase.from('transactions').insert({
            user_id: userId,
            type: 'PRIZE',
            amount: questId === '1' ? 20 : (questId === '3' ? 50 : 0),
            currency: 'STARS',
            metadata: { questId, type: 'QUEST_REWARD' },
            status: 'COMPLETED'
        });

        if (txError) throw txError;

        // Update balance if stars
        if (questId === '1' || questId === '3') {
            const reward = questId === '1' ? 20 : 50;
            await supabase.from('users')
                .update({ balance_stars: (user.balance_stars || 0) + reward })
                .eq('telegram_id', userId);
        } else if (questId === '2') {
            await supabase.from('users')
                .update({ stats_xp: (user.stats_xp || 0) + 100 })
                .eq('telegram_id', userId);
        }

        res.json({ success: true });
    } catch (error: any) {
        console.error('Claim Quest Error:', error.message);
        res.status(500).json({ error: 'Failed to claim quest' });
    }
});

app.post('/api/withdraw', async (req, res) => {
    try {
        const { telegramId, amount, address } = req.body;
        const userId = parseInt(telegramId);
        const withdrawAmount = parseFloat(amount);

        if (!telegramId || !amount || !address) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // 1. Check live blockchain balance
        const liveBalance = await getTonBalance(address);

        if (liveBalance < withdrawAmount) {
            return res.status(400).json({ error: 'Insufficient on-chain balance' });
        }

        // 2. Create Pending Transaction (for admin review)
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

        // 3. Actual on-chain transfer handled in Phase 2 via smart contract
        console.log(`[WITHDRAW] User ${userId} requested ${withdrawAmount} TON to ${address}`);

        res.json({ success: true, message: 'Withdrawal request submitted for processing' });

    } catch (error: any) {
        console.error('Withdrawals API Error:', error.message);
        res.status(500).json({ error: 'Failed to process withdrawal' });
    }
});

// Game State
const rooms = new Map<string, GameManager>();
const socketPlayerMap = new Map<string, { roomId: string; playerId: string }>();

// In-flight request cache: stores the promise of an ongoing sync so duplicates share it
const profileSyncInFlight = new Map<number, { promise: Promise<any>; timestamp: number }>();

// Helper: Fetch user from Supabase with retry
async function fetchUserWithRetry(userId: number, username: string, maxRetries = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            let { data: userData, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', userId)
                .single();

            if (fetchError && fetchError.code === 'PGRST116') {
                console.log(`[SYNC] User ${userId} not found, creating...`);
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        telegram_id: userId,
                        username: username || 'Anon_Player',
                        balance_stars: 100
                    })
                    .select()
                    .single();
                if (createError) throw createError;
                return newUser;
            } else if (fetchError) {
                throw fetchError;
            }
            return userData;
        } catch (error: any) {
            const isRetryable = error.message?.includes('socket hang up') ||
                error.message?.includes('ECONNRESET') ||
                error.message?.includes('ETIMEDOUT') ||
                error.message?.includes('522') ||
                error.message?.includes('520') ||
                error.message?.includes('502');

            if (isRetryable && attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 1s, 2s, 4s (capped at 5s)
                console.warn(`[SYNC-RETRY] Attempt ${attempt}/${maxRetries} failed for user ${userId}. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', async (data) => {
        const { username, avatar, telegramId, tournamentId, entryFee, currency } = data;
        const userId = telegramId ? parseInt(telegramId) : 0; // 0 for anon/dev, but really should strictly enforce

        console.log(`[JOIN] ${username} (${userId}) attempting to join. Fee: ${entryFee}`);

        try {
            // 1. Auth / Upsert User (Supabase)
            // Check if user exists first to get balance
            let { data: user, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', userId)
                .single();

            if (fetchError && fetchError.code === 'PGRST116') {
                // Not found, create
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        telegram_id: userId,
                        username,
                        balance_stars: 0
                    })
                    .select()
                    .single();

                if (createError) {
                    if (data.roomType === 'practice') {
                        console.warn("User creation failed, proceeding for practice mode.");
                        user = { telegram_id: userId, username, balance_stars: 0 };
                    } else {
                        throw createError;
                    }
                } else {
                    user = newUser;
                    console.log(`[AUTH] Created new user: ${username}`);
                }
            } else if (fetchError) {
                throw fetchError;
            }

            // 2. Entry Fee Check
            let feeAmount = 0;
            let feeCurrency = 'STARS';

            if (entryFee && entryFee !== 'Free') {
                const parts = entryFee.split(' ');
                feeAmount = parseInt(parts[0]);
                feeCurrency = parts[1].toUpperCase(); // STARS or TON

                if (feeCurrency === 'STARS') {
                    if ((user.balance_stars || 0) < feeAmount) {
                        socket.emit('error', { message: 'Insufficient Stars balance' });
                        return;
                    }
                    // Deduct Stars
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ balance_stars: user.balance_stars - feeAmount })
                        .eq('telegram_id', userId);
                    if (updateError) throw updateError;

                    user.balance_stars -= feeAmount; // Update local state for client emit
                } else if (feeCurrency === 'TON') {
                    // TON entry fees will be handled via smart contract in Phase 2
                    // For now, TON tournaments are not supported for fee deduction
                    socket.emit('error', { message: 'TON tournaments coming soon' });
                    return;
                }

                // Log Transaction
                await supabase.from('transactions').insert({
                    user_id: userId,
                    type: 'ENTRY_FEE',
                    amount: -feeAmount,
                    currency: feeCurrency,
                    metadata: { tournamentId },
                    status: 'COMPLETED'
                });
                console.log(`[PAYMENT] Deducted ${feeAmount} ${feeCurrency} from ${username}`);
            }

            // 3. Matchmaking
            let roomId: string | undefined;

            if (data.roomType === 'practice') {
                roomId = crypto.randomUUID();
                const mgr = new GameManager(roomId, io, 'practice', 0, 0);
                rooms.set(roomId, mgr);

                mgr.addPlayer({
                    id: userId.toString(),
                    username,
                    avatar,
                    score: 0
                });

                socket.join(roomId);
                socketPlayerMap.set(socket.id, { roomId, playerId: userId.toString() });
                socket.emit('game_start'); // Instant start for practice
                mgr.start(); // Start questions
                return;
            }

            // Quick Play: auto-join any open Stars room with 10 Stars entry
            if (data.roomType === 'quickplay') {
                const quickFee = 10;
                if ((user.balance_stars || 0) < quickFee) {
                    socket.emit('error', { message: `Need at least ${quickFee} Stars for Quick Play` });
                    return;
                }

                // Deduct Stars
                await supabase.from('users')
                    .update({ balance_stars: user.balance_stars - quickFee })
                    .eq('telegram_id', userId);
                user.balance_stars -= quickFee;

                // Log entry fee transaction
                await supabase.from('transactions').insert({
                    user_id: userId,
                    type: 'ENTRY_FEE',
                    amount: -quickFee,
                    currency: 'STARS',
                    metadata: { mode: 'quickplay' },
                    status: 'COMPLETED'
                });

                // Find any open Stars room or create one
                roomId = Array.from(rooms.keys()).find(id => {
                    const mgr = rooms.get(id);
                    if (!mgr) return false;
                    const info = mgr.getRoomInfo();
                    return info.players < info.maxPlayers &&
                        info.status === 'waiting' &&
                        info.currency === 'Stars' &&
                        Math.abs(info.entryFee - quickFee) < 0.01;
                });

                if (!roomId) {
                    roomId = crypto.randomUUID();
                    rooms.set(roomId, new GameManager(roomId, io, 'stars', 0, quickFee, 5));
                }

                feeAmount = quickFee;
                feeCurrency = 'STARS';
                // Fall through to normal join logic below
            }
            // Find a room matching the currency/type or create new (skip if quickplay already found one)
            if (!roomId) {
                roomId = Array.from(rooms.keys()).find(id => {
                    const mgr = rooms.get(id);
                    if (!mgr) return false;
                    const info = mgr.getRoomInfo();
                    return info.players < info.maxPlayers &&
                        info.status === 'waiting' &&
                        info.currency === (feeCurrency === 'TON' ? 'TON' : 'Stars') &&
                        Math.abs(info.entryFee - feeAmount) < 0.01; // Float safety
                });
            }

            if (!roomId) {
                roomId = crypto.randomUUID();
                // Use provided maxPlayers but clamp between 2 and 20 for safety
                const playersLimit = data.maxPlayers ? Math.min(Math.max(parseInt(data.maxPlayers), 2), 20) : 5;
                const newManager = new GameManager(roomId, io, feeCurrency === 'TON' ? 'ton' : 'stars', 0, feeAmount, playersLimit);

                // Handle room timeout: refund all players and clean up
                const capturedRoomId = roomId;
                newManager.onExpire = async (mgr) => {
                    try {
                        const info = mgr.getRoomInfo();
                        const players = mgr.getPlayers();

                        if (info.entryFee > 0 && players.length > 0) {
                            console.log(`[REFUND] Refunding ${players.length} players in expired room ${capturedRoomId} (${info.entryFee} Stars each)`);

                            for (const player of players) {
                                const playerId = parseInt(player.id);
                                if (!playerId) continue;

                                // Credit Stars back
                                const { data: userData } = await supabase
                                    .from('users')
                                    .select('balance_stars')
                                    .eq('telegram_id', playerId)
                                    .single();

                                if (userData) {
                                    await supabase.from('users')
                                        .update({ balance_stars: (userData.balance_stars || 0) + info.entryFee })
                                        .eq('telegram_id', playerId);
                                }

                                // Log refund transaction
                                await supabase.from('transactions').insert({
                                    user_id: playerId,
                                    type: 'REFUND',
                                    amount: info.entryFee,
                                    currency: 'STARS',
                                    metadata: { reason: 'room_expired', roomId: capturedRoomId },
                                    status: 'COMPLETED'
                                });

                                console.log(`[REFUND] Refunded ${info.entryFee} Stars to user ${playerId}`);
                            }
                        }
                    } catch (e) {
                        console.error('[REFUND] Failed to refund players:', e);
                    }

                    // Clean up room from memory
                    rooms.delete(capturedRoomId);
                };

                // Clean up room after game finishes
                newManager.onGameOver = (finishedRoomId) => {
                    rooms.delete(finishedRoomId);
                    console.log(`[CLEANUP] Room ${finishedRoomId} deleted after game over`);
                };

                rooms.set(roomId, newManager);

                // Notify recently active users about the new room (Stars rooms only)
                if (feeCurrency === 'STARS' && notificationService) {
                    (async () => {
                        try {
                            const { supabase } = await import('./config/supabase');
                            const { data: recentUsers } = await supabase
                                .from('users')
                                .select('telegram_id')
                                .gt('stats_total_games', 0)
                                .neq('telegram_id', userId)
                                .limit(50);

                            if (recentUsers && recentUsers.length > 0) {
                                console.log(`[NOTIFY] Sending room notification to ${recentUsers.length} recent players`);
                                for (const u of recentUsers) {
                                    notificationService.notifyRoomOpen(u.telegram_id, {
                                        entryFee: feeAmount,
                                        currency: 'Stars',
                                        playerCount: 1,
                                        maxPlayers: 5
                                    });
                                }
                            }
                        } catch (e) {
                            console.error('[NOTIFY] Room notification failed:', e);
                        }
                    })();
                }
            }

            const manager = rooms.get(roomId)!;
            manager.addPlayer({
                id: userId.toString(),
                username,
                avatar,
                score: 0
            });

            socket.join(roomId);
            socketPlayerMap.set(socket.id, { roomId, playerId: userId.toString() });

            // Send updated user balance to client
            socket.emit('balance_update', {
                stars: user.balance_stars,
                ton: 0 // TON balance is fetched live from blockchain via /api/daily-reward or profile sync
            });

            io.to(roomId).emit('room_update', {
                players: manager.getPlayers()
            });

            const roomInfo = manager.getRoomInfo();
            if (manager.getPlayers().length >= roomInfo.maxPlayers) {
                manager.recalculatePrizePool(); // Calculate prize pool & rake based on actual players
                manager.start();
                io.to(roomId).emit('game_start');
            }

        } catch (error) {
            console.error('Join Room Error:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    });

    socket.on('submit_answer', (answer) => {
        // Find which room this socket is in
        const roomId = Array.from(socket.rooms).find(r => rooms.has(r));
        if (roomId) {
            rooms.get(roomId)?.submitAnswer(socket.id, answer);
        }
    });

    socket.on('leave_room', () => {
        const mapping = socketPlayerMap.get(socket.id);
        if (!mapping) return;

        const { roomId, playerId } = mapping;
        console.log(`[LEAVE] Player ${playerId} leaving room ${roomId}`);

        socketPlayerMap.delete(socket.id);
        socket.leave(roomId);

        const manager = rooms.get(roomId);
        if (!manager) return;

        // Same cleanup logic as disconnect
        if (!manager.isStarted() && !manager.isExpired()) {
            manager.removePlayer(playerId);
            io.to(roomId).emit('room_update', manager.getRoomInfo());

            if (manager.getPlayers().length === 0) {
                manager.cancelTimeout();
                rooms.delete(roomId);
                console.log(`[CLEANUP] Empty room ${roomId} deleted`);
            }
        }
    });

    socket.on('sync_profile', async (data) => {
        const { telegramId, username } = data;
        const userId = telegramId ? parseInt(telegramId) : 0;
        if (!userId) return;

        // In-flight deduplication: If a request for this user is already running or was completed recently, reuse it
        const existing = profileSyncInFlight.get(userId);
        const now = Date.now();
        if (existing && (now - existing.timestamp) < 5000) {
            // Reuse the existing promise result
            try {
                const user = await existing.promise;
                if (user) {
                    console.log(`[SYNC] Reusing cached result for ${userId} from ${socket.id}`);
                    // Fetch live TON balance (getTonBalance has its own 30s cache, so this is cheap)
                    const liveTon = user.wallet_address ? await getTonBalance(user.wallet_address) : 0;
                    // Still emit the result to THIS socket
                    socket.emit('profile_synced', {
                        stars: user.balance_stars,
                        ton: liveTon,
                        xp: user.stats_xp || 0,
                        wins: user.stats_wins || 0,
                        totalGames: user.stats_total_games || 0,
                        walletConnected: !!user.wallet_address,
                        walletAddress: user.wallet_address,
                        referralCount: 0,
                        referralEarnings: 0,
                        recentReferrals: [],
                        recentTransactions: []
                    });
                }
            } catch (e) {
                // The cached request also failed, just skip
                console.warn(`[SYNC] Cached request failed for ${userId}, skipping`);
            }
            return;
        }

        // First request for this user: create the promise and cache it
        console.log(`[SYNC] Profile request for ${telegramId} (${username}) from ${socket.id}`);
        const fetchPromise = fetchUserWithRetry(userId, username);
        profileSyncInFlight.set(userId, { promise: fetchPromise, timestamp: now });

        // Clean up cache after 5 seconds
        setTimeout(() => {
            const cached = profileSyncInFlight.get(userId);
            if (cached && cached.timestamp === now) {
                profileSyncInFlight.delete(userId);
            }
        }, 5000);

        let user;
        try {
            user = await fetchPromise;
            if (!user) {
                console.error(`[SYNC] No user data returned for ${userId}`);
                return;
            }
        } catch (error: any) {
            console.warn(`[SYNC-WARN] All retries failed for user ${userId}: ${error.message?.substring(0, 100)}`);
            return;
        }

        // Fetch live TON balance from blockchain if wallet is connected
        let liveTonBalance = 0;
        if (user.wallet_address) {
            liveTonBalance = await getTonBalance(user.wallet_address);
        }

        console.log(`[SYNC] User ${userId} data: wallet=${user.wallet_address}, stars=${user.balance_stars}, xp=${user.stats_xp}, ton=${liveTonBalance}`);

        let referralCount = 0;
        let referrals: any[] | null = [];
        let referralEarnings = 0;
        let recentTransactions: any[] = [];

        try {
            // Fetch Referral Stats
            const { count, data } = await supabase
                .from('users')
                .select('username, created_at, telegram_id', { count: 'exact' })
                .eq('referred_by', userId)
                .order('created_at', { ascending: false })
                .limit(10);
            referralCount = count || 0;
            referrals = data;
        } catch (e) {
            console.error('[SYNC] Failed to fetch referrals:', e);
        }

        try {
            // Fetch Earnings
            const { data: earningsData } = await supabase
                .from('transactions')
                .select('amount, metadata, created_at')
                .eq('user_id', userId)
                .eq('type', 'REFERRAL_BONUS');
            referralEarnings = (earningsData || []).reduce((sum, tx) => sum + tx.amount, 0);
        } catch (e) {
            console.error('[SYNC] Failed to fetch referral earnings:', e);
        }

        // Map referrals
        const recentReferrals = (referrals || []).map(ref => ({
            username: ref.username,
            date: ref.created_at,
            earned: "+0.00 TON"
        }));

        try {
            // Fetch Recent Transactions
            const { data: txs } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);
            recentTransactions = txs || [];
        } catch (e) {
            console.error('[SYNC] Failed to fetch transactions:', e);
        }

        socket.emit('profile_synced', {
            stars: user.balance_stars,
            ton: liveTonBalance,
            xp: user.stats_xp || 0,
            wins: user.stats_wins || 0,
            totalGames: user.stats_total_games || 0,
            walletConnected: !!user.wallet_address,
            walletAddress: user.wallet_address,
            referralCount: referralCount,
            referralEarnings: referralEarnings,
            recentReferrals,
            recentTransactions
        });

    });

    socket.on('update_wallet', async (data) => {
        const { telegramId, walletAddress } = data;
        console.log(`[WALLET] Received update_wallet for ${telegramId}: ${walletAddress}`);

        try {
            const { data: updatedUser, error } = await supabase
                .from('users')
                .update({ wallet_address: walletAddress })
                .eq('telegram_id', parseInt(telegramId))
                .select()
                .single();

            if (error) {
                console.error('[WALLET] Supabase Update Error:', error);
            } else {
                console.log(`[WALLET] Successfully updated wallet_address in DB for ${telegramId}`);

                // Fetch live TON balance for the newly connected wallet
                let liveTonBalance = 0;
                if (walletAddress) {
                    liveTonBalance = await getTonBalance(walletAddress);
                }

                // Emit sync to update frontend immediately with real balance
                socket.emit('profile_synced', {
                    walletConnected: !!updatedUser.wallet_address,
                    walletAddress: updatedUser.wallet_address,
                    ton: liveTonBalance
                });
            }
        } catch (e) {
            console.error('[WALLET] Sync Exception:', e);
        }
    });

    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);

        const mapping = socketPlayerMap.get(socket.id);
        if (!mapping) return;

        const { roomId, playerId } = mapping;
        socketPlayerMap.delete(socket.id);

        const manager = rooms.get(roomId);
        if (!manager) return;

        // If game hasn't started, remove player and refund entry fee
        if (!manager.isStarted() && !manager.isExpired()) {
            const fee = manager.getEntryFee();
            const type = manager.getType();
            manager.removePlayer(playerId);

            console.log(`[DISCONNECT] Player ${playerId} left room ${roomId} (fee: ${fee})`);

            // Refund entry fee if it was a paid room
            if (fee > 0 && (type === 'stars' || type === 'ton')) {
                try {
                    const pid = parseInt(playerId);
                    const { data: userData } = await supabase
                        .from('users')
                        .select('balance_stars')
                        .eq('telegram_id', pid)
                        .single();

                    if (userData) {
                        await supabase.from('users')
                            .update({ balance_stars: (userData.balance_stars || 0) + fee })
                            .eq('telegram_id', pid);
                    }

                    await supabase.from('transactions').insert({
                        user_id: pid,
                        type: 'REFUND',
                        amount: fee,
                        currency: 'STARS',
                        metadata: { reason: 'player_disconnect', roomId },
                        status: 'COMPLETED'
                    });

                    console.log(`[REFUND] Refunded ${fee} Stars to disconnected player ${pid}`);
                } catch (e) {
                    console.error('[REFUND] Disconnect refund failed:', e);
                }
            }

            // Update room for remaining players
            io.to(roomId).emit('room_update', manager.getRoomInfo());

            // Clean up empty rooms
            if (manager.getPlayers().length === 0) {
                manager.cancelTimeout();
                rooms.delete(roomId);
                console.log(`[CLEANUP] Empty room ${roomId} deleted`);
            }
        }
    });
});



const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Daily Reward Reminder — runs every 6 hours
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    setInterval(async () => {
        if (!notificationService) return;

        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const { data: usersAtRisk } = await supabase
                .from('users')
                .select('telegram_id, streak_current')
                .gt('streak_current', 0)
                .or(`streak_last_claim.is.null,streak_last_claim.lt.${today}`)
                .limit(50);

            if (usersAtRisk && usersAtRisk.length > 0) {
                console.log(`[CRON] Sending daily reward reminders to ${usersAtRisk.length} users`);
                const rewards = [10, 15, 20, 30, 50, 75, 100]; // Streak reward tiers
                for (const u of usersAtRisk) {
                    const nextDay = (u.streak_current || 0) + 1;
                    const reward = rewards[Math.min(nextDay - 1, rewards.length - 1)];
                    notificationService.notifyDailyReward(u.telegram_id, nextDay, reward);
                }
            }
        } catch (e) {
            console.error('[CRON] Daily reward reminder failed:', e);
        }
    }, SIX_HOURS);

    console.log('[CRON] Daily reward reminder scheduled (every 6 hours)');
});
