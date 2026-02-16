import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { supabase } from './config/supabase';

import { GameManager } from './utils/GameManager';
import './bot'; // Initialize Bot
import { starsService } from './bot';

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
        powerups: [
            { id: 'p1', title: '50/50 Pack', description: 'Eliminate 2 wrong answers', price: 100, currency: 'Stars', reward: 'x10 50/50', color: 'primary' },
            { id: 'p2', title: 'Shield Pack', description: 'Protect your streak', price: 150, currency: 'Stars', reward: 'x5 Shields', color: 'blue-400' }
        ],
        avatars: [
            { id: 'a1', title: 'Neon Glitch', description: 'Animated Frame', price: 500, currency: 'Stars', reward: 'NFT Avatar', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJoJylJGktSTFhUfJdOVEmw1ozWpc8h-K9YKXlf-076p2a28wUyRQsSP-KmOgeizOi6c0O-cwUscuyxcYta4Qzlvxpf3V28xTSdGezOsojgY8VIEGye61sAR2uLYZvYQRXKNYUIkMP-JJCz1Iml2rnlQo7abJGIeqgTvXexQxF8IgBOdVmztnQ1YZNckUP7xpHFv-FF4x94DyKxks98fDY6W2GefcpXnOCPdrIuz5gOaNscs3KJwpb48g4CYV-IPAUfYVhvWTh2OA', color: 'primary' },
            { id: 'a2', title: 'Cyber Master', description: 'Premium Identity', price: 750, currency: 'Stars', reward: 'Legendary', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPahSwwA2M4HVR_vLV-lILzXC7xQf0Nox1bVuLcsHHMHaNB0P3tMJvfGAQhR8bjUciAoIGO6E9seaasLxRgULaniBkCmuWpyaweimfuakUNq2fAldQAcHIaImzziiR_16iI4yzrB3lav7O12FjqznvenQ2Bh7I-6f8ZAbJDvQTpblSoiTPnuFmX11iPLcMbsHgsUBjNOm9xx_-uuFtqiOjfUgtxs_MXfi_1w781LIrxGzYltnxrPtJ3k1O_f0P1B8qBuyrWzvlPWs', color: 'accent-purple' },
            { id: 'a3', title: 'Quiz Crown', description: 'Legendary Icon', price: 1200, currency: 'Stars', reward: 'Mythic', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpxvQnPLgvRsdJag0ER3UXSPs0e4Hs_EXeQMs10qLZI63j4W69n5WSnHjbC2ZFM6SZUF6DEuscPqqvkdw6MGkdyMA1xGOT4FNal-D6FHvTJCZEwLNitNulAPX8nU76wCAuwGHfauWHdN3PFV_IQF_AGlus2_ahPcsfr1mYYcjDaN4BAWV9ciFrZnHSG9UyhQ9-jhGkmCVbisnuWHtUDYGpB3VhlaVf6onab2vnMA3l9Llngng8mUcB2hNgkxZcSfDn6ZMit_xobvc', color: 'accent-gold' }
        ]
    };
    res.json({ shopItems });
});

