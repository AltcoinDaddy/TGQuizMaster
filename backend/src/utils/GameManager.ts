import axios from 'axios';
import { decode } from 'html-entities';

export interface Player {
    id: string;
    username: string;
    avatar: string;
    score: number;
    usedPowerUps?: string[];   // Track which power-ups have been used this game
    doublePoints?: boolean;     // Flag for 2x score on next correct answer
    daily_games_today?: number; // Standardize for practice mode stats
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
}

// Level System
const LEVEL_THRESHOLDS = [
    { level: 1, xp: 0, title: 'Beginner' },
    { level: 2, xp: 100, title: 'Rookie' },
    { level: 3, xp: 300, title: 'Player' },
    { level: 4, xp: 600, title: 'Competitor' },
    { level: 5, xp: 1000, title: 'Expert' },
    { level: 6, xp: 1500, title: 'Master' },
    { level: 7, xp: 2500, title: 'Champion' },
    { level: 8, xp: 4000, title: 'Legend' },
    { level: 9, xp: 6000, title: 'Mythic' },
    { level: 10, xp: 10000, title: 'Immortal' },
];

function calculateLevel(xp: number): { level: number; title: string; nextXp: number } {
    let current = LEVEL_THRESHOLDS[0];
    for (const t of LEVEL_THRESHOLDS) {
        if (xp >= t.xp) current = t;
        else break;
    }
    const nextIdx = LEVEL_THRESHOLDS.findIndex(t => t.level === current.level) + 1;
    const nextXp = nextIdx < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[nextIdx].xp : current.xp;
    return { level: current.level, title: current.title, nextXp };
}

export class GameManager {
    private roomId: string;
    private players: Player[];
    private questions: Question[] = [];
    private currentIndex = 0;
    private timer = 15;
    private io: any;
    private tournamentType: 'free' | 'stars' | 'ton' | 'practice' = 'free';
    private prizePool = 0;
    private entryFee = 0;
    private questionCount = 10;
    private maxPlayers = 5;
    private rakePercentage = 0.10; // 10% platform cut
    private roomTimeout: NodeJS.Timeout | null = null;
    private expired = false;
    public onExpire?: (manager: GameManager) => void; // Callback for timeout

    constructor(roomId: string, io: any, type: 'free' | 'stars' | 'ton' | 'practice' = 'free', prize = 0, fee = 0, maxPlayers = 5) {
        this.roomId = roomId;
        this.players = [];
        this.io = io;
        this.tournamentType = type;
        this.prizePool = prize;
        this.entryFee = fee;
        this.maxPlayers = maxPlayers;
        this.questionCount = type === 'practice' ? 5 : 10;

        // Auto-expire rooms after 5 minutes if not filled (skip for practice — instant start)
        if (type !== 'practice') {
            this.roomTimeout = setTimeout(() => {
                if (this.currentIndex === 0 && this.players.length < this.maxPlayers) {
                    this.expired = true;
                    console.log(`[TIMEOUT] Room ${this.roomId} expired after 5 min (${this.players.length}/${this.maxPlayers} players)`);
                    this.io.to(this.roomId).emit('room_expired', {
                        message: 'Room closed — not enough players. Your entry fee has been refunded.',
                        refunded: true
                    });
                    if (this.onExpire) this.onExpire(this);
                }
            }, 5 * 60 * 1000); // 5 minutes
        }
    }

    isExpired() {
        return this.expired;
    }

    cancelTimeout() {
        if (this.roomTimeout) {
            clearTimeout(this.roomTimeout);
            this.roomTimeout = null;
        }
    }

    addPlayer(player: Player) {
        const existingIndex = this.players.findIndex(p => p.id === player.id);
        if (existingIndex !== -1) {
            // Update existing player (e.g. socket reconnect)
            this.players[existingIndex] = player;
        } else {
            this.players.push(player);
        }
    }

    getPlayers() {
        return this.players;
    }

    removePlayer(playerId: string) {
        this.players = this.players.filter(p => p.id !== playerId);
    }

    getEntryFee() {
        return this.entryFee;
    }

    getType() {
        return this.tournamentType;
    }

    private started = false;

    isStarted() {
        return this.started;
    }

    getRoomInfo() {
        return {
            id: this.roomId,
            players: this.players.length,
            maxPlayers: this.maxPlayers,
            type: this.tournamentType,
            prizePool: this.prizePool,
            entryFee: this.entryFee,
            status: this.started ? 'live' : 'waiting',
            currency: this.tournamentType === 'stars' ? 'Stars' : 'TON'
        };
    }

