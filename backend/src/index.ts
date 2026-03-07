import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import dns from 'dns';

// DNS resolution order simplified
// if (dns.setDefaultResultOrder) {
//    dns.setDefaultResultOrder('ipv4first');
// }

import { supabase } from './config/supabase';
import { getTonBalance } from './utils/tonBalance';
import { socketAuthMiddleware } from './middleware/auth';

import { GameManager } from './utils/GameManager';
import './bot'; // Initialize Bot
import { starsService, notificationService } from './bot';

dotenv.config();

const app = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://tg-quiz-master.vercel.app",
    "https://tgquizmaster.online"
];

const io = new Server(server, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.use(cors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
}));
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
            console.error('[DB] Supabase Connection Error:', error.message);
            console.error('[DB] Details:', error);
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

// -----------------------------------------------------------------------------
// Route Modules
// -----------------------------------------------------------------------------
import adminRoutes from './routes/admin';
import shopRoutes from './routes/shop';
import rewardsRoutes from './routes/rewards';
import gameRoutes from './routes/game';
import qpRoutes from './routes/qp';
import squadRoutes from './routes/squads';

app.use('/api/admin', adminRoutes);
app.use('/api', shopRoutes);      // /api/shop, /api/buy-powerup, /api/buy-pro, /api/create-payment-link
app.use('/api', rewardsRoutes);   // /api/daily-reward, /api/claim-daily, /api/quests, /api/claim-quest, /api/achievements
app.use('/api', gameRoutes);      // /api/leaderboard, /api/history, /api/withdraw, /api/settings, /api/bug-report
app.use('/api', qpRoutes);        // /api/qp-status, /api/claim-qp
app.use('/api', squadRoutes);     // /api/squads, /api/squad/:id, /api/squad/my, /api/squad/join, /api/squad/leave

// Referral Tier Thresholds
function calculateReferralTier(count: number): 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' {
    if (count >= 20) return 'GOLD';
    if (count >= 5) return 'SILVER';
    if (count >= 1) return 'BRONZE';
    return 'NONE';
}

// Game State (in-memory, shared with socket handlers below)
const rooms = new Map<string, GameManager>();
const socketPlayerMap = new Map<string, { roomId: string; playerId: string }>();

// Tournaments endpoint stays inline — it reads from the in-memory rooms map
app.get('/api/tournaments', (req, res) => {
    try {
        const activeRooms = Array.from(rooms.values()).map(mgr => mgr.getRoomInfo());
        res.json({ tournaments: activeRooms });
    } catch (error: any) {
        console.error('Tournaments API Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch tournaments' });
    }
});


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

/**
 * Shared helper to handle a player leaving a room (manual or disconnect).
 * Handles refunds, room_update emission, and empty room cleanup.
 */
