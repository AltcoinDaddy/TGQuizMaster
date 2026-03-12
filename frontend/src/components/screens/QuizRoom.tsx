import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Target, Timer, Zap, Loader2 } from 'lucide-react';

import { socket } from '../../utils/socket';
import { useAppStore } from '../../store/useAppStore';
import { soundManager } from '../../utils/SoundManager';
import { ReviveModal } from '../ui/ReviveModal';
import { adsService } from '../../utils/AdsService';

export const QuizRoom: React.FC = () => {
    const { user } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const [timeLeft, setTimeLeft] = useState(15);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(10);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
    const roomIdFromUrl = queryParams.get('roomId');
    const categoryFromUrl = queryParams.get('category');
    const typeFromUrl = queryParams.get('type') as any;

    // Support encoded parameters in room ID: room_ID_m2_cMovies
    let extractedMax: number | null = null;
    let extractedCategory: string | null = null;
    let cleanRoomId = roomIdFromUrl;
    if (roomIdFromUrl && roomIdFromUrl.includes('_')) {
        const parts = roomIdFromUrl.split('_');
        cleanRoomId = parts[0];

        const mPart = parts.find((p: string) => p.startsWith('m'));
        const cPart = parts.find((p: string) => p.startsWith('c'));
        const gPart = parts.find((p: string) => p.startsWith('g'));

        if (mPart) extractedMax = parseInt(mPart.substring(1));
        if (cPart) {
            extractedCategory = cPart.substring(1).replace(/_/g, ' ');
        }

        console.log(`[JOIN] Extracted from ID: max=${extractedMax}, category=${extractedCategory}, isGroup=${!!gPart}`);
        if (gPart) (location.state as any) = { ...location.state, isGroup: true };
    }

    const { tournamentId, entryFee, currency, type: stateType, category: stateCategory } = location.state || {};

    // NEW: Recover pending configuration from sessionStorage if state drops
    let pendingConf: any = null;
    try {
        const confStr = sessionStorage.getItem('pendingRoomConf');
        if (confStr) pendingConf = JSON.parse(confStr);
    } catch (e) { }

    const initialMax = extractedMax || location.state?.maxPlayers || pendingConf?.maxPlayers || queryParams.get('maxPlayers') || 5;
    const [maxPlayersCount, setMaxPlayersCount] = useState(parseInt(String(initialMax)) || 5);

    const initialCategory = extractedCategory || stateCategory || categoryFromUrl || pendingConf?.category || 'General';
    const [roomCategory, setRoomCategory] = useState(initialCategory);

    const initialEntryFee = entryFee || (roomIdFromUrl ? 10 : 0);
    const initialCurrency = currency || 'Stars';

    // FIX: Initialize with current user to avoid "0/N" flash
    const [players, setPlayers] = useState<any[]>(user?.username ? [{
        id: user.telegramId?.toString(),
        username: user.username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
        score: 0
    }] : []);

    const [gameStatus, setGameStatus] = useState<'waiting' | 'playing' | 'ended'>('waiting');
    const gameEndedRef = useRef(false);
    const [gameResults, setGameResults] = useState<any>(null);

    // Power-Up State
    const [usedPowerUps, setUsedPowerUps] = useState<string[]>([]);
    const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
    const [doublePointsActive, setDoublePointsActive] = useState(false);
    const [powerUpLoading, setPowerUpLoading] = useState<string | null>(null);
    const [hasRevived, setHasRevived] = useState(false);
    const [showReviveModal, setShowReviveModal] = useState(false);

    // Timer calculation for SVG Circle
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (timeLeft / 15) * circumference;

    const finalRoomId = cleanRoomId || tournamentId;
    const finalType = stateType || typeFromUrl || 'tournament';
    const isSurvival = finalType === 'survival';

    useEffect(() => {
        // 1. Setup Listeners
        const onRoomUpdate = (room: any) => {
            const sortedPlayers = [...room.players].sort((a: any, b: any) => b.score - a.score);
            setPlayers(sortedPlayers);
            if (room.maxPlayers) {
                setMaxPlayersCount(room.maxPlayers);
            }
            if (room.category) {
                setRoomCategory(room.category);
            }
        };

        // NEW: Timeout for finding players
        const joinTimeout = setTimeout(() => {
            if (gameStatus === 'waiting' && !gameEndedRef.current) {
                console.warn("[JOIN] Room join timed out. Returning to home.");
                const tg = (window as any).Telegram?.WebApp;
                if (tg?.showConfirm) {
                    tg.showConfirm("Still finding players... stay here or return home?", (ok: boolean) => {
                        if (!ok) navigate('/');
                    });
                }
            }
        }, 30000); // 30 seconds

        const onGameStart = () => {
            console.log("Game started!");
            clearTimeout(joinTimeout);
            setGameStatus('playing');
        };

        const onNewQuestion = (data: any) => {
            clearTimeout(joinTimeout);
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
            setEliminatedOptions([]); // Reset 50/50 for new question
            setDoublePointsActive(false);
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
                    // Practice Mode Revive Logic
                    if (finalType === 'practice' && !hasRevived) {
                        setShowReviveModal(true);
                    }
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
                const currentUser = useAppStore.getState().user;
                useAppStore.getState().setUser({
                    ...currentUser,
                    stars: balance.stars ?? currentUser.stars,
                    tonBalance: balance.ton ?? currentUser.tonBalance,
                    xp: balance.xp ?? currentUser.xp,
                    balanceQP: balance.balanceQP ?? currentUser.balanceQP
                });
                // Also update global store correctly
                useAppStore.getState().syncFromBackend(balance);
            }
        };

        const onInventoryUpdate = (inventory: any) => {
            if (inventory) {
                useAppStore.getState().setUser({ inventory });
            }
        };

        const onGameOver = (data: any) => {
            clearTimeout(joinTimeout);
            gameEndedRef.current = true;
            setGameStatus('ended');
            setPlayers(data.winners);

            const myIndex = data.winners.findIndex((p: any) => p.username === user.username);
            const amIWinner = myIndex === 0;

            // Determine XP and Reward
            let myXp = 0;
            let myReward = 0;

            if (finalType === 'practice' || !finalType) {
                myXp = data.xpEarned || (amIWinner ? 10 : 5);
                myReward = data.reward !== undefined ? data.reward : (amIWinner ? 5 : 0);
            } else {
                // Tournament calculation
                myXp = data.winners[myIndex]?.score || 0;
                if (data.prizes) {
                    if (myIndex === 0) myReward = data.prizes.first || 0;
                    else if (myIndex === 1) myReward = data.prizes.second || 0;
                    else if (myIndex === 2) myReward = data.prizes.third || 0;
                }
            }

            setGameResults({
                score: data.winners[myIndex]?.score || 0,
                xp: myXp,
                reward: myReward,
                currency: data.currency || (currency === 'none' ? 'Stars' : (currency || 'Stars'))
            });

            if (amIWinner) soundManager.play('win');
        };

        const onRoomExpired = (data: any) => {
            clearTimeout(joinTimeout);
            setGameStatus('ended');
            const tg = (window as any).Telegram?.WebApp;
            if (tg?.showAlert) {
                tg.showAlert(data.message || 'Room closed — not enough players. Entry fee refunded.');
            }
            navigate('/');
        };

        const onSocketError = (data: any) => {
            console.error('[SOCKET] error:', data);
            clearTimeout(joinTimeout);
            if (data.message === 'Insufficient Stars balance') {
                alert('You do not have enough stars to join this room.');
            } else {
                const tg = (window as any).Telegram?.WebApp;
                if (tg?.showAlert) {
                    tg.showAlert(data.message || 'An error occurred. Returning to lobby.');
                } else {
                    alert(data.message || 'An error occurred. Returning to lobby.');
                }
            }
            navigate('/');
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
        socket.on('error', onSocketError);

        // Power-up result handler
        const onPowerUpResult = (result: any) => {
            setPowerUpLoading(null);
            if (result.success && result.data) {
                if (result.data.type === 'fifty_fifty') {
                    setEliminatedOptions(result.data.removed);
                    (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
                } else if (result.data.type === 'extra_time') {
                    (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
                } else if (result.data.type === 'double_points') {
                    setDoublePointsActive(true);
                    (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy');
                }
            }
        };
        socket.on('powerup_result', onPowerUpResult);

        const onLevelUp = (data: any) => {
            console.log("Level up received!", data);
            soundManager.play('win');
            setTimeout(() => {
                if (gameEndedRef.current) {
                    navigate('/level-up', { state: { level: data.level, title: data.title } });
                }
            }, 7000); // Increased to 7 seconds to let them see the game result first
        };
        socket.on('level_up', onLevelUp);

        // 2. Join Room
        const joinRoom = () => {
            // Don't rejoin if the game already ended (prevents practice mode restart on reconnect)
            if (gameEndedRef.current) {
                console.log("Game already ended, skipping rejoin");
                return;
            }
            console.log("Joining room...", { type: finalType, category: roomCategory, maxPlayersCount });
            socket.emit('join_room', {
                username: user.username,
                telegramId: user.telegramId,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`,
                roomType: finalType,
                tournamentId: finalRoomId,
                entryFee: initialEntryFee,
                currency: initialCurrency,
                category: roomCategory,
                maxPlayers: maxPlayersCount,
                isGroup: (location.state as any)?.isGroup || (roomIdFromUrl && roomIdFromUrl.includes('_g')) || false
            });
        };

        if (socket.connected) {
            joinRoom();
        } else {
            socket.on('connect', joinRoom);
            socket.connect();
        }

        // 3. Telegram BackButton support
        const tg = (window as any).Telegram?.WebApp;
        const handleBack = () => {
            console.log("Back button clicked, leaving room...");
            socket.emit('leave_room');
            navigate('/');
        };

        if (tg?.BackButton) {
            tg.BackButton.show();
            tg.BackButton.onClick(handleBack);
        }

        return () => {
            clearTimeout(joinTimeout);
            socket.off('connect', joinRoom);
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
            socket.off('error', onSocketError);
            socket.off('powerup_result', onPowerUpResult);
            socket.off('level_up', onLevelUp);
            socket.emit('leave_room');

            if (tg?.BackButton) {
                tg.BackButton.hide();
                tg.BackButton.offClick(handleBack);
            }
        };
    }, [user.telegramId, user.username, finalRoomId, finalType, entryFee, currency]);

    const handleAnswer = (option: string) => {
        if (selectedAnswer || gameStatus !== 'playing' || eliminatedOptions.includes(option)) return;
        (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
        soundManager.play('click');
        setSelectedAnswer(option);
        socket.emit('submit_answer', option);
    };

    const handlePowerUp = (powerUpId: string) => {
        if (usedPowerUps.includes(powerUpId) || gameStatus !== 'playing' || powerUpLoading) return;
        // Check inventory (Map with quantities)
        const inv = useAppStore.getState().user.inventoryPowerups || {};
        const count = inv[powerUpId] || 0;

        if (count <= 0) {
            // Check legacy inventory array
            const invArr = useAppStore.getState().user.inventory || [];
            if (!invArr.includes(powerUpId)) {
                (window as any).Telegram?.WebApp?.showAlert?.('You don\'t have this power-up! Buy it from the Shop.');
                return;
            }
        }
        setPowerUpLoading(powerUpId);
        setUsedPowerUps(prev => [...prev, powerUpId]);
        socket.emit('use_powerup', powerUpId);
    };

    const handleRevive = async () => {
        setShowReviveModal(false);
        const success = await adsService.showRewardedVideo();
        if (success) {
            setHasRevived(true);
            setIsCorrect(true);
            soundManager.play('correct');
            // Notify server to award points for this question
            socket.emit('submit_answer', revealedAnswer); // Resubmit correct answer
        }
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
                        <p className="text-xs font-bold opacity-50 mt-2 uppercase italic tracking-widest">{players.length}/{maxPlayersCount} players joined</p>
                    </div>
                    <div className="flex -space-x-4">
                        {players.map((p, i) => (
                            <img key={i} src={p.avatar} className="w-14 h-14 rounded-full border-4 border-background-dark shadow-xl" alt={p.username} />
                        ))}
                    </div>

                    <button
                        onClick={() => {
                            socket.emit('leave_room');
                            navigate('/');
                        }}
                        className="w-full max-w-xs py-4 bg-white/5 border border-white/10 text-white/40 font-black text-xs uppercase tracking-[0.2em] rounded-2xl active:scale-95 transition-all mt-4"
                    >
                        Cancel & Leave
                    </button>
                </div>
            </MainLayout>
        );
    }

    if (gameStatus === 'ended') {
        return (
            <MainLayout showNav={false}>
                <div className="flex flex-col items-center justify-center min-h-[80dvh] space-y-8">
                    <div className="text-center">
                        <h2 className={`text-4xl font-black uppercase italic tracking-tighter drop-shadow-[0_0_15px_rgba(13,242,89,0.4)] text-primary`}>
                            {isSurvival ? 'Wasted!' : 'Game Over!'}
                        </h2>
                        <p className="opacity-50 mt-2 text-xs font-bold uppercase tracking-widest">{isSurvival ? 'Run Statistics' : 'Final Leaderboard'}</p>
                    </div>
                    <div className="w-full space-y-3 px-2">
                        {/* Game Stats Card */}
                        {gameResults && (
                            <GlassCard className={`p-6 mb-6 bg-gradient-to-br from-transparent to-transparent border-white/10 text-center ${isSurvival ? 'border-primary/20 bg-primary/5' : 'border-primary/20 bg-primary/5'}`}>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Your Performance</p>
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    <div className="flex flex-col">
                                        <span className={`text-2xl font-black italic ${isSurvival ? 'text-primary' : 'text-white'}`}>{isSurvival ? (gameResults as any).streak : gameResults.score}</span>
                                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">{isSurvival ? 'Streak' : 'Score'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-2xl font-black italic text-primary`}>+{gameResults.xp}</span>
                                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">XP</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black italic text-accent-gold">+{gameResults.reward}</span>
                                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-40">{gameResults.currency}</span>
                                    </div>
                                </div>
                            </GlassCard>
                        )}

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

                    {/* Navigation Buttons */}
                    <div className="w-full px-2 space-y-3 mt-4">
                        <button
                            onClick={() => {
                                gameEndedRef.current = false;
                                // Pass state in URL so it survives window.location.reload()
                                const params = new URLSearchParams();
                                if (roomCategory) params.set('category', roomCategory);
                                if (finalType) params.set('type', finalType);
                                if (finalRoomId) params.set('roomId', finalRoomId);
                                if (maxPlayersCount) params.set('maxPlayers', maxPlayersCount.toString());

                                navigate(`/quiz?${params.toString()}`, { state: location.state, replace: true });
                                window.location.reload();
                            }}
                            className="w-full py-4 bg-primary text-background-dark font-black text-sm uppercase italic tracking-widest rounded-2xl active:scale-95 transition-all shadow-[0_0_20px_rgba(13,242,89,0.3)]"
                        >
                            <Zap size={16} fill="currentColor" /> Play Again
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-4 bg-white/5 border border-white/10 text-white/60 font-black text-xs uppercase tracking-widest rounded-2xl active:scale-95 transition-all"
                        >
                            Back to Home
                        </button>
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
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isSurvival ? 'text-primary animate-pulse' : 'text-primary/80'} italic`}>
                            {isSurvival ? 'The Gauntlet • Run or Die' : 'Trivia Battle'}
                        </span>
                        <h1 className="text-xl font-black flex items-center gap-2 uppercase italic tracking-tighter">
                            {isSurvival ? `Streak ${questionIndex}` : `Question ${questionIndex}`}
                            <span className="text-slate-500 font-medium">{isSurvival ? '' : `/${totalQuestions}`}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                        <i className="material-icons text-primary text-sm">star</i>
                        <span className="text-sm font-black italic tracking-tighter">{(user.stars || 0).toLocaleString()} <span className="text-xs">⭐</span></span>
                    </div>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${isSurvival ? 'bg-primary shadow-[0_0_15px_rgba(13,242,89,0.5)]' : 'bg-primary day-active-glow'} rounded-full transition-all duration-500`} 
                        style={{ width: isSurvival ? '100%' : `${totalQuestions > 0 ? (questionIndex / totalQuestions) * 100 : 0}%` }}></div>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center space-y-6">
                {/* Circular SVG Timer */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 scale-110">
                        <circle className="text-white/5" cx="56" cy="56" fill="transparent" r="50" stroke="currentColor" strokeWidth="8"></circle>
                        <circle
                            className={`${isSurvival ? 'text-primary shadow-[0_0_20px_rgba(13,242,89,0.6)]' : 'text-primary'} transition-all duration-1000 ease-linear`}
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
                    <div className={`timer-pulse ${isSurvival ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-primary/30'} w-20 h-20 rounded-full flex flex-col items-center justify-center border`}>
                        <span className={`text-3xl font-black ${isSurvival ? 'text-primary' : 'text-primary'} italic tracking-tighter`}>{timeLeft}</span>
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
                        const isEliminated = eliminatedOptions.includes(option);

                        let buttonClass = 'bg-white/5 border-white/5';
                        if (isEliminated) {
                            buttonClass = 'bg-white/2 border-white/5 opacity-30 line-through pointer-events-none';
                        } else if (isSelected) {
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
                                disabled={!!selectedAnswer || isEliminated}
                                className={`group w-full p-4 border-2 rounded-2xl flex items-center transition-all animate-in fade-in slide-in-from-bottom duration-300 active:scale-[0.98] ${buttonClass}`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black mr-4 transition-colors ${isSelected ? 'bg-primary text-background-dark' : 'bg-white/10'}`}>
                                    {letters[idx]}
                                </div>
                                <span className={`text-lg font-black italic tracking-tighter ${isEliminated ? 'line-through' : ''}`}>{option}</span>
                                {((isSelected && isCorrect !== null) || (isRevealed && option === revealedAnswer)) && (
                                    <i className={`material-icons ml-auto ${(option === revealedAnswer || isCorrect === true) ? 'text-primary drop-shadow-[0_0_8px_rgba(13,242,89,0.8)]' : 'text-red-500'}`}>
                                        {(option === revealedAnswer || isCorrect === true) ? 'check_circle' : 'cancel'}
                                    </i>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Power-Up Bar - Premium V2 */}
                {gameStatus === 'playing' && (
                    <div className="w-full flex justify-center gap-4 mt-4 px-2">
                        {[
                            { id: 'pu_5050', icon: Target, label: '50/50', color: 'primary' },
                            { id: 'pu_time', icon: Timer, label: '+10s', color: 'yellow-400' },
                            { id: 'pu_double', icon: Zap, label: '2x Points', color: 'accent-purple' },
                        ].map(pu => {
                            const isUsed = usedPowerUps.includes(pu.id);
                            const isLoading = powerUpLoading === pu.id;
                            const invMap = user.inventoryPowerups || {};
                            const count = invMap[pu.id] || 0;
                            const hasInInventory = count > 0 || (user.inventory || []).includes(pu.id);
                            const isActive = pu.id === 'pu_double' && doublePointsActive;

                            const Icon = pu.icon;
                            const colorClass = pu.color === 'primary' ? 'primary' : pu.color;

                            return (
                                <button
                                    key={pu.id}
                                    onClick={() => handlePowerUp(pu.id)}
                                    disabled={isUsed || isLoading || !hasInInventory}
                                    className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all active:scale-95 group flex-1
                                        ${isActive ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(13,242,89,0.4)] animate-pulse' :
                                            isUsed ? 'bg-white/5 border-white/10 opacity-30 grayscale' :
                                                !hasInInventory ? 'bg-white/2 border-white/5 opacity-40' :
                                                    'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all
                                        ${isActive ? 'text-primary' :
                                            isUsed ? 'text-white/20' :
                                                !hasInInventory ? 'text-white/20' :
                                                    `text-${colorClass} bg-${colorClass}/10 group-hover:scale-110`}`}>
                                        {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Icon size={24} fill="currentColor" fillOpacity={isUsed ? 0 : 0.1} />}
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-60 leading-none">{pu.label}</span>

                                    {!isUsed && hasInInventory && (
                                        <div className="absolute -top-1 -right-1 bg-background-dark border border-white/10 rounded-full px-1.5 py-0.5 min-w-[18px] flex items-center justify-center">
                                            <span className="text-[8px] font-black text-primary">{count}</span>
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
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

            {finalType === 'practice' && (
                <div className="fixed bottom-24 left-6 right-6 flex items-center justify-between opacity-30 pointer-events-none">
                    <span className="text-[8px] font-black uppercase tracking-widest italic">Practice Mode</span>
                    <span className="text-[8px] font-black uppercase tracking-widest italic">{hasRevived ? 'Used Revive' : 'Revive Available'}</span>
                </div>
            )}

            <ReviveModal
                isOpen={showReviveModal}
                onRevive={handleRevive}
                onSkip={() => setShowReviveModal(false)}
            />
        </MainLayout>
    );
};