    // Recalculate prize pool based on actual players who joined
    recalculatePrizePool() {
        if (this.tournamentType === 'practice' || this.tournamentType === 'free') return;
        const grossPool = this.entryFee * this.players.length;
        const rake = Math.floor(grossPool * this.rakePercentage);
        this.prizePool = grossPool - rake;
        console.log(`[RAKE] Room ${this.roomId}: Gross=${grossPool}, Rake=${rake} (${this.rakePercentage * 100}%), Net Prize=${this.prizePool}`);
    }

    async start() {
        if (this.started) return; // Prevent double-start
        this.started = true;

        this.cancelTimeout(); // Room filled — cancel the 5-min timeout
        console.log(`Match starting in room ${this.roomId} [Type: ${this.tournamentType}]`);
        await this.fetchQuestions();
        this.sendQuestion();
    }

    private async fetchQuestions() {
        try {
            const resp = await axios.get(`https://opentdb.com/api.php?amount=${this.questionCount}&type=multiple`);
            this.questions = resp.data.results.map((q: any, i: number) => ({
                id: i.toString(),
                text: decode(q.question),
                options: [...q.incorrect_answers.map((a: any) => decode(a)), decode(q.correct_answer)].sort(() => Math.random() - 0.5),
                correctAnswer: decode(q.correct_answer)
            }));
        } catch (e) {
            console.error('Failed to fetch questions:', e);
            // Fallback to mock
            this.questions = [
                { id: '1', text: "Which consensus mechanism does Ethereum now use?", options: ["PoW", "PoS", "PoA", "PoH"], correctAnswer: "PoS" },
                { id: '2', text: "What is the primary token of the TON network?", options: ["ETH", "SOL", "TON", "DOT"], correctAnswer: "TON" }
            ];
        }
    }

