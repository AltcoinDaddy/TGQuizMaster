import dotenv from 'dotenv';
dotenv.config({ override: true });

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
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
import { roomRegistry } from './utils/RoomRegistry';
import './bot'; // Initialize Bot
import { starsService, notificationService } from './bot';
import { RewardService } from './utils/RewardService';

// ─── Environment Verification ──────────────────────────────────────────
const IS_PROD = process.env.NODE_ENV === 'production';
console.log(`[INIT] Running in ${IS_PROD ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);

const app = express();
app.set('trust proxy', 1); // Trust first proxy (e.g. Vercel, Nginx)
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://192.168.12.13:5173",
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

// Initialize RoomRegistry with Socket.IO instance
roomRegistry.setIO(io);

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
import seasonRoutes from './routes/seasons';

app.use('/api/admin', adminRoutes);
app.use('/api', shopRoutes);      // /api/shop, /api/buy-powerup, /api/buy-pro, /api/create-payment-link
app.use('/api', rewardsRoutes);   // /api/daily-reward, /api/claim-daily, /api/quests, /api/claim-quest, /api/achievements
app.use('/api', gameRoutes);      // /api/leaderboard, /api/history, /api/withdraw, /api/settings, /api/bug-report
app.use('/api', qpRoutes);        // /api/qp-status, /api/claim-qp
app.use('/api', squadRoutes);     // /api/squads, /api/squad/:id, /api/squad/my, /api/squad/join, /api/squad/leave
app.use('/api/tournament-season', seasonRoutes);

// Referral Tier Thresholds
function calculateReferralTier(count: number): 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD' {
    if (count >= 20) return 'GOLD';
    if (count >= 5) return 'SILVER';
    if (count >= 1) return 'BRONZE';
    return 'NONE';
}

// Game State (in-memory, shared with socket handlers below)
const socketPlayerMap = new Map<string, { roomId: string; playerId: string, paidFee: number, currency: string }>();

// Tournaments endpoint stays inline — it reads from the in-memory rooms map
app.get('/api/tournaments', (req, res) => {
    try {
        const activeRooms = roomRegistry.getAllRooms().map(mgr => mgr.getRoomInfo());
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
async function handlePlayerExit(io: Server, socket: any, roomId: string, playerId: string, paidFee: number = 0, currency: string = 'STARS') {
    const manager = roomRegistry.getRoom(roomId);
    if (!manager) return;

    const removed = manager.removePlayer(playerId);
    if (!removed) return; // Already removed/refunded

    const type = manager.getType();

    console.log(`[EXIT] Player ${playerId} left room ${roomId} (paid: ${paidFee}, type: ${type})`);

    // Refund entry fee if it was a paid room AND user actually paid something
    if (paidFee > 0) {
        try {
            const pid = parseInt(playerId);
            const { data: userData } = await supabase
                .from('users')
                .select('balance_stars')
                .eq('telegram_id', pid)
                .single();

            if (userData) {
                await supabase.from('users')
                    .update({ balance_stars: (userData.balance_stars || 0) + paidFee })
                    .eq('telegram_id', pid);
            }

            await supabase.from('transactions').insert({
                user_id: pid,
                type: 'REFUND',
                amount: paidFee,
                currency: currency.toUpperCase(),
                metadata: { reason: 'player_exit', roomId },
                status: 'COMPLETED'
            });

            console.log(`[REFUND] Refunded ${paidFee} ${currency} to player ${pid}`);

            // Instant UI update for the player
            if (userData) {
                socket.emit('balance_update', { stars: (userData.balance_stars || 0) + paidFee });
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
        roomRegistry.deleteRoom(roomId);
        console.log(`[CLEANUP] Empty room ${roomId} deleted`);
    }
}
/**
 * Centralized User Sync Function
 * Ensures consistent data flow to the frontend across all sync events.
 */
async function syncUser(socket: any, telegramId: string, username: string) {
    const userId = parseInt(telegramId);
    if (!userId) return;

    // 1. In-flight deduplication: Reuse ongoing fetch if it started < 2s ago
    const existing = profileSyncInFlight.get(userId);
    const now = Date.now();
    if (existing && (now - existing.timestamp) < 2000) {
        console.log(`[SYNC] Reusing in-flight request for ${userId}`);
        const user = await existing.promise;
        // Proceed with the rest of the sync using the fetched user
    }

    try {
        const fetchPromise = fetchUserWithRetry(userId, username || 'Anon_Player');
        profileSyncInFlight.set(userId, { promise: fetchPromise, timestamp: now });
        
        let user = await fetchPromise;
        if (!user) throw new Error("User not found");

        // 2. DAILY RESET CHECK
        const today = new Date().toISOString().split('T')[0];
        if (user.daily_reset_date !== today) {
            console.log(`[SYNC] Resetting daily limits for user ${userId}`);
            const { data: updatedUser } = await supabase
                .from('users')
                .update({ daily_games_today: 0, daily_wins_today: 0, daily_reset_date: today })
                .eq('telegram_id', userId)
                .select().single();
            if (updatedUser) user = updatedUser;
        }

        // 3. Fetch TON Balance
        let tonBalance = 0;
        if (user.wallet_address) {
            try {
                tonBalance = await getTonBalance(user.wallet_address);
            } catch (e) {
                console.error(`[SYNC-TON] Failed for ${userId}:`, e);
            }
        }


        // 5. Fetch Recent Transactions & Referrals
        const [ { data: txs }, { data: earningsData } ] = await Promise.all([
            supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
            supabase.from('transactions').select('amount').eq('user_id', userId).or('type.eq.REFERRAL_BONUS,type.eq.REFERRAL_REWARD')
        ]);
        
        const referralEarnings = (earningsData || []).reduce((sum, tx) => sum + tx.amount, 0);
        const referralTier = calculateReferralTier(user.stats_referrals || 0);

        socket.emit('profile_synced', {
            stars: user.balance_stars,
            ton: tonBalance,
            xp: user.stats_xp || 0,
            wins: user.stats_wins || 0,
            totalGames: user.stats_total_games || 0,
            balanceQP: user.balance_qp || 0,
            walletConnected: !!user.wallet_address,
            walletAddress: user.wallet_address,
            isAdmin: (process.env.ADMIN_IDS || '').split(',').map(id => id.trim()).includes(userId.toString()),
            referralCount: user.stats_referrals || 0,
            referralEarnings,
            referralTier,
            recentTransactions: txs || [],
            dailyGamesToday: user.daily_games_today || 0,
            inventoryPowerups: user.inventory_powerups || {},
            unlockedAvatars: user.unlocked_avatars || []
        });


        console.log(`[SYNC-SUCCESS] User ${userId} synced.`);
    } catch (error) {
        console.error(`[SYNC-ERROR] Fail for ${userId}:`, error);
        socket.emit('error', { message: 'Failed to sync player data.' });
    }
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Unified helper to attach event handlers to a GameManager
    const attachRoomHandlers = (manager: GameManager) => {
        // Only attach if not already present or if we need to force update
        manager.onExpire = async (mgr) => {
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
            roomRegistry.deleteRoom(mgr.getRoomInfo().id);
        };

        manager.onGameOver = (finishedRoomId, results) => {
            const mgr = roomRegistry.getRoom(finishedRoomId);
            if (mgr && (mgr as any).groupId) {
                console.log(`[NOTIFY] Room ${finishedRoomId} finished. Posting stats to group ${(mgr as any).groupId}`);
                notificationService.notifyGroupResults(
                    (mgr as any).groupId,
                    (mgr as any).category || 'General',
                    results
                );
            }
            roomRegistry.deleteRoom(finishedRoomId);
            console.log(`[CLEANUP] Room ${finishedRoomId} deleted`);
        };
    };

    socket.on('join_room', async (data) => {
        const { username, avatar, telegramId, tournamentId, entryFee, currency, category, isGroup } = data;
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
                    console.log(`[AUTH] Created new user: ${username} (${userId})`);
                }
            } else if (fetchError) {
                console.error(`[AUTH-ERROR] Fetch failed for ${userId}:`, fetchError);
                throw fetchError;
            }

            if (!user) {
                console.error(`[JOIN-ERROR] No user found/created for ${userId}`);
                socket.emit('error', { message: 'Authentication failed. Please restart the app.' });
                return;
            }

            // 2. Entry Fee Check
            let feeAmount = 0;
            let feeCurrency = 'STARS';

            if (entryFee && entryFee !== 'Free') {
                if (typeof entryFee === 'number') {
                    feeAmount = entryFee;
                    feeCurrency = currency?.toUpperCase() || 'STARS';
                } else {
                    const parts = String(entryFee).split(' ');
                    feeAmount = parseInt(parts[0]) || 0;
                    if (parts[1]) feeCurrency = parts[1].toUpperCase();
                    else if (currency) feeCurrency = currency.toUpperCase();
                }

                if (feeCurrency === 'STARS') {
                    if ((user.balance_stars || 0) < feeAmount) {
                        socket.emit('error', { message: 'Insufficient Stars balance' });
                        return;
                    }
                } else if (feeCurrency === 'TON') {
                    socket.emit('error', { message: 'TON tournaments coming soon' });
                    return;
                }
                console.log(`[PRE-CHECK] ${username} has sufficient ${feeAmount} ${feeCurrency}`);
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

                attachRoomHandlers(mgr);
                roomRegistry.setRoom(roomId, mgr); // Set immediately

                mgr.addPlayer({ id: userId.toString(), username, avatar, score: 0 });
                await socket.join(roomId);
                socketPlayerMap.set(socket.id, { roomId, playerId: userId.toString(), paidFee: 0, currency: 'STARS' });

                await supabase.from('users').update({ daily_games_today: (user.daily_games_today || 0) + 1 }).eq('telegram_id', userId);
                socket.emit('balance_update', { dailyGamesToday: (user.daily_games_today || 0) + 1 });
                socket.emit('room_update', { ...mgr.getRoomInfo(), players: mgr.getPlayers() });

                setTimeout(() => {
                    socket.emit('game_start');
                    mgr.start();
                }, 800);
                return;
            }

            // Mega Tournament Specific Matchmaking
            if (data.roomType === 'mega') {
                const { data: activeSeason } = await supabase
                    .from('tournament_seasons')
                    .select('id')
                    .eq('status', 'active')
                    .single();

                if (!activeSeason) {
                    socket.emit('error', { message: 'No active tournament season found.' });
                    return;
                }
            }

            // 3. Matchmaking & Room Selection (Atomic Block)
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
            } else if (data.roomType === 'mega') {
                effectiveFee = 50; // High stakes for Mega Match
                effectiveCurrency = 'Stars';
                requestedMax = 10;  // Bigger rooms for "Epic" feel
                if ((user.balance_stars || 0) < effectiveFee) {
                    socket.emit('error', { message: `Need 50 Stars for Mega Match` });
                    return;
                }
            }

            // EXTRACT ROOM ID FROM tournamentId (handle room_UUID_... format)
            let searchRoomId: string | undefined = tournamentId;
            if (tournamentId && tournamentId.startsWith('room_')) {
                const parts = tournamentId.split('_');
                searchRoomId = parts[1]; // room_UUID_... -> parts[1] is UUID
            }

            // Find existing room synchronously
            const matchedRoom = roomRegistry.getAllRooms().find(mgr => {
                const info = mgr.getRoomInfo();
                const id = info.id;

                // PRIORITY: If a specific tournamentId was requested, only match THAT ID
                if (searchRoomId) {
                    return id === searchRoomId && info.status === 'waiting' && info.players < info.maxPlayers;
                }

                const matchesFee = Math.abs(info.entryFee - effectiveFee) < 0.01;
                const matchesCurrency = info.currency === effectiveCurrency;
                const matchesCategory = info.category === (category || 'General');
                const hasSpace = info.players < info.maxPlayers;
                const isWaiting = info.status === 'waiting';
                const matchesType = (mgr as any).megaRoom === (data.roomType === 'mega');

                // Special: Mega matches can be joined even if LIVE (to feel like one ongoing room)
                if (data.roomType === 'mega' && matchesType && hasSpace) {
                    return true;
                }

                return matchesFee && matchesCurrency && matchesCategory && hasSpace && isWaiting && matchesType;
            });

            if (matchedRoom) {
                roomId = matchedRoom.getRoomInfo().id;
            }

            if (!roomId) {
                const newRoomId = searchRoomId && searchRoomId.length > 20 ? searchRoomId : crypto.randomUUID();
                roomId = newRoomId;
                const isMega = data.roomType === 'mega';
                const playersLimit = isMega ? 100 : (data.roomType === 'quickplay' ? 5 : Math.min(Math.max(requestedMax, 2), 20));
                const newManager = new GameManager(newRoomId, io, effectiveCurrency.toLowerCase() as any, 0, effectiveFee, playersLimit, category || 'General', isMega);

                // If joining from a group deep link or specific link, mark as private to prevent global notifications
                if (isGroup || (tournamentId && tournamentId.startsWith('room_'))) {
                    (newManager as any).groupId = isGroup ? 'pending_via_group' : 'private_link';
                    console.log(`[CREATE] Marking new room ${newRoomId} as PRIVATE (groupId: ${(newManager as any).groupId})`);
                }

                if (isMega) {
                    (newManager as any).megaRoom = true;
                    // Auto-start Mega Room in 5 seconds
                    setTimeout(async () => {
                        const m = roomRegistry.getRoom(newRoomId);
                        if (m && !m.isStarted()) {
                            console.log(`[MEGA-AUTOSTART] Starting room ${newRoomId}`);
                            io.to(newRoomId).emit('game_start');
                            await m.start().catch(e => console.error("Mega auto-start failed:", e));
                        }
                    }, 5000);
                }


                roomRegistry.setRoom(roomId, newManager);
                console.log(`[CREATE] Room ${roomId} created for ${username} (Atomic) (tournamentId: ${tournamentId}, type: ${data.roomType})`);
            }

            const manager = roomRegistry.getRoom(roomId)!;

            // Diagnostic log
            console.log(`[JOIN] User ${username} joining room ${roomId}. isGroup: ${isGroup}, tournamentId: ${tournamentId}, currentGroupId: ${(manager as any).groupId}`);

            // Ensure groupId is marked if this is a group join or via link
            if (isGroup && !(manager as any).groupId) {
                (manager as any).groupId = 'pending_via_link';
            }

            // CRITICAL: Ensure handlers are attached (even if room was created by bot)
            attachRoomHandlers(manager);

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
                        metadata: { roomId, mode: data.roomType, track: data.track },
                        status: 'COMPLETED'
                    });
                }

                await socket.join(roomId);
                socketPlayerMap.set(socket.id, {
                    roomId,
                    playerId: userId.toString(),
                    paidFee: effectiveFee,
                    currency: effectiveCurrency
                });

                // Notify everyone in the room
                const roomInfo = {
                    ...manager.getRoomInfo(),
                    players: manager.getPlayers()
                };
                io.to(roomId).emit('room_update', roomInfo);
                socket.emit('room_update', roomInfo); // Direct update for certainty

                // If joining a LIVE room (Mega match), send current state
                if (manager.isStarted() && (manager as any).megaRoom) {
                    console.log(`[MID-JOIN] ${username} joined LIVE Mega room ${roomId}. Sending current state...`);
                    const mgrInfo: any = manager.getRoomInfo();
                    if (mgrInfo.currentQuestion) {
                        socket.emit('game_start'); // Ensure UI switches to playing
                        socket.emit('new_question', {
                            question: mgrInfo.currentQuestion,
                            index: mgrInfo.currentIndex,
                            total: mgrInfo.totalQuestions
                        });
                        socket.emit('timer_update', mgrInfo.timeLeft);
                    }
                }

                // Start if full (non-mega)
                const info = manager.getRoomInfo();
                const isPrivateJoin = !!tournamentId || isGroup || !!(manager as any).groupId || (data.roomType !== 'quickplay' && data.roomType !== 'public' && data.roomType !== undefined);
                console.log(`[JOIN-DECISION] User: ${username}, Room: ${roomId}, Players: ${manager.getPlayers().length}, isPrivate: ${isPrivateJoin} (roomType: ${data.roomType}, tId: ${tournamentId}, isGroup: ${isGroup}, mgrGrp: ${(manager as any).groupId})`);

                if (manager.getPlayers().length >= info.maxPlayers && !manager.isStarted()) {
                    console.log(`[START] Room ${roomId} full (${manager.getPlayers().length}/${info.maxPlayers}). Starting...`);
                    manager.recalculatePrizePool();
                    io.to(roomId).emit('game_start');
                    await manager.start();
                } else if (manager.getPlayers().length === 1 && (info.type === 'stars' || info.type === 'ton') && !isPrivateJoin) {
                    console.log(`[NOTIFY-PLAN] Room ${roomId} is public. Scheduling broadcast...`);
                    // NEW: Notify other users about the new room (ONLY for public Stars/TON rooms)
                    // We only do this when the FIRST player creates/joins to avoid spam
                    setTimeout(async () => {
                        try {
                            if (!notificationService) return;

                            // Double check condition inside timeout just in case
                            const currentMgr = roomRegistry.getRoom(roomId);
                            const isGroupOrStarted = (currentMgr as any)?.groupId || currentMgr?.isStarted();
                            console.log(`[NOTIFY-FINAL] Check for ${roomId}: isPrivate=${!!isGroupOrStarted}`);
                            if (!currentMgr || isGroupOrStarted) return;

                            console.log(`[NOTIFY-EXEC] Broadcasting new room ${roomId} to users...`);
                            // ...

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
                                        maxPlayers: info.maxPlayers,
                                        category: info.category
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
            } catch (err: any) {
                console.error(`[JOIN-ERROR] Failed to finalize join for room ${roomId}:`, err);
                manager.removePlayer(userId.toString());
                if (manager.getPlayers().length === 0) {
                    roomRegistry.deleteRoom(roomId);
                    console.log(`[CLEANUP] Deleted empty room ${roomId} after join error`);
                }
                socket.emit('error', { message: `Failed to join: ${err.message || 'Internal Error'}` });
            }

        } catch (error: any) {
            console.error('[JOIN-FATAL] Error in join_room handler:', error);
            socket.emit('error', { message: `Join Failed: ${error.message || 'Server Error'}` });
        }
    });

    socket.on('submit_answer', (answer) => {
        // Find which room and player this socket is in
        const mapping = socketPlayerMap.get(socket.id);
        if (mapping && mapping.roomId) {
            roomRegistry.getRoom(mapping.roomId)?.submitAnswer(mapping.playerId, answer);
        }
    });

    // Power-Up Usage
    socket.on('use_powerup', async (powerUpId: string) => {
        const roomId = Array.from(socket.rooms).find(r => roomRegistry.getRoom(r));
        if (!roomId) return socket.emit('powerup_result', { success: false, error: 'Not in a room' });

        const manager = roomRegistry.getRoom(roomId);
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

        const { roomId, playerId, paidFee, currency } = mapping;
        socketPlayerMap.delete(socket.id);
        socket.leave(roomId);

        await handlePlayerExit(io, socket, roomId, playerId, paidFee, currency);
    });

    socket.on('sync_profile', async (data) => {
        await syncUser(socket, data.telegramId, data.username);
    });

    socket.on('update_wallet', async (data) => {
        const { telegramId, walletAddress } = data;
        const userId = parseInt(telegramId);
        console.log(`[WALLET] Received update_wallet for ${telegramId}: ${walletAddress}`);

        try {
            // Clear in-flight sync to ensure next sync fetches fresh data
            profileSyncInFlight.delete(userId);

            await supabase
                .from('users')
                .update({ wallet_address: walletAddress })
                .eq('telegram_id', userId);

            await syncUser(socket, telegramId, '');
        } catch (e) {
            console.error('[WALLET] Sync Exception:', e);
        }
    });


    // ─── Lucky Spin (Gacha) ─────────────────────────────────────────
    socket.on('lucky_spin', async (data) => {
        const { telegramId, username } = data;
        const userId = parseInt(telegramId);
        console.log(`[LUCKY-SPIN] Spin requested by ${telegramId}`);

        try {
            // Ensure user exists (auto-register if missing)
            await fetchUserWithRetry(userId, username || 'Anon_Player');

            const result = await RewardService.performLuckySpin(userId);
            
            if (!result.success) {
                socket.emit('error', { message: result.error });
                return;
            }

            // Sync full profile after spin to ensure all balances reflect correctly
            const { data: user } = await supabase.from('users').select('*').eq('telegram_id', userId).single();
            
            socket.emit('lucky_spin_result', {
                ...result.data,
                newBalances: {
                    stars: user.balance_stars,
                    ton: 0, // TON balance handled separately
                    xp: user.stats_xp || 0,
                    qp: user.balance_qp || 0,
                    shards: user.inventory_shards || 0
                }
            });

            // Log the achievement if it's their first spin (Optional logic can be added here)
        } catch (e) {
            console.error('[LUCKY-SPIN] Exception:', e);
            socket.emit('error', { message: 'Failed to perform lucky spin.' });
        }
    });

    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);

        const mapping = socketPlayerMap.get(socket.id);
        if (!mapping) return;

        const { roomId, playerId, paidFee, currency } = mapping;
        socketPlayerMap.delete(socket.id);

        await handlePlayerExit(io, socket, roomId, playerId, paidFee, currency);
    });
});



const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server v1.0.1 [Fix-Applied-${new Date().toISOString()}] running on port ${PORT}`);

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