// Quests API
app.get('/api/quests', async (req, res) => {
    try {
        const { telegramId } = req.query;
        if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });

        const userId = parseInt(telegramId as string);

        // 1. Fetch User Stats
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();

        if (userError) throw userError;

        // 2. Fetch Referrals
        const { count: referralCount } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', userId);

        // 3. Fetch Claimed Quests (from transactions)
        const { data: claims } = await supabase
            .from('transactions')
            .select('metadata, created_at')
            .eq('user_id', userId)
            .eq('type', 'PRIZE'); // Assuming PRIZE is used for quest rewards as per claim-quest

        const claimedIds = (claims || [])
            .filter(tx => tx.metadata?.questId && tx.metadata?.type === 'QUEST_REWARD')
            .map(tx => tx.metadata.questId);

        // 4. Calculate Quests
        const quests = [
            {
                id: '1',
                title: 'Play 3 Free Quizzes',
                progress: Math.min(user.stats_total_games || 0, 3),
                total: 3,
                reward: '20 Stars',
                type: 'stars',
                status: claimedIds.includes('1') ? 'completed' : (user.stats_total_games >= 3 ? 'claimable' : 'in-progress')
            },
            {
                id: '2',
                title: 'Win a Tournament',
                progress: Math.min(user.stats_wins || 0, 1),
                total: 1,
                reward: '100 XP',
                type: 'xp',
                status: claimedIds.includes('2') ? 'completed' : (user.stats_wins >= 1 ? 'claimable' : 'in-progress')
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

        // 5. Calculate Weekly Milestone
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const weeklyClaims = (claims || []).filter(tx =>
            tx.metadata?.type === 'QUEST_REWARD' &&
            new Date(tx.created_at) > oneWeekAgo
        ).length;

        const weeklyMilestone = {
            current: weeklyClaims,
            target: 15, // Arbitrary target
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

        // 1. Check Balance
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', userId)
            .single();

        if (userError || !user) return res.status(404).json({ error: 'User not found' });

        if ((user.balance_ton || 0) < withdrawAmount) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        // 2. Create Pending Transaction
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

        // 3. Deduct Balance immediately (optimistic)
        const { error: updateError } = await supabase
            .from('users')
            .update({ balance_ton: user.balance_ton - withdrawAmount })
            .eq('telegram_id', userId);

        if (updateError) {
            // Rollback transaction if deduction fails? 
            // Ideally use a DB transaction or function
            console.error('Failed to deduct balance, potential inconsistency for user:', userId);
            return res.status(500).json({ error: 'Withdrawal failed during balance update' });
        }

        // 4. Notify Admin / Process on Blockchain (Mock for now)
        console.log(`[WITHDRAW] User ${userId} requested ${withdrawAmount} TON to ${address}`);

        res.json({ success: true, newBalance: user.balance_ton - withdrawAmount });

    } catch (error: any) {
        console.error('Withdrawals API Error:', error.message);
        res.status(500).json({ error: 'Failed to process withdrawal' });
    }
});

// Game State
const rooms = new Map<string, GameManager>();

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
                        balance_stars: 0,
                        balance_ton: 0.0
                    })
                    .select()
                    .single();

                if (createError) {
                    if (data.roomType === 'practice') {
                        console.warn("User creation failed, proceeding for practice mode.");
                        user = { telegram_id: userId, username, balance_stars: 0, balance_ton: 0 };
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
                    if ((user.balance_ton || 0) < feeAmount) {
                        socket.emit('error', { message: 'Insufficient TON balance' });
                        return;
                    }
                    // Deduct TON
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ balance_ton: user.balance_ton - feeAmount })
                        .eq('telegram_id', userId);
                    if (updateError) throw updateError;

                    user.balance_ton -= feeAmount;
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
                socket.emit('game_start'); // Instant start for practice
                mgr.start(); // Start questions
                return;
            }

            // Find a room matching the currency/type or create new
            roomId = Array.from(rooms.keys()).find(id => {
                const mgr = rooms.get(id);
                if (!mgr) return false;
                const info = mgr.getRoomInfo();
                return info.players < info.maxPlayers &&
                    info.status === 'waiting' &&
                    info.currency === (feeCurrency === 'TON' ? 'TON' : 'Stars') &&
                    Math.abs(info.entryFee - feeAmount) < 0.01; // Float safety
            });

            if (!roomId) {
                roomId = crypto.randomUUID();
                // Determine prize pool based on entry fee or default
                const pool = feeAmount * 5 * 0.9; // Simple pool logic
                rooms.set(roomId, new GameManager(roomId, io, feeCurrency === 'TON' ? 'ton' : 'stars', pool, feeAmount));
            }

            const manager = rooms.get(roomId)!;
            manager.addPlayer({
                id: userId.toString(),
                username,
                avatar,
                score: 0
            });

            socket.join(roomId);

            // Send updated user balance to client
            socket.emit('balance_update', {
                stars: user.balance_stars,
                ton: user.balance_ton
            });

            io.to(roomId).emit('room_update', {
                players: manager.getPlayers()
            });

            if (manager.getPlayers().length === 5) {
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

    socket.on('sync_profile', async (data) => {
        const { telegramId, username } = data;
        console.log(`[SYNC] Profile request for ${telegramId} (${username})`);
        const userId = telegramId ? parseInt(telegramId) : 0;
        if (!userId) return;

        let user;
        try {
            let { data: userData, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', userId)
                .single();

            user = userData;

            if (fetchError && fetchError.code === 'PGRST116') {
                console.log(`[SYNC] User ${userId} not found, creating...`);
                // Not found, create with defaults
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        telegram_id: userId,
                        username: username || 'Anon_Player',
                        balance_stars: 0,
                        balance_ton: 0.0
                    })
                    .select()
                    .single();
                if (createError) throw createError;
                user = newUser;
            } else if (fetchError) throw fetchError;



        } catch (error) {
            console.error('[SYNC] Profile Sync Initial Fetch Error:', error);
            return;
        }

        console.log(`[SYNC] User ${userId} data: wallet=${user.wallet_address}, stars=${user.balance_stars}, xp=${user.stats_xp}`);

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
            ton: user.balance_ton,
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

                // Emit sync to update frontend immediately
                // We reuse the same logic as sync_profile, or just send partial update
                // Sending partial for efficiency
                socket.emit('profile_synced', {
                    walletConnected: !!updatedUser.wallet_address,
                    walletAddress: updatedUser.wallet_address
                });
            }
        } catch (e) {
            console.error('[WALLET] Sync Exception:', e);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});



const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