    private sendQuestion() {
        if (this.currentIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        const question = this.questions[this.currentIndex];
        this.io.to(this.roomId).emit('new_question', {
            question: {
                id: question.id,
                text: question.text,
                options: question.options
            },
            index: this.currentIndex,
            total: this.questions.length
        });

        this.startTimer();
    }

    private timerInterval: NodeJS.Timeout | null = null;

    private startTimer() {
        this.timer = 15;
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.io.to(this.roomId).emit('timer_update', this.timer);

            if (this.timer <= 0) {
                clearInterval(this.timerInterval!);
                this.timerInterval = null;
                this.revealAnswer();
            }
        }, 1000);
    }

    private revealAnswer() {
        const question = this.questions[this.currentIndex];
        this.io.to(this.roomId).emit('reveal_answer', question.correctAnswer);

        setTimeout(() => {
            this.currentIndex++;
            this.sendQuestion();
        }, 3000);
    }

    submitAnswer(playerId: string, answer: string) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        const question = this.questions[this.currentIndex];
        if (answer === question.correctAnswer) {
            let points = Math.max(50, this.timer * 6.6); // Fast answers get ~150 points
            if (player.doublePoints) {
                points *= 2;
                player.doublePoints = false; // Consume the power-up
            }
            player.score += Math.round(points);
        } else {
            // Wrong answer — clear double points if active
            player.doublePoints = false;
        }

        this.io.to(this.roomId).emit('score_update', this.players);
    }

    // Power-Up System
    usePowerUp(playerId: string, powerUpId: string): { success: boolean; error?: string; data?: any } {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return { success: false, error: 'Player not found' };
        if (!this.started || this.currentIndex >= this.questions.length) {
            return { success: false, error: 'Game not in progress' };
        }

        // Initialize tracking array
        if (!player.usedPowerUps) player.usedPowerUps = [];

        // Check if already used this power-up
        if (player.usedPowerUps.includes(powerUpId)) {
            return { success: false, error: 'Already used this power-up' };
        }

        player.usedPowerUps.push(powerUpId);

        switch (powerUpId) {
            case 'pu_5050': {
                const question = this.questions[this.currentIndex];
                const wrongAnswers = question.options.filter(o => o !== question.correctAnswer);
                // Pick 2 random wrong answers to eliminate
                const toRemove = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);
                return { success: true, data: { type: 'fifty_fifty', removed: toRemove } };
            }
            case 'pu_time': {
                this.timer += 10;
                this.io.to(this.roomId).emit('timer_update', this.timer);
                return { success: true, data: { type: 'extra_time', newTimer: this.timer } };
            }
            case 'pu_double': {
                player.doublePoints = true;
                return { success: true, data: { type: 'double_points' } };
            }
            default:
                return { success: false, error: 'Unknown power-up' };
        }
    }

    private async endGame() {
        const winners = [...this.players].sort((a, b) => b.score - a.score);

        // Calculate rake and net prize pool
        const grossPool = this.entryFee * this.players.length;
        const rake = (this.tournamentType === 'stars' || this.tournamentType === 'ton')
            ? Math.floor(grossPool * this.rakePercentage)
            : 0;
        const netPrize = grossPool - rake;

        // Distribution Logic (from net pool after rake)
        const distribution = {
            first: Math.floor(netPrize * 0.6),
            second: Math.floor(netPrize * 0.3),
            third: Math.floor(netPrize * 0.1)
        };

        const prizes = [distribution.first, distribution.second, distribution.third];
        const currency = this.tournamentType === 'stars' ? 'STARS' : 'TON';

        // Practice mode — give small rewards + update daily counters
        if (this.tournamentType === 'practice') {
            try {
                const { supabase } = await import('../config/supabase');

                for (const [index, player] of winners.entries()) {
                    if (!player.id) continue;
                    const userId = parseInt(player.id);

                    const { data: user } = await supabase
                        .from('users')
                        .select('balance_stars, stats_total_games, stats_wins, stats_xp, daily_games_today, daily_wins_today')
                        .eq('telegram_id', userId)
                        .single();

                    if (user) {
                        const isWinner = index === 0;
                        const starReward = isWinner ? 5 : 0;
                        const xpReward = isWinner ? 10 : 5;
                        const oldXp = user.stats_xp || 0;
                        const newXp = oldXp + xpReward;
                        const oldLevel = calculateLevel(oldXp);
                        const newLevel = calculateLevel(newXp);

                        const updates: any = {
                            balance_stars: (user.balance_stars || 0) + starReward,
                            stats_total_games: (user.stats_total_games || 0) + 1,
                            stats_wins: (user.stats_wins || 0) + (isWinner ? 1 : 0),
                            stats_xp: newXp,
                            stats_level: newLevel.level,
                            daily_games_today: (user.daily_games_today || 0) + 1,
                            daily_wins_today: (user.daily_wins_today || 0) + (isWinner ? 1 : 0)
                        };

                        // Update local player object for the game_over event
                        player.daily_games_today = updates.daily_games_today;

                        await supabase.from('users').update(updates).eq('telegram_id', userId);

                        // Emit level-up event if player leveled up
                        if (newLevel.level > oldLevel.level) {
                            this.io.to(this.roomId).emit('level_up', {
                                playerId: player.id,
                                level: newLevel.level,
                                title: newLevel.title,
                                nextXp: newLevel.nextXp,
                                currentXp: newXp
                            });
                            console.log(`[LEVEL UP] Player ${player.id} → Level ${newLevel.level} (${newLevel.title})`);
                        }
                    }
                }
            } catch (e) {
                console.error('Failed to save practice results:', e);
            }

            this.io.to(this.roomId).emit('game_over', {
                winners,
                prizes: { first: 5, second: 0, third: 0 },
                currency: 'Stars',
                isPractice: true,
                earnedRewards: {
                    stars: 5,
                    xp: 10
                },
                dailyStats: {
                    played: winners[0].daily_games_today || 1, // Use the updated value from the loop
                    limit: 20
                }
            });

            // Emit balance update so frontend refreshes immediately
            for (const player of winners) {
                if (!player.id) continue;
                const userId = parseInt(player.id);
                try {
                    const { supabase } = await import('../config/supabase'); // Re-import if not already in scope
                    const { data: freshUser } = await supabase.from('users')
                        .select('balance_stars, stats_xp')
                        .eq('telegram_id', userId)
                        .single();
                    if (freshUser) {
                        this.io.to(this.roomId).emit('balance_update', {
                            stars: freshUser.balance_stars,
                            xp: freshUser.stats_xp
                        });
                    }
                } catch (e) {
                    console.error(`Failed to emit balance_update for user ${userId} in practice mode:`, e);
                }
            }

            console.log(`Practice game over in ${this.roomId}. Winner: ${winners[0]?.username} (+5 Stars, +10 XP)`);

            // Fix: Ensure we clean up the room!
            if (this.onGameOver) this.onGameOver(this.roomId);
            return;
        }

        // 1. Create Tournament Record
        try {
            const { supabase } = await import('../config/supabase');
            const { data: tournamentRecord, error: tourError } = await supabase
                .from('tournaments')
                .insert({
                    title: `Room ${this.roomId}`,
                    status: 'finished',
                    prize_pool: netPrize,
                    currency,
                    entry_fee: this.entryFee,
                    start_time: new Date().toISOString(),
                    winners: winners.slice(0, 3).map((w, i) => ({
                        userId: w.id,
                        rank: i + 1,
                        prize: prizes[i] || 0
                    }))
                })
                .select()
                .single();

            if (tourError) throw tourError;
            console.log(`[DB] Tournament saved: ${tournamentRecord.id}`);

            // 2. Log Platform Rake as transaction
            if (rake > 0) {
                await supabase.from('transactions').insert({
                    user_id: 0, // Platform account
                    type: 'PLATFORM_RAKE',
                    amount: rake,
                    currency,
                    metadata: { tournamentId: tournamentRecord.id, grossPool, rakePercent: this.rakePercentage * 100 },
                    status: 'COMPLETED'
                });
                console.log(`[RAKE] Collected ${rake} ${currency} from tournament ${tournamentRecord.id}`);
            }

            // 2. Update Users and Create Transactions
            for (const [index, player] of winners.entries()) {
                const prize = prizes[index] || 0;
                if (!player.id) continue;

                const userId = parseInt(player.id); // Assuming ID is valid parsable int

                // Fetch User to get current stats
                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('telegram_id', userId)
                    .single();

                if (user && !userError) {
                    const oldXp = user.stats_xp || 0;
                    const newXp = oldXp + player.score;
                    const oldLevel = calculateLevel(oldXp);
                    const newLevel = calculateLevel(newXp);

                    // Prepare updates
                    const updates: any = {
                        stats_total_games: (user.stats_total_games || 0) + 1,
                        stats_xp: newXp,
                        stats_level: newLevel.level,
                        daily_games_today: (user.daily_games_today || 0) + 1
                    };
                    if (index === 0) {
                        updates.stats_wins = (user.stats_wins || 0) + 1;
                        updates.daily_wins_today = (user.daily_wins_today || 0) + 1;
                    }

                    if (prize > 0) {
                        if (currency === 'STARS') updates.balance_stars = (user.balance_stars || 0) + prize;
                        // TON prizes handled via smart contract (Phase 2)

                        // Log Transaction
                        await supabase.from('transactions').insert({
                            user_id: userId,
                            type: 'PRIZE',
                            amount: prize,
                            currency,
                            metadata: { tournamentId: tournamentRecord.id },
                            status: 'COMPLETED'
                        });
                    }

                    await supabase.from('users').update(updates).eq('telegram_id', userId);

                    // Emit level-up event if player leveled up
                    if (newLevel.level > oldLevel.level) {
                        this.io.to(this.roomId).emit('level_up', {
                            playerId: player.id,
                            level: newLevel.level,
                            title: newLevel.title,
                            nextXp: newLevel.nextXp,
                            currentXp: newXp
                        });
                        console.log(`[LEVEL UP] Player ${player.id} → Level ${newLevel.level} (${newLevel.title})`);
                    }
                }
            }

        } catch (error) {
            console.error('Failed to save game results to DB:', error);
        }

        console.log(`Game Over in ${this.roomId}. 1st: ${winners[0]?.username} wins ${distribution.first} ${this.tournamentType === 'stars' ? 'Stars' : 'TON'}`);

        // Emit balance update so frontend refreshes immediately
        for (const player of winners) {
            if (!player.id) continue;
            const userId = parseInt(player.id);
            try {
                const { supabase } = await import('../config/supabase');
                const { data: freshUser } = await supabase.from('users')
                    .select('balance_stars, balance_ton, stats_xp')
                    .eq('telegram_id', userId)
                    .single();
                if (freshUser) {
                    this.io.to(this.roomId).emit('balance_update', {
                        stars: freshUser.balance_stars,
                        ton: freshUser.balance_ton,
                        xp: freshUser.stats_xp
                    });
                }
            } catch (e) {
                console.error(`Failed to emit balance_update for user ${userId}:`, e);
            }
        }

        this.io.to(this.roomId).emit('game_over', {
            winners,
            prizes: distribution,
            currency: this.tournamentType === 'stars' ? 'Stars' : 'TON',
            roomId: this.roomId
        });

        // Notify index.ts to clean up this room
        if (this.onGameOver) this.onGameOver(this.roomId);
    }

    public onGameOver?: (roomId: string) => void;
}
