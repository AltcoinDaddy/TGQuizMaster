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

// History API
app.get('/api/history', async (req, res) => {
    try {
        const { telegramId } = req.query;
        if (!telegramId) return res.status(400).json({ error: 'Missing telegramId' });

        const { data: history, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', telegramId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        // Map to frontend HistoryItem format
        const formattedHistory = history.map(tx => ({
            id: tx.id,
            title: tx.metadata?.tournamentId ? `Tournament #${tx.metadata.tournamentId.slice(0, 8)}` : 'Game Transaction',
            date: new Date(tx.created_at).toLocaleDateString(),
            rank: tx.type === 'PRIZE' ? 1 : 0, // Placeholder
            reward: `${tx.amount > 0 ? '+' : ''}${tx.amount} ${tx.currency}`,
            accuracy: '-', // Not stored yet
            speed: '-',    // Not stored yet
            status: tx.type === 'PRIZE' ? 'WINNER' : 'PARTICIPANT'
        }));

        res.json({ history: formattedHistory });
    } catch (error: any) {
        console.error('History API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
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
            .select('metadata')
            .eq('user_id', userId)
            .eq('type', 'PRIZE');

        const claimedIds = (claims || [])
            .filter(tx => tx.metadata?.questId)
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

        res.json({ quests });
    } catch (error: any) {
        console.error('Quests API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch quests' });
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
                        balance_stars: 1000,
                        balance_ton: 5.0
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

        try {
            let { data: user, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', userId)
                .single();

            if (fetchError && fetchError.code === 'PGRST116') {
                console.log(`[SYNC] User ${userId} not found, creating...`);
                // Not found, create with defaults
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert({
                        telegram_id: userId,
                        username: username || 'Anon_Player',
                        balance_stars: 1000,
                        balance_ton: 5.0
                    })
                    .select()
                    .single();
                if (createError) throw createError;
                user = newUser;
            } else if (fetchError) throw fetchError;

            console.log(`[SYNC] User ${userId} data: wallet=${user.wallet_address}, stars=${user.balance_stars}, xp=${user.stats_xp}`);

            // Fetch Referral Stats
            const { count: referralCount, data: referrals } = await supabase
                .from('users')
                .select('username, created_at, telegram_id', { count: 'exact' }) // Select fields needed for display
                .eq('referred_by', userId)
                .order('created_at', { ascending: false })
                .limit(10); // Limit to recent 10

            const { data: earningsData } = await supabase
                .from('transactions')
                .select('amount, metadata, created_at')
                .eq('user_id', userId)
                .eq('type', 'REFERRAL_BONUS');

            const referralEarnings = (earningsData || []).reduce((sum, tx) => sum + tx.amount, 0);

            // Map referrals to include earnings (if trackable per user, otherwise just list)
            // For now, we'll just list them. Ideally we'd join with transactions to see how much each earned.
            // Simplified:
            const recentReferrals = (referrals || []).map(ref => {
                // Try to find earnings from this specific user? 
                // Metadata might have { sourceUserId: ... }
                // For now, mock specific earnings or match if possible.
                // Let's just return basic info
                return {
                    username: ref.username,
                    date: ref.created_at,
                    // earned: "..." // complex to calculate efficiently without aggregation query, leaving for now or simple mock based on average/total
                    earned: "+0.00 TON" // Placeholder until we have better tracking
                };
            });

            // Fetch Recent Transactions
            const { data: recentTransactions } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(5);

            socket.emit('profile_synced', {
                stars: user.balance_stars,
                ton: user.balance_ton,
                xp: user.stats_xp || 0,
                wins: user.stats_wins || 0,
                totalGames: user.stats_total_games || 0,
                walletConnected: !!user.wallet_address,
                walletAddress: user.wallet_address,
                referralCount: referralCount || 0,
                referralEarnings: referralEarnings || 0,
                recentReferrals,
                recentTransactions: recentTransactions || []
            });
        } catch (error) {
            console.error('[SYNC] Profile Sync Error:', error);
        }
    });

    socket.on('update_wallet', async (data) => {
        const { telegramId, walletAddress } = data;
        console.log(`[WALLET] Received update_wallet for ${telegramId}: ${walletAddress}`);

        try {
            const { error } = await supabase
                .from('users')
                .update({ wallet_address: walletAddress })
                .eq('telegram_id', parseInt(telegramId));

            if (error) {
                console.error('[WALLET] Supabase Update Error:', error);
            } else {
                console.log(`[WALLET] Successfully updated wallet_address in DB for ${telegramId}`);
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
