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

    constructor(roomId: string, io: any, type: 'free' | 'stars' | 'ton' | 'practice' = 'free', prize = 0, fee = 0) {
        this.roomId = roomId;
        this.players = [];
        this.io = io;
        this.tournamentType = type;
        this.prizePool = prize;
        this.entryFee = fee;
    }

    addPlayer(player: Player) {
        this.players.push(player);
    }

    getPlayers() {
        return this.players;
    }

    getRoomInfo() {
        return {
            id: this.roomId,
            players: this.players.length,
            maxPlayers: 5, // Hardcoded for now
            type: this.tournamentType,
            prizePool: this.prizePool,
            entryFee: this.entryFee,
            status: this.currentIndex > 0 ? 'live' : 'waiting',
            currency: this.tournamentType === 'stars' ? 'Stars' : 'TON'
        };
    }

    async start() {
        console.log(`Match starting in room ${this.roomId} [Type: ${this.tournamentType}]`);
        await this.fetchQuestions();
        this.sendQuestion();
    }

    private async fetchQuestions() {
        try {
            const resp = await axios.get('https://opentdb.com/api.php?amount=10&type=multiple');
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

        // Distribution Logic
        const totalPrize = this.prizePool;
        const distribution = {
            first: Math.floor(totalPrize * 0.6),
            second: Math.floor(totalPrize * 0.3),
            third: Math.floor(totalPrize * 0.1)
        };

        const prizes = [distribution.first, distribution.second, distribution.third];
        const currency = this.tournamentType === 'stars' ? 'STARS' : 'TON';

        // Skip DB recording for practice
        if (this.tournamentType === 'practice') {
            this.io.to(this.roomId).emit('game_over', {
                winners,
                prizes: { first: 0, second: 0, third: 0 },
                currency: 'XP'
            });
            console.log(`Practice game over in ${this.roomId}`);
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
                    prize_pool: this.prizePool,
                    currency,
                    entry_fee: 0,
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
                        stats_xp: (user.stats_xp || 0) + player.score
                    };
                    if (index === 0) updates.stats_wins = (user.stats_wins || 0) + 1;

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
            currency: this.tournamentType === 'stars' ? 'Stars' : 'TON'
        });
    }
}
