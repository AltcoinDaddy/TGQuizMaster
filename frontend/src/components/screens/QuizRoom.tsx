import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';

import { socket } from '../../utils/socket';
import { useAppStore } from '../../store/useAppStore';
import { soundManager } from '../../utils/SoundManager';

export const QuizRoom: React.FC = () => {
    const { user } = useAppStore();
    const navigate = useNavigate();
    const [timeLeft, setTimeLeft] = useState(15);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
    const [players, setPlayers] = useState<any[]>([]);
    const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'ended'>('waiting');

    // Timer calculation for SVG Circle
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (timeLeft / 15) * circumference;

    const location = useLocation();
    const { tournamentId, entryFee, currency, type } = location.state || {}; // Fallback if direct access

    useEffect(() => {
        // 1. Setup Listeners
        const onRoomUpdate = (room: any) => {
            const sortedPlayers = [...room.players].sort((a: any, b: any) => b.score - a.score);
            setPlayers(sortedPlayers);
        };

        const onGameStart = () => {
            console.log("Game started!");
            setGameStatus('playing');
        };

        const onNewQuestion = (data: any) => {
            // Safety: If we missed game_start, switch to playing
            setGameStatus(prev => {
                if (prev === 'waiting') {
                    console.log("Force switching to playing due to new question");
                    return 'playing';
                }
                return prev;
            });
            setCurrentQuestion(data.question);
            setQuestionIndex(data.index + 1);
            setTotalQuestions(data.total);
            setSelectedAnswer(null);
            setIsCorrect(null);
            setRevealedAnswer(null);
        };

        const onTimerUpdate = (time: number) => {
            setTimeLeft(time);
            if (time <= 5 && time > 0) {
                soundManager.play('tick');
            }
        };

        const onRevealAnswer = (correctAnswer: string) => {
            setRevealedAnswer(correctAnswer);
            if (selectedAnswer) {
                const isWin = selectedAnswer === correctAnswer;
                setIsCorrect(isWin);
                soundManager.play(isWin ? 'correct' : 'wrong');
                if (!isWin) {
                    (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
                } else {
                    (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
                }
            }
        };

        const onScoreUpdate = (updatedPlayers: any[]) => {
            const sortedPlayers = [...updatedPlayers].sort((a, b) => b.score - a.score);
            setPlayers(sortedPlayers);
        };

        const onBalanceUpdate = (balance: any) => {
            if (balance) {
                useAppStore.getState().setUser({
                    stars: balance.stars,
                    tonBalance: balance.ton
                });
            }
        };

        const onInventoryUpdate = (inventory: any) => {
            if (inventory) {
                useAppStore.getState().setUser({ inventory });
            }
        };

        const onGameOver = (winners: any[]) => {
            setGameStatus('ended');
            setPlayers(winners);
            const amIWinner = winners[0]?.username === user.username;
            if (amIWinner) soundManager.play('win');
        };

        const onRoomExpired = (data: any) => {
            setGameStatus('ended');
            const tg = (window as any).Telegram?.WebApp;
            if (tg?.showAlert) {
                tg.showAlert(data.message || 'Room closed — not enough players. Entry fee refunded.');
            }
            setTimeout(() => navigate('/'), 2000);
        };

        socket.on('room_update', onRoomUpdate);
        socket.on('game_start', onGameStart);
        socket.on('new_question', onNewQuestion);
        socket.on('timer_update', onTimerUpdate);
        socket.on('reveal_answer', onRevealAnswer);
        socket.on('score_update', onScoreUpdate);
        socket.on('balance_update', onBalanceUpdate);
        socket.on('user_inventory_update', onInventoryUpdate);
        socket.on('game_over', onGameOver);
        socket.on('room_expired', onRoomExpired);

        // 2. Join Room
        const joinRoom = () => {
            console.log("Joining room...", { type: type || 'tournament' });
            socket.emit('join_room', {
                username: user.username,
                telegramId: user.telegramId,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
                roomType: type || 'tournament',
                tournamentId,
                entryFee,
                currency
            });
        };

        if (socket.connected) {
            joinRoom();
        } else {
            socket.connect();
            socket.once('connect', joinRoom);
        }

        return () => {
            socket.off('room_update', onRoomUpdate);
            socket.off('game_start', onGameStart);
            socket.off('new_question', onNewQuestion);
            socket.off('timer_update', onTimerUpdate);
            socket.off('reveal_answer', onRevealAnswer);
            socket.off('score_update', onScoreUpdate);
            socket.off('balance_update', onBalanceUpdate);
            socket.off('user_inventory_update', onInventoryUpdate);
            socket.off('game_over', onGameOver);
            socket.off('room_expired', onRoomExpired);
            socket.off('connect', joinRoom);
        };
    }, [user.username]);

    const handleAnswer = (option: string) => {
        if (selectedAnswer || gameStatus !== 'playing') return;
        (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
        soundManager.play('click');
        setSelectedAnswer(option);
        socket.emit('submit_answer', option);
    };

    if (gameStatus === 'waiting') {
        return (
            <MainLayout showNav={false}>
                <div className="flex flex-col items-center justify-center min-h-[60dvh] space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center animate-pulse border border-primary/20 shadow-[0_0_30px_rgba(13,242,89,0.2)]">
                        <i className="material-icons text-primary text-5xl">groups</i>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">Finding Players...</h2>
                        <p className="text-xs font-bold opacity-50 mt-2 uppercase italic tracking-widest">{players.length}/5 players joined</p>
                    </div>
                    <div className="flex -space-x-4">
                        {players.map((p, i) => (
                            <img key={i} src={p.avatar} className="w-14 h-14 rounded-full border-4 border-background-dark shadow-xl" alt={p.username} />
                        ))}
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (gameStatus === 'ended') {
        return (
            <MainLayout showNav={false}>
                <div className="flex flex-col items-center justify-center min-h-[80dvh] space-y-8">
                    <div className="text-center">
                        <h2 className="text-4xl font-black text-primary uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(13,242,89,0.4)]">Game Over!</h2>
                        <p className="opacity-50 mt-2 text-xs font-bold uppercase tracking-widest">Final Leaderboard</p>
                    </div>
                    <div className="w-full space-y-3 px-2">
                        {players.slice(0, 5).map((p, i) => (
                            <GlassCard key={p.id} className="flex items-center justify-between p-5 bg-white/5 border-white/10 rounded-2xl">
                                <div className="flex items-center gap-4">
                                    <span className={`font-black italic text-xl w-6 ${i === 0 ? 'text-primary' : 'opacity-20'}`}>{i + 1}</span>
                                    <img src={p.avatar} className="w-12 h-12 rounded-full border-2 border-white/5" alt={p.username} />
                                    <div>
                                        <p className="font-black uppercase italic tracking-tighter leading-none">{p.username}</p>
                                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Player Rank</p>
                                    </div>
                                </div>
                                <span className="font-black text-primary italic text-lg">{p.score} <span className="text-xs">PTS</span></span>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout showNav={false}>
            {/* V2 Header with Progress */}
            <header className="pt-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 italic">Trivia Battle</span>
                        <h1 className="text-xl font-black flex items-center gap-2 uppercase italic tracking-tighter">
                            Question {questionIndex}<span className="text-slate-500 font-medium">/{totalQuestions}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        <i className="material-icons text-primary text-sm">payments</i>
                        <span className="text-sm font-black italic tracking-tighter">2,450 <span className="text-xs">TON</span></span>
                    </div>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary day-active-glow w-[40%] rounded-full transition-all duration-500"></div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center space-y-6">
                {/* Circular SVG Timer */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 scale-110">
                        <circle className="text-white/5" cx="56" cy="56" fill="transparent" r="50" stroke="currentColor" strokeWidth="8"></circle>
                        <circle
                            className="text-primary transition-all duration-1000 ease-linear"
                            cx="56" cy="56"
                            fill="transparent"
                            r="50"
                            stroke="currentColor"
                            strokeWidth="8"
                            strokeDasharray={314}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        ></circle>
                    </svg>
                    <div className="timer-pulse bg-white/5 w-20 h-20 rounded-full flex flex-col items-center justify-center border border-primary/30">
                        <span className="text-3xl font-black text-primary italic tracking-tighter">{timeLeft}</span>
                        <span className="text-[10px] uppercase font-black opacity-40 italic tracking-tighter leading-none">Sec</span>
                    </div>
                </div>

                <div className="w-full text-center px-2">
                    <h2 className="text-2xl font-black leading-tight italic tracking-tighter">
                        {currentQuestion?.text || "Next challenge is loading..."}
                    </h2>
                </div>



                {/* Answer Options with Circle Identifiers */}
                <div className="w-full grid grid-cols-1 gap-3">
                    {currentQuestion?.options.map((option: string, idx: number) => {
                        const letters = ['A', 'B', 'C', 'D'];
                        const isSelected = selectedAnswer === option;
                        const isRevealed = revealedAnswer === option;

                        let buttonClass = 'bg-white/5 border-white/5 hover:border-primary/30';
                        if (isSelected) {
                            if (isCorrect === true) buttonClass = 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(13,242,89,0.3)]';
                            else if (isCorrect === false) buttonClass = 'bg-red-500/20 border-red-500';
                            else buttonClass = 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(13,242,89,0.2)]';
                        } else if (isRevealed) {
                            buttonClass = 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(13,242,89,0.3)]';
                        }

                        return (
                            <button
                                key={option}
                                onClick={() => handleAnswer(option)}
                                disabled={!!selectedAnswer}
                                className={`group w-full p-4 border-2 rounded-2xl flex items-center transition-all animate-in fade-in slide-in-from-bottom duration-300 active:scale-[0.98] ${buttonClass}`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black mr-4 transition-colors ${isSelected ? 'bg-primary text-background-dark' : 'bg-white/10 group-hover:bg-primary group-hover:text-background-dark'
                                    }`}>
                                    {letters[idx]}
                                </div>
                                <span className="text-lg font-black italic tracking-tighter">{option}</span>
                                {((isSelected && isCorrect !== null) || (isRevealed && option === revealedAnswer)) && (
                                    <i className={`material-icons ml-auto ${(option === revealedAnswer || isCorrect === true) ? 'text-primary drop-shadow-[0_0_8px_rgba(13,242,89,0.8)]' : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                        }`}>
                                        {(option === revealedAnswer || isCorrect === true) ? 'check_circle' : 'cancel'}
                                    </i>
                                )}
                            </button>
                        );
                    })}
                </div>
            </main>

            {/* Pedestal Live Footer Leaderboard */}
            <footer className="pb-10 pt-6 px-4 bg-white/5 ios-blur border-t border-white/10 mt-4 -mx-5 px-5">
                <div className="flex justify-around items-end">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                            <img className="w-12 h-12 rounded-full border-2 border-slate-500 object-cover opacity-80" src={players[1]?.avatar || ""} alt="player" />
                            <div className="absolute -bottom-1 -right-1 bg-slate-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full border-2 border-background-dark">2nd</div>
                        </div>
                        <span className="text-[8px] font-black opacity-40 uppercase tracking-tighter truncate w-16 text-center">{players[1]?.username || "Finding..."}</span>
                        <span className="text-xs font-black italic">{players[1]?.score || 0}</span>
                    </div>

                    {/* Rank 1 (Scaled) */}
                    <div className="flex flex-col items-center scale-110 relative -top-2">
                        <div className="relative mb-2">
                            <div className="absolute inset-0 bg-primary/30 blur-md rounded-full"></div>
                            <img className="relative w-16 h-16 rounded-full border-4 border-primary object-cover" src={players[0]?.avatar || ""} alt="player" />
                            <div className="absolute -bottom-1 -right-1 bg-primary text-[8px] font-black text-background-dark px-2 py-0.5 rounded-full border-2 border-background-dark">1st</div>
                        </div>
                        <span className="text-[8px] font-black text-primary uppercase tracking-tighter truncate w-20 text-center">{players[0]?.username === user.username ? "YOU" : (players[0]?.username || "Top Player")}</span>
                        <span className="text-sm font-black text-primary italic">{players[0]?.score || 0}</span>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-2">
                            <img className="w-12 h-12 rounded-full border-2 border-slate-500 object-cover opacity-60" src={players[2]?.avatar || ""} alt="player" />
                            <div className="absolute -bottom-1 -right-1 bg-slate-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full border-2 border-background-dark">3rd</div>
                        </div>
                        <span className="text-[8px] font-black opacity-40 uppercase tracking-tighter truncate w-16 text-center">{players[2]?.username || "Finding..."}</span>
                        <span className="text-xs font-black italic">{players[2]?.score || 0}</span>
                    </div>
                </div>
            </footer>
        </MainLayout>
    );
};
