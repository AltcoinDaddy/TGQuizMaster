import axios from 'axios';
import { decode } from 'html-entities';
import { supabase } from '../config/supabase';

export interface Player {
    id: string;
    username: string;
    avatar: string;
    score: number;
    usedPowerUps?: string[];   // Track which power-ups have been used this game
    doublePoints?: boolean;     // Flag for 2x score on next correct answer
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
    private category: string;
    private categoryId: number | null = null;

    private readonly CATEGORY_MAP: Record<string, number> = {
        'General': 9,
        'Crypto': 18, // Science: Computers
        'Movies': 11,
        'Sports': 21,
        'Gaming': 15
    };

    constructor(roomId: string, io: any, type: 'free' | 'stars' | 'ton' | 'practice' = 'free', prize = 0, fee = 0, maxPlayers = 5, category = 'General') {
        this.roomId = roomId;
        this.players = [];
        this.io = io;
        this.tournamentType = type;
        this.prizePool = prize;
        this.entryFee = fee;
        this.maxPlayers = maxPlayers;
        this.category = category;
        this.categoryId = this.CATEGORY_MAP[category] || null;
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
        // Only use cache for General category
        if (!this.categoryId || this.categoryId === 9) {
            try {
                const { questionCache } = await import('./QuestionCache');
                const cached = await questionCache.getQuestions(this.questionCount);
                if (cached.length >= this.questionCount) {
                    this.questions = cached;
                    console.log(`[GAME] Loaded ${cached.length} questions from cache (pool: ${questionCache.size} remaining)`);
                    return;
                }
            } catch (e) {
                console.error('[GAME] Cache fetch failed, trying API directly:', e);
            }
        }

        // Fetch from API (either specific category or cache/fallback)
        try {
            const url = this.categoryId
                ? `https://opentdb.com/api.php?amount=${this.questionCount}&category=${this.categoryId}&type=multiple`
                : `https://opentdb.com/api.php?amount=${this.questionCount}&type=multiple`;

            console.log(`[GAME] Fetching questions from: ${url}`);
            const resp = await axios.get(url);

            if (resp.data.results && resp.data.results.length > 0) {
                this.questions = resp.data.results.map((q: any, i: number) => ({
                    id: `q_${Date.now()}_${i}`,
                    text: decode(q.question),
                    options: [...q.incorrect_answers.map((a: any) => decode(a)), decode(q.correct_answer)].sort(() => Math.random() - 0.5),
                    correctAnswer: decode(q.correct_answer)
                }));
                console.log(`[GAME] Successfully fetched ${this.questions.length} questions for category ${this.category}`);
                return;
            }
        } catch (e) {
            console.error('Failed to fetch questions:', e);
        }

        // Fallback: static crypto/tech questions if everything fails
        this.questions = [
            { id: 'f1', text: "Which consensus mechanism does Ethereum now use?", options: ["Proof of Work", "Proof of Stake", "Proof of History", "Proof of Authority"], correctAnswer: "Proof of Stake" },
            { id: 'f2', text: "What is the primary token of the TON network?", options: ["ETH", "SOL", "TON", "DOT"], correctAnswer: "TON" },
            { id: 'f3', text: "Who is the founder of Telegram?", options: ["Pavel Durov", "Mark Zuckerberg", "Jack Dorsey", "Vitalik Buterin"], correctAnswer: "Pavel Durov" },
            { id: 'f4', text: "What does 'HODL' originally stand for in crypto?", options: ["Hold On for Dear Life", "Highly Optimized Digital Ledger", "Home of Digital Liberty", "It was a typo for 'HOLD'"], correctAnswer: "It was a typo for 'HOLD'" },
            { id: 'f5', text: "In which year was Bitcoin created?", options: ["2008", "2009", "2010", "2011"], correctAnswer: "2009" }
        ];
        console.log(`[GAME] API failed, used ${this.questions.length} fallback questions`);
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


                let firstWinnerDailyGames = 0;

                for (const [index, player] of winners.entries()) {
                    if (!player.id) continue;
                    const userId = parseInt(player.id);

                    const { data: user } = await supabase
                        .from('users')
                        .select('balance_stars, stats_total_games, stats_wins, stats_xp, daily_games_today, daily_wins_today, squad_id')
                        .eq('telegram_id', userId)
                        .single();

                    if (user) {
                        if (index === 0) firstWinnerDailyGames = user.daily_games_today || 0;
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
                            daily_wins_today: (user.daily_wins_today || 0) + (isWinner ? 1 : 0)
                        };

                        await supabase.from('users').update(updates).eq('telegram_id', userId);

                        // Update Squad XP if user is in a squad
                        if (user.squad_id) {
                            try {
                                const { data: squad } = await supabase.from('squads').select('total_xp, weekly_xp, creator_id').eq('id', user.squad_id).single();
                                if (squad) {
                                    // 5% Bonus for Leaders
                                    let actualXp = xpReward;
                                    if (squad.creator_id && squad.creator_id.toString() === userId.toString()) {
                                        actualXp = Math.ceil(xpReward * 1.05);
                                    }

                                    await supabase.from('squads').update({
                                        total_xp: (squad.total_xp || 0) + actualXp,
                                        weekly_xp: (squad.weekly_xp || 0) + actualXp
                                    }).eq('id', user.squad_id);

                                    // Apply bonus to user too if leader
                                    if (actualXp > xpReward) {
                                        await supabase.from('users').update({
                                            stats_xp: user.stats_xp + (actualXp - xpReward)
                                        }).eq('telegram_id', userId);
                                    }
                                }
                            } catch (e) {
                                console.error(`[SQUAD] Failed to update XP for squad ${user.squad_id}:`, e);
                            }
                        }

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

                this.io.to(this.roomId).emit('game_over', {
                    winners,
                    prizes: { first: 5, second: 0, third: 0 },
                    currency: 'Stars',
                    xpEarned: 10,
                    dailyGamesLeft: Math.max(0, 10 - firstWinnerDailyGames),
                });

                // Emit balance update so frontend refreshes immediately
                for (const player of winners) {
                    if (!player.id) continue;
                    const userId = parseInt(player.id);
                    try {


                        const { data: freshUser } = await supabase.from('users')
                            .select('balance_stars, stats_xp, balance_ton, balance_qp')
                            .eq('telegram_id', userId)
                            .single();
                        if (freshUser) {
                            this.io.to(this.roomId).emit('balance_update', {
                                stars: freshUser.balance_stars,
                                xp: freshUser.stats_xp,
                                ton: freshUser.balance_ton || 0,
                                balanceQP: freshUser.balance_qp || 0
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
            } catch (e) {
                console.error('Failed to save practice results:', e);
            }
        }
        try {


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
                        stats_level: newLevel.level
                    };
                    if (index === 0) {
                        updates.stats_wins = (user.stats_wins || 0) + 1;
                        updates.daily_wins_today = (user.daily_wins_today || 0) + 1;
                        // Grant 1-hour QP Booster for 1st place
                        const boostUntil = new Date();
                        boostUntil.setHours(boostUntil.getHours() + 1);
                        updates.qp_boost_until = boostUntil.toISOString();
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

                    // Update Squad XP if user is in a squad
                    if (user.squad_id) {
                        try {
                            const { data: squad } = await supabase.from('squads').select('total_xp, weekly_xp, creator_id').eq('id', user.squad_id).single();
                            if (squad) {
                                // 5% Bonus for Leaders
                                let actualXp = player.score;
                                if (squad.creator_id && squad.creator_id.toString() === userId.toString()) {
                                    actualXp = Math.ceil(player.score * 1.05);
                                }

                                await supabase.from('squads').update({
                                    total_xp: (squad.total_xp || 0) + actualXp,
                                    weekly_xp: (squad.weekly_xp || 0) + actualXp
                                }).eq('id', user.squad_id);

                                // Apply bonus to user too if leader
                                if (actualXp > player.score) {
                                    await supabase.from('users').update({
                                        stats_xp: updates.stats_xp + (actualXp - player.score)
                                    }).eq('telegram_id', userId);
                                }
                            }
                        } catch (e) {
                            console.error(`[SQUAD] Failed to update XP for squad ${user.squad_id}:`, e);
                        }
                    }


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

                const { data: freshUser } = await supabase.from('users')
                    .select('balance_stars, balance_ton, stats_xp, balance_qp')
                    .eq('telegram_id', userId)
                    .single();
                if (freshUser) {
                    this.io.to(this.roomId).emit('balance_update', {
                        stars: freshUser.balance_stars,
                        ton: freshUser.balance_ton || 0,
                        xp: freshUser.stats_xp,
                        balanceQP: freshUser.balance_qp || 0
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
