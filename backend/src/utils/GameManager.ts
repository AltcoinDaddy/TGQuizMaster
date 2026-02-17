import axios from 'axios';
import { decode } from 'html-entities';

export interface Player {
    id: string;
    username: string;
    avatar: string;
    score: number;
}

export interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
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

    isStarted() {
        return this.currentIndex > 0;
    }

    getRoomInfo() {
        return {
            id: this.roomId,
            players: this.players.length,
            maxPlayers: this.maxPlayers,
            type: this.tournamentType,
            prizePool: this.prizePool,
            entryFee: this.entryFee,
            status: this.currentIndex > 0 ? 'live' : 'waiting',
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

    private startTimer() {
        this.timer = 15;
        const interval = setInterval(() => {
            this.timer--;
            this.io.to(this.roomId).emit('timer_update', this.timer);

            if (this.timer <= 0) {
                clearInterval(interval);
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
            const points = Math.max(50, this.timer * 6.6); // Fast answers get ~150 points
            player.score += Math.round(points);
        }

        this.io.to(this.roomId).emit('score_update', this.players);
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

                        await supabase.from('users').update({
                            balance_stars: (user.balance_stars || 0) + starReward,
                            stats_total_games: (user.stats_total_games || 0) + 1,
                            stats_wins: (user.stats_wins || 0) + (isWinner ? 1 : 0),
                            stats_xp: (user.stats_xp || 0) + xpReward,
                            daily_games_today: (user.daily_games_today || 0) + 1,
                            daily_wins_today: (user.daily_wins_today || 0) + (isWinner ? 1 : 0)
                        }).eq('telegram_id', userId);
                    }
                }
            } catch (e) {
                console.error('Failed to save practice results:', e);
            }

            this.io.to(this.roomId).emit('game_over', {
                winners,
                prizes: { first: 5, second: 0, third: 0 },
                currency: 'Stars'
            });
            console.log(`Practice game over in ${this.roomId}. Winner: ${winners[0]?.username} (+5 Stars, +10 XP)`);
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
                    // Prepare updates
                    const updates: any = {
                        stats_total_games: (user.stats_total_games || 0) + 1,
                        stats_xp: (user.stats_xp || 0) + player.score,
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
                }
            }

        } catch (error) {
            console.error('Failed to save game results to DB:', error);
        }

        console.log(`Game Over in ${this.roomId}. 1st: ${winners[0]?.username} wins ${distribution.first} ${this.tournamentType === 'stars' ? 'Stars' : 'TON'}`);

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
