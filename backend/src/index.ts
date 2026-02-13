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
                const mgr = new GameManager(roomId, io, 'practice', 0);
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
                // Check if room is open AND matches the currency type (simplified logic)
                return mgr && mgr.getPlayers().length < 5;
            });

            if (!roomId) {
                roomId = crypto.randomUUID();
                // Determine prize pool based on entry fee or default
                const pool = feeAmount * 5 * 0.9; // Simple pool logic
                rooms.set(roomId, new GameManager(roomId, io, feeCurrency === 'TON' ? 'ton' : 'stars', pool));
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
        const userId = telegramId ? parseInt(telegramId) : 0;
        if (!userId) return;

        try {
            let { data: user, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', userId)
                .single();

            if (fetchError && fetchError.code === 'PGRST116') {
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

            socket.emit('profile_synced', {
                stars: user.balance_stars,
                ton: user.balance_ton,
                xp: user.stats_xp || 0,
                wins: user.stats_wins || 0,
                totalGames: user.stats_total_games || 0
            });
        } catch (error) {
            console.error('Sync Profile Error:', error);
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
