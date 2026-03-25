import axios from 'axios';
import { decode } from 'html-entities';
import { supabase } from '../config/supabase';
import { RewardService } from './RewardService';

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
    category?: string;
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
    private tournamentType: 'free' | 'stars' | 'chz' | 'practice' = 'free';
    private prizePool = 0;
    private entryFee = 0;
    private questionCount = 10;
    private maxPlayers = 5;
    private rakePercentage = 0.10; // 10% platform cut
    private roomTimeout: NodeJS.Timeout | null = null;
    private expired = false;
    public onGameOver?: (roomId: string, results: any[]) => void;
    public onExpire?: (manager: GameManager) => void; // Callback for timeout
    public groupId?: number | string; // Chat ID for group results
    public category: string;
    private categoryId: number | null = null;
    public megaRoom: boolean = false;
    // Match & Stakes tracking
    public currency: 'STARS' | 'CHZ' = 'STARS';

    private readonly CATEGORY_MAP: Record<string, number> = {
        'Football': 21,
        'Motorsports': 21,
        'Basketball': 21,
        'Tennis': 21,
        'Combat Sports': 21,
        'Esports': 15,
        'Movies & Series': 11,
        'Music': 12,
        'Pop Culture': 26,
        'Sports': 21,
    };

    constructor(roomId: string, io: any, type: 'free' | 'stars' | 'chz' | 'practice' = 'free', prize = 0, fee = 0, maxPlayers = 5, category = 'General', isMega = false) {
        this.roomId = roomId;
        this.players = [];
        this.io = io;
        this.tournamentType = type;
        this.prizePool = prize;
        this.entryFee = fee;
        this.maxPlayers = maxPlayers;
        this.category = category;
        this.categoryId = this.CATEGORY_MAP[category] || null;
        this.megaRoom = isMega;
        this.questionCount = type === 'practice' ? 5 : (this.megaRoom ? 50 : 10);
        this.currency = type === 'chz' ? 'CHZ' : 'STARS';

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

    removePlayer(playerId: string): boolean {
        const initialLength = this.players.length;
        this.players = this.players.filter(p => p.id !== playerId);
        return this.players.length < initialLength;
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
            currency: this.tournamentType === 'stars' ? 'Stars' : 'CHZ',
            category: this.category,
            // Live state for mid-game joins
            currentQuestion: this.started && this.questions[this.currentIndex] ? {
                ...this.questions[this.currentIndex],
                correctAnswer: undefined // Hide answer for joins
            } : null,
            currentIndex: this.currentIndex,
            totalQuestions: this.questions.length,
            timeLeft: this.timer
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
        if (this.started) return;
        this.started = true;

        this.cancelTimeout();
        console.log(`[START] Room ${this.roomId} | Category: ${this.category} (ID: ${this.categoryId}) | Players: ${this.players.length}`);

        await this.fetchQuestions();
        this.sendQuestion();
    }

    private async fetchQuestions() {
        // Normalize category for DB query (e.g., 'Movies & Series' -> 'movies')
        let dbCategory = (this.category === 'General' || !this.category) ? 'all' : this.category.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_');
        
        // Manual mapping overrides for local DB compatibility
        if (dbCategory === 'movies_series') dbCategory = 'movies';
        if (dbCategory === 'pop_culture') dbCategory = 'music';

        // TRUE MIXED CATEGORY HANDLING FOR 'GENERAL' GAMES
        if (dbCategory === 'all') {
            console.log(`[GAME] Fetching mixed categories for 'General' game...`);
            const targetCats = ['football', 'motorsports', 'esports', 'tennis', 'basketball', 'combat_sports', 'movies', 'music'];
            
            try {
                // Fetch a small batch from each category up-front
                const fetchPromises = targetCats.map(cat => 
                    supabase.from('questions').select('*').eq('category', cat).limit(3)
                );
                
                const results = await Promise.all(fetchPromises);
                const allFetched = results.flatMap(res => res.data || []);
                
                if (allFetched.length >= this.questionCount) {
                    const shuffled = allFetched.sort(() => Math.random() - 0.5).slice(0, this.questionCount);
                    this.questions = shuffled.map((q: any) => ({
                        id: q.id,
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correct_answer,
                        category: q.category
                    }));
                    console.log(`[GAME] Mixed game initialized with ${this.questions.length} questions across multiple topics.`);
                    return;
                } else if (allFetched.length > 0) {
                     // Still use what we have even if less than 10 (for small local DBs)
                     this.questions = allFetched.sort(() => Math.random() - 0.5).slice(0, this.questionCount).map((q: any) => ({
                        id: q.id, text: q.text, options: q.options, correctAnswer: q.correct_answer, category: q.category
                    }));
                    return;
                }
            } catch (e) {
                console.error(`[GAME] Mixed fetch failed:`, e);
            }
        }

        // 1. Try fetching from Supabase 'questions' table first via RPC
        try {
            console.log(`[GAME] Querying Supabase: Category=${dbCategory}, Count=${this.questionCount}`);
            
            const { data, error } = await supabase
                .rpc('get_random_questions', {
                    p_category: dbCategory,
                    p_count: this.questionCount
                });
            
            if (!error && data && data.length >= this.questionCount) {
                this.questions = data.map((q: any) => ({
                    id: q.id,
                    text: q.text,
                    options: q.options,
                    correctAnswer: q.correct_answer,
                    category: q.category
                }));
                console.log(`[GAME] Successfully fetched ${this.questions.length} SportFi questions via RPC.`);
                return;
            } 
            
            // SECOND FALLBACK: Direct table select
            console.log(`[GAME] RPC failed for ${dbCategory}. Trying direct table selection...`);
            let directQuery = supabase.from('questions').select('*');
            if (dbCategory !== 'all') {
                directQuery = directQuery.eq('category', dbCategory);
            }
            
            const { data: directData, error: directError } = await directQuery.limit(this.questionCount * 10);
            
            if (!directError && directData && directData.length > 0) {
                const shuffled = directData.sort(() => Math.random() - 0.5).slice(0, this.questionCount);
                this.questions = shuffled.map((q: any) => ({
                    id: q.id,
                    text: q.text,
                    options: q.options,
                    correctAnswer: q.correct_answer,
                    category: q.category
                }));
                console.log(`[GAME] Successfully fetched ${this.questions.length} questions via DIRECT query.`);
                return;
            }
        } catch (e) {
            console.error('[GAME] Supabase integration failed:', e);
        }

        // 3. FINAL FALLBACK: OpenTDB
        const finalId = this.categoryId || 21; 
        try {
            const url = `https://opentdb.com/api.php?amount=${this.questionCount}&category=${finalId}&type=multiple`;
            const resp = await axios.get(url);
            
            if (resp.data.results && resp.data.results.length > 0) {
                this.questions = resp.data.results.map((q: any, i: number) => ({
                    id: `q_${Date.now()}_${i}`,
                    text: decode(q.question),
                    options: [...q.incorrect_answers.map((a: any) => decode(a)), decode(q.correct_answer)].sort(() => Math.random() - 0.5),
                    correctAnswer: decode(q.correct_answer),
                    category: 'Sports'
                }));
                console.log(`[GAME] Loaded ${this.questions.length} fallback questions from OpenTDB.`);
                return;
            }
        } catch (e) {
            console.error('[GAME] OpenTDB fallback failed:', e);
        }
    }

    private sendQuestion() {
        if (this.questions.length === 0) {
            console.warn(`[GAME] No questions loaded for room ${this.roomId}. Waiting...`);
            setTimeout(() => {
                if (this.questions.length === 0) this.endGame();
                else this.sendQuestion();
            }, 2000);
            return;
        }

        if (this.currentIndex >= this.questions.length) {
            this.endGame();
            return;
        }

        const question = this.questions[this.currentIndex];
        this.io.to(this.roomId).emit('new_question', {
            question: {
                id: question.id,
                text: question.text,
                options: question.options,
                category: question.category
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
        const userId = parseInt(player.id);

        if (answer === question.correctAnswer) {
            let points = Math.max(50, this.timer * 6.6); // Fast answers get ~150 points
            if (player.doublePoints) {
                points *= 2;
                player.doublePoints = false; // Consume the power-up
            }
            player.score += Math.round(points);

            // Add Season XP if this is a tournament/ranked game
            if (this.tournamentType === 'stars' || this.tournamentType === 'chz') {
                if (!isNaN(userId)) {
                    RewardService.addSeasonXP(userId, Math.round(points)).catch(e =>
                        console.error(`[GAME] Failed to add Season XP for ${userId}:`, e)
                    );
                }
            }

            // Award 1 CP for every correct answer
            if (!isNaN(userId)) {
                RewardService.awardCP(userId, 1).catch(e => 
                    console.error(`[GAME] Failed to award CP for correct answer to ${userId}:`, e)
                );
            }
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

        if (!player.usedPowerUps) player.usedPowerUps = [];

        if (player.usedPowerUps.includes(powerUpId)) {
            return { success: false, error: 'Already used this power-up' };
        }

        player.usedPowerUps.push(powerUpId);

        switch (powerUpId) {
            case 'pu_5050': {
                const question = this.questions[this.currentIndex];
                const wrongAnswers = question.options.filter(o => o !== question.correctAnswer);
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
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }

        const winners = [...this.players].sort((a, b) => b.score - a.score);

        const grossPool = this.entryFee * this.players.length;
        const rake = (this.tournamentType === 'stars' || this.tournamentType === 'chz')
            ? Math.floor(grossPool * this.rakePercentage)
            : 0;
        const netPrize = grossPool - rake;

        const distribution = {
            first: Math.floor(netPrize * 0.6),
            second: Math.floor(netPrize * 0.3),
            third: Math.floor(netPrize * 0.1)
        };

        const prizes = [distribution.first, distribution.second, distribution.third];
        const currency = this.tournamentType === 'stars' ? 'STARS' : 'CHZ';

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

                        if (user.squad_id) {
                            try {
                                const { data: squad } = await supabase.from('squads').select('total_xp, weekly_xp, creator_id').eq('id', user.squad_id).single();
                                if (squad) {
                                    let actualXp = xpReward;
                                    if (squad.creator_id && squad.creator_id.toString() === userId.toString()) {
                                        actualXp = Math.ceil(xpReward * 1.05);
                                    }

                                    await supabase.from('squads').update({
                                        total_xp: (squad.total_xp || 0) + actualXp,
                                        weekly_xp: (squad.weekly_xp || 0) + actualXp
                                    }).eq('id', user.squad_id);

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

                        if (newLevel.level > oldLevel.level) {
                            this.io.to(this.roomId).emit('level_up', {
                                playerId: player.id,
                                level: newLevel.level,
                                title: newLevel.title,
                                nextXp: newLevel.nextXp,
                                currentXp: newXp
                            });
                        }
                    }
                }

                this.io.to(this.roomId).emit('game_over', {
                    winners,
                    prizes: { first: 5, second: 0, third: 0 },
                    currency: 'Stars',
                    xpEarned: 10,
                    dailyGamesLeft: Math.max(0, 3 - firstWinnerDailyGames),
                });

                for (const player of winners) {
                    if (!player.id) continue;
                    const userId = parseInt(player.id);
                    try {
                        const { data: freshUser } = await supabase.from('users')
                            .select('balance_stars, stats_xp, balance_chz, balance_cp')
                            .eq('telegram_id', userId)
                            .single();
                        if (freshUser) {
                            this.io.to(this.roomId).emit('balance_update', {
                                stars: freshUser.balance_stars,
                                xp: freshUser.stats_xp,
                                balanceCHZ: freshUser.balance_chz || 0,
                                balanceCP: freshUser.balance_cp || 0
                            });
                        }
                    } catch (e) {
                        console.error(`Failed to emit balance_update for user ${userId} in practice mode:`, e);
                    }
                }

                if (this.onGameOver) this.onGameOver(this.roomId, []);
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

            if (rake > 0) {
                await supabase.from('transactions').insert({
                    user_id: 0,
                    type: 'PLATFORM_RAKE',
                    amount: rake,
                    currency,
                    metadata: { tournamentId: tournamentRecord.id, grossPool, rakePercent: this.rakePercentage * 100 },
                    status: 'COMPLETED'
                });
            }

            for (const [index, player] of winners.entries()) {
                const prize = prizes[index] || 0;
                if (!player.id) continue;

                const userId = parseInt(player.id);

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

                    const updates: any = {
                        stats_total_games: (user.stats_total_games || 0) + 1,
                        stats_xp: newXp,
                        stats_level: newLevel.level
                    };
                    if (index === 0) {
                        updates.stats_wins = (user.stats_wins || 0) + 1;
                        updates.daily_wins_today = (user.daily_wins_today || 0) + 1;
                        const boostUntil = new Date();
                        boostUntil.setHours(boostUntil.getHours() + 1);
                        updates.cp_boost_until = boostUntil.toISOString();
                        
                        RewardService.awardCP(userId, 10).catch(e => console.error(`[GAME] CP award failed:`, e));
                    }

                    if (prize > 0) {
                        if (currency === 'STARS') updates.balance_stars = (user.balance_stars || 0) + prize;
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

                    if (this.tournamentType === 'stars' || this.tournamentType === 'chz') {
                        const multiplier = this.megaRoom ? 2 : 1;
                        const xpToAdd = player.score * multiplier;
                        if (xpToAdd > 0) RewardService.addSeasonXP(parseInt(player.id), xpToAdd);
                    }

                    if (user.squad_id) {
                        try {
                            const { data: squad } = await supabase.from('squads').select('total_xp, weekly_xp, creator_id').eq('id', user.squad_id).single();
                            if (squad) {
                                let actualXp = player.score;
                                if (squad.creator_id && squad.creator_id.toString() === userId.toString()) actualXp = Math.ceil(player.score * 1.05);
                                await supabase.from('squads').update({
                                    total_xp: (squad.total_xp || 0) + actualXp,
                                    weekly_xp: (squad.weekly_xp || 0) + actualXp
                                }).eq('id', user.squad_id);
                            }
                        } catch (e) {
                            console.error(`[SQUAD] XP update failed:`, e);
                        }
                    }

                    if (newLevel.level > oldLevel.level) {
                        this.io.to(this.roomId).emit('level_up', {
                            playerId: player.id,
                            level: newLevel.level,
                            title: newLevel.title,
                            nextXp: newLevel.nextXp,
                            currentXp: newXp
                        });
                    }
                }
            }

        } catch (error) {
            console.error('Failed to save game results:', error);
        }

        for (const player of winners) {
            if (!player.id) continue;
            const userId = parseInt(player.id);
            try {
                const { data: freshUser } = await supabase.from('users')
                    .select('balance_stars, balance_chz, stats_xp, balance_cp')
                    .eq('telegram_id', userId)
                    .single();
                if (freshUser) {
                    this.io.to(this.roomId).emit('balance_update', {
                        stars: freshUser.balance_stars,
                        balanceCHZ: freshUser.balance_chz || 0,
                        xp: freshUser.stats_xp,
                        balanceCP: freshUser.balance_cp || 0
                    });
                }
            } catch (e) {
                console.error(`Failed balance update:`, e);
            }
        }

        this.io.to(this.roomId).emit('game_over', {
            winners,
            prizes: distribution,
            currency: this.tournamentType === 'stars' ? 'Stars' : 'CHZ',
            roomId: this.roomId
        });

        if (this.onGameOver) this.onGameOver(this.roomId, winners);
    }
}