async function handlePlayerExit(io: Server, socket: any, roomId: string, playerId: string) {
    const manager = rooms.get(roomId);
    if (!manager) return;

    // If game hasn't started, remove player and refund entry fee
    if (!manager.isStarted() && !manager.isExpired()) {
        const fee = manager.getEntryFee();
        const type = manager.getType();
        manager.removePlayer(playerId);

        console.log(`[EXIT] Player ${playerId} left room ${roomId} (fee: ${fee}, type: ${type})`);

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
                    metadata: { reason: 'player_exit', roomId },
                    status: 'COMPLETED'
                });

                console.log(`[REFUND] Refunded ${fee} Stars to player ${pid}`);

                // Instant UI update for the player
                if (userData) {
                    socket.emit('balance_update', { stars: (userData.balance_stars || 0) + fee });
                }
            } catch (e) {
                console.error('[REFUND] Exit refund failed:', e);
            }
        }

        // Update room for remaining players
        io.to(roomId).emit('room_update', {
            ...manager.getRoomInfo(),
            players: manager.getPlayers()
        });

        // Clean up empty rooms
        if (manager.getPlayers().length === 0) {
            manager.cancelTimeout();
            rooms.delete(roomId);
            console.log(`[CLEANUP] Empty room ${roomId} deleted`);
        }
    }
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', async (data) => {
        const { username, avatar, telegramId, tournamentId, entryFee, currency, category } = data;
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

            // 3. Matchmaking & Room Selection
            let roomId: string | undefined;

            if (data.roomType === 'practice') {
                // ... (Keep practice logic mostly same but ensure set is early)
                if ((user.daily_games_today || 0) >= 10) {
                    socket.emit('error', { message: 'Daily limit reached! Come back tomorrow.' });
                    return;
                }

                roomId = crypto.randomUUID();
                const mgr = new GameManager(roomId, io, 'practice', 0, 0, 5, category || 'General');

                mgr.onGameOver = (finishedRoomId) => {
                    rooms.delete(finishedRoomId);
                    console.log(`[CLEANUP] Practice room ${finishedRoomId} deleted`);
                };

                rooms.set(roomId, mgr); // Set immediately

                mgr.addPlayer({ id: userId.toString(), username, avatar, score: 0 });
                await socket.join(roomId);
                socketPlayerMap.set(socket.id, { roomId, playerId: userId.toString() });

                await supabase.from('users').update({ daily_games_today: (user.daily_games_today || 0) + 1 }).eq('telegram_id', userId);
                socket.emit('balance_update', { dailyGamesToday: (user.daily_games_today || 0) + 1 });
                socket.emit('room_update', { ...mgr.getRoomInfo(), players: mgr.getPlayers() });

                setTimeout(() => {
                    socket.emit('game_start');
                    mgr.start();
                }, 800);
                return;
            }

            // 3. Matchmaking & Room Selection (Atomic Block - no awaits until room is secured)
            let requestedMax = data.maxPlayers ? parseInt(data.maxPlayers) : 5;
            let effectiveFee = feeAmount;
            let effectiveCurrency = feeCurrency === 'TON' ? 'TON' : 'Stars';

            if (data.roomType === 'quickplay') {
                effectiveFee = 10;
                effectiveCurrency = 'Stars';
                if ((user.balance_stars || 0) < effectiveFee) {
                    socket.emit('error', { message: `Need 10 Stars for Quick Play` });
                    return;
                }
            }

            // Find existing room synchronously
            roomId = Array.from(rooms.keys()).find(id => {
                const mgr = rooms.get(id);
                if (!mgr) return false;
                const info = mgr.getRoomInfo();

                const matchesFee = Math.abs(info.entryFee - effectiveFee) < 0.01;
                const matchesCurrency = info.currency === effectiveCurrency;
                const matchesCategory = info.category === (category || 'General');
                const hasSpace = info.players < info.maxPlayers;
                const isWaiting = info.status === 'waiting';
                const matchesSize = (data.roomType === 'quickplay') || (info.maxPlayers === requestedMax);

                const isMatch = matchesFee && matchesCurrency && matchesCategory && hasSpace && isWaiting && matchesSize;
                if (!isMatch && info.category === (category || 'General') && matchesFee) {
                    console.log(`[MATCH-DEBUG] Room ${id} skipped: hasSpace=${hasSpace}, isWaiting=${isWaiting}, matchesSize=${matchesSize}`);
                }
                return isMatch;
            });

            if (!roomId) {
                roomId = crypto.randomUUID();
                const playersLimit = data.roomType === 'quickplay' ? 5 : Math.min(Math.max(requestedMax, 2), 20);
                const newManager = new GameManager(roomId, io, effectiveCurrency.toLowerCase() as any, 0, effectiveFee, playersLimit, category || 'General');

                // UNIFIED Handlers
                newManager.onExpire = async (mgr) => {
                    const info = mgr.getRoomInfo();
                    const players = mgr.getPlayers();
                    console.log(`[EXPIRE] Room ${mgr.getRoomInfo().id} expired. Refunding ${players.length} players.`);
                    for (const p of players) {
                        try {
                            const pid = parseInt(p.id);
                            const { data: u } = await supabase.from('users').select('balance_stars').eq('telegram_id', pid).single();
                            if (u) {
                                await supabase.from('users').update({ balance_stars: (u.balance_stars || 0) + info.entryFee }).eq('telegram_id', pid);
                                io.to(p.id).emit('balance_update', { stars: (u.balance_stars || 0) + info.entryFee });
                            }
                        } catch (e) { console.error('Expire refund error:', e); }
                    }
                    rooms.delete(mgr.getRoomInfo().id);
                };

                newManager.onGameOver = (finishedRoomId) => {
                    rooms.delete(finishedRoomId);
                    console.log(`[CLEANUP] Room ${finishedRoomId} deleted`);
                };

                rooms.set(roomId, newManager);
                console.log(`[CREATE] Room ${roomId} created for ${username} (Atomic)`);
            }

            const manager = rooms.get(roomId)!;

            // Reserve slot immediately to prevent race conditions
            manager.addPlayer({ id: userId.toString(), username, avatar, score: 0 });

            // 4. Database & Socket Joins (Awaits)
            try {
                if (effectiveFee > 0) {
                    const { error: updateError } = await supabase
                        .from('users')
                        .update({ balance_stars: user.balance_stars - effectiveFee })
                        .eq('telegram_id', userId);
                    if (updateError) throw updateError;
                    user.balance_stars -= effectiveFee;

                    await supabase.from('transactions').insert({
                        user_id: userId,
                        type: 'ENTRY_FEE',
                        amount: -effectiveFee,
                        currency: effectiveCurrency,
                        metadata: { roomId, mode: data.roomType },
                        status: 'COMPLETED'
                    });
                    console.log(`[FEE] Deducted ${effectiveFee} ${effectiveCurrency} from ${username}`);
                }

                await socket.join(roomId);
                socketPlayerMap.set(socket.id, { roomId, playerId: userId.toString() });

                // Notify everyone in the room
                const roomInfo = {
                    ...manager.getRoomInfo(),
                    players: manager.getPlayers()
                };
                io.to(roomId).emit('room_update', roomInfo);
                socket.emit('room_update', roomInfo); // Direct update for certainty

                // Start if full
                const info = manager.getRoomInfo();
                if (manager.getPlayers().length >= info.maxPlayers && !manager.isStarted()) {
                    console.log(`[START] Room ${roomId} full (${manager.getPlayers().length}/${info.maxPlayers}). Starting...`);
                    manager.recalculatePrizePool();

                    // FIX: Wait for questions to load BEFORE telling the client to start
                    await manager.start();
                    io.to(roomId).emit('game_start');
                } else if (manager.getPlayers().length === 1 && (info.type === 'stars' || info.type === 'ton')) {
                    // NEW: Notify other users about the new room (only for public Stars/TON rooms)
                    // We only do this when the FIRST player creates/joins to avoid spam
                    setTimeout(async () => {
                        try {
                            if (!notificationService) return;

                            // Fetch engaged users (those who play most)
                            const { data: activeUsers } = await supabase
                                .from('users')
                                .select('telegram_id')
                                .neq('telegram_id', userId)
                                .order('stats_total_games', { ascending: false })
                                .limit(50);

                            if (activeUsers && activeUsers.length > 0) {
                                console.log(`[NOTIFY] Broadcasting new room ${roomId} to ${activeUsers.length} users`);
                                for (const u of activeUsers) {
                                    notificationService.notifyRoomOpen(u.telegram_id, {
                                        roomId,
                                        entryFee: info.entryFee,
                                        currency: info.currency,
                                        playerCount: info.players,
                                        maxPlayers: info.maxPlayers
                                    });
                                    // Subtle delay to avoid rate limits
                                    await new Promise(r => setTimeout(r, 50));
                                }
                            }
                        } catch (e) {
                            console.error('[NOTIFY] Broadcast failed:', e);
                        }
                    }, 500);
                }
            } catch (err) {
                console.error(`[JOIN-ERROR] Failed to finalize join for room ${roomId}:`, err);
                manager.removePlayer(userId.toString());
                if (manager.getPlayers().length === 0) {
                    rooms.delete(roomId);
                    console.log(`[CLEANUP] Deleted empty room ${roomId} after join error`);
                }
                socket.emit('error', { message: 'Failed to join room' });
            }

        } catch (error) {
            console.error('Join Room Error:', error);
            socket.emit('error', { message: 'Failed to join room' });
        }
    });

    socket.on('submit_answer', (answer) => {
        // Find which room and player this socket is in
        const mapping = socketPlayerMap.get(socket.id);
        if (mapping && mapping.roomId) {
            rooms.get(mapping.roomId)?.submitAnswer(mapping.playerId, answer);
        }
    });

    // Power-Up Usage
    socket.on('use_powerup', async (powerUpId: string) => {
        const roomId = Array.from(socket.rooms).find(r => rooms.has(r));
        if (!roomId) return socket.emit('powerup_result', { success: false, error: 'Not in a room' });

        const manager = rooms.get(roomId);
        if (!manager) return socket.emit('powerup_result', { success: false, error: 'Room not found' });

        // Check user inventory in DB
        try {
            const mapping = socketPlayerMap.get(socket.id);
            if (!mapping) return socket.emit('powerup_result', { success: false, error: 'Player not mapped' });

            const userId = parseInt(mapping.playerId);
            const { data: user } = await supabase
                .from('users')
                .select('username, inventory, inventory_powerups, balance_stars')
                .eq('telegram_id', userId)
                .single();

            if (!user) return socket.emit('powerup_result', { success: false, error: 'User not found' });

            // Use the power-up in the game first
            const result = manager.usePowerUp(mapping.playerId, powerUpId);
            if (!result.success) {
                return socket.emit('powerup_result', result);
            }

            // Deduct from inventory in DB (JSONB map)
            const currentItemCount = user.inventory_powerups?.[powerUpId] || 0;
            if (currentItemCount <= 0) {
                // Check legacy inventory array as fallback
                const invArr: string[] = user.inventory || [];
                const puIndex = invArr.indexOf(powerUpId);
                if (puIndex === -1) {
                    return socket.emit('powerup_result', { success: false, error: 'Power-up not in inventory' });
                }
                const updatedInv = [...invArr];
                updatedInv.splice(puIndex, 1);
                await supabase.from('users').update({ inventory: updatedInv }).eq('telegram_id', userId);
            } else {
                const newInvMap = { ...user.inventory_powerups };
                newInvMap[powerUpId] = currentItemCount - 1;
                await supabase.from('users').update({ inventory_powerups: newInvMap }).eq('telegram_id', userId);
                socket.emit('balance_update', { inventoryPowerups: newInvMap });
            }

            // Emit result to the player
            socket.emit('powerup_result', result);
            // Notify the room about the power-up usage
            io.to(roomId).emit('powerup_used', { playerId: mapping.playerId, powerUpId, playerName: user.username || mapping.playerId });

            console.log(`[POWERUP] Player ${mapping.playerId} used ${powerUpId} in room ${roomId}`);
        } catch (e) {
            console.error('Power-up error:', e);
            socket.emit('powerup_result', { success: false, error: 'Server error' });
        }
    });

    socket.on('leave_room', async () => {
        const mapping = socketPlayerMap.get(socket.id);
        if (!mapping) return;

        const { roomId, playerId } = mapping;
        socketPlayerMap.delete(socket.id);
        socket.leave(roomId);

        await handlePlayerExit(io, socket, roomId, playerId);
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
                        isAdmin: (process.env.ADMIN_IDS || '').split(',').map(id => id.trim()).includes(userId.toString()),
                        referralCount: 0,
                        referralEarnings: 0,
                        referralTier: 'NONE',
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

        let user: any;
        try {
            user = await fetchPromise;
            if (!user) {
                console.error(`[SYNC] No user data returned for ${userId}`);
                return;
            }

            // DAILY RESET CHECK
            const today = new Date().toISOString().split('T')[0];
            if (user.daily_reset_date !== today) {
                console.log(`[SYNC] Resetting daily limits for user ${userId} (${today})`);
                const { data: updatedUser, error: resetError } = await supabase
                    .from('users')
                    .update({
                        daily_games_today: 0,
                        daily_wins_today: 0,
                        daily_reset_date: today
                    })
                    .eq('telegram_id', userId)
                    .select()
                    .single();

                if (!resetError && updatedUser) {
                    user = updatedUser;
                }
            }
        } catch (error: any) {
            console.warn(`[SYNC-WARN] All retries failed for user ${userId}: ${error.message?.substring(0, 100)}`);
            return;
        }

        // Fetch live TON balance from blockchain if wallet is connected (Async / Non-blocking)
        let cachedTonBalance = user.balance_ton || 0; // Use DB value if available

        if (user.wallet_address) {
            // Background fetch
            getTonBalance(user.wallet_address).then(async (liveBalance) => {
                if (liveBalance !== cachedTonBalance) {
                    // Update DB
                    await supabase.from('users').update({ balance_ton: liveBalance }).eq('telegram_id', userId);

                    // Emit update
                    socket.emit('balance_update', {
                        ton: liveBalance,
                        stars: user.balance_stars,
                        balanceQP: user.balance_qp || 0
                    });
                    console.log(`[SYNC] Updated live TON balance for ${userId}: ${liveBalance}`);
                }
            }).catch(err => console.error(`[SYNC] Background balance check failed for ${userId}`, err));
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

        // Calculate and persist referral tier
        const referralTier = calculateReferralTier(referralCount);
        if (user.referral_tier !== referralTier) {
            try {
                await supabase.from('users').update({ referral_tier: referralTier }).eq('telegram_id', userId);
                console.log(`[REFERRAL] User ${userId} tier updated: ${user.referral_tier} → ${referralTier}`);
            } catch (e) {
                console.error('[SYNC] Failed to update referral tier:', e);
            }
        }

        try {
            // Fetch Earnings
            const { data: earningsData } = await supabase
                .from('transactions')
                .select('amount, metadata, created_at')
                .eq('user_id', userId)
                .or('type.eq.REFERRAL_BONUS,type.eq.REFERRAL_REWARD');
            referralEarnings = (earningsData || []).reduce((sum, tx) => sum + tx.amount, 0);
        } catch (e) {
            console.error('[SYNC] Failed to fetch referral earnings:', e);
        }

        // Map referrals
        const recentReferrals = (referrals || []).map(ref => ({
            username: ref.username,
            date: ref.created_at,
            earned: "+50 Stars"
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
            ton: cachedTonBalance, // Instant return
            xp: user.stats_xp || 0,
            wins: user.stats_wins || 0,
            totalGames: user.stats_total_games || 0,
            balanceQP: user.balance_qp || 0,
            walletConnected: !!user.wallet_address,
            walletAddress: user.wallet_address,
            isAdmin: (process.env.ADMIN_IDS || '').split(',').map(id => id.trim()).includes(userId.toString()),
            referralCount: user.stats_referrals || 0, // Use stored DB column
            referralEarnings: referralEarnings,
            referralTier: calculateReferralTier(user.stats_referrals || 0),
            recentReferrals,
            recentTransactions,
            dailyGamesToday: user.daily_games_today || 0,
            inventoryPowerups: user.inventory_powerups || {},
            unlockedAvatars: user.unlocked_avatars || []
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

                // Emit full sync to update frontend immediately with all data
                socket.emit('profile_synced', {
                    stars: updatedUser.balance_stars,
                    ton: liveTonBalance,
                    xp: updatedUser.stats_xp || 0,
                    wins: updatedUser.stats_wins || 0,
                    totalGames: updatedUser.stats_total_games || 0,
                    balanceQP: updatedUser.balance_qp || 0,
                    walletConnected: !!updatedUser.wallet_address,
                    walletAddress: updatedUser.wallet_address,
                    referralCount: 0,
                    referralEarnings: 0,
                    referralTier: updatedUser.referral_tier || 'NONE',
                    recentReferrals: [],
                    recentTransactions: []
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

        await handlePlayerExit(io, socket, roomId, playerId);
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
