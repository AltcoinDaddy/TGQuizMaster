import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Timer, Star, Plus, ArrowRight, Zap, Trophy, Lock, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Tournament {
    id: string;
    title: string;
    prizePool: string;
    currency: 'TON' | 'Stars';
    entryFee: string;
    joined: number;
    maxPlayers: number;
    timeLeft: string;
    tag: string;
    status: 'live' | 'upcoming' | 'finished';
    color: string;
    type: string;
}

type TabType = 'free' | 'stars' | 'ton';

export const Tournaments: React.FC = () => {
    const [tab, setTab] = useState<TabType>('free');
    const navigate = useNavigate();

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tournaments`);
                const data = await res.json();
                if (data.tournaments) {
                    const formatted = data.tournaments.map((t: any) => ({
                        id: t.id,
                        title: `Room ${t.id.slice(0, 4)}`,
                        prizePool: t.prizePool.toString(),
                        currency: t.currency,
                        entryFee: `${t.entryFee} ${t.currency === 'Stars' ? 'Stars' : 'TON'}`,
                        joined: t.players,
                        maxPlayers: t.maxPlayers,
                        timeLeft: t.status === 'live' ? 'Live' : 'Waiting...',
                        tag: t.type.toUpperCase(),
                        status: t.status === 'live' ? 'live' : 'upcoming',
                        color: t.currency === 'Stars' ? 'accent-gold' : 'primary',
                        type: t.type
                    }));
                    setTournaments(formatted);
                }
            } catch (e) {
                console.error('Failed to fetch tournaments:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchTournaments();
        const interval = setInterval(fetchTournaments, 5000);
        return () => clearInterval(interval);
    }, []);

    const starsTournaments = tournaments.filter(t => t.type === 'stars');
    const tonTournaments = tournaments.filter(t => t.type === 'ton');


    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Play Arena</span>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Play</h1>
                    </div>
                </header>

                {/* Mode Selection - Big Visible Cards */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <button
                        onClick={() => setTab('free')}
                        className={`relative py-5 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 border-2 ${tab === 'free'
                            ? 'bg-green-500/15 border-green-400 shadow-lg shadow-green-500/20'
                            : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <span className="text-3xl">🎮</span>
                        <span className={`text-xs font-black uppercase tracking-wider ${tab === 'free' ? 'text-green-400' : 'text-white/50'}`}>Free</span>
                        {tab === 'free' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />}
                    </button>

                    <button
                        onClick={() => setTab('stars')}
                        className={`relative py-5 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 border-2 ${tab === 'stars'
                            ? 'bg-yellow-500/15 border-yellow-400 shadow-lg shadow-yellow-500/20'
                            : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <span className="text-3xl">⭐</span>
                        <span className={`text-xs font-black uppercase tracking-wider ${tab === 'stars' ? 'text-yellow-400' : 'text-white/50'}`}>Stars</span>
                        {starsTournaments.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-yellow-400 text-background-dark text-[9px] font-black px-1.5 py-0.5 rounded-full">{starsTournaments.length}</span>
                        )}
                    </button>

                    <button
                        onClick={() => setTab('ton')}
                        className={`relative py-5 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 border-2 ${tab === 'ton'
                            ? 'bg-blue-500/15 border-blue-400 shadow-lg shadow-blue-500/20'
                            : 'bg-white/5 border-white/10'
                            }`}
                    >
                        <span className="text-3xl">💎</span>
                        <span className={`text-xs font-black uppercase tracking-wider ${tab === 'ton' ? 'text-blue-400' : 'text-white/50'}`}>TON</span>
                        <span className="absolute -top-1 -right-1 bg-blue-400/20 text-blue-300 text-[7px] font-black px-1.5 py-0.5 rounded-full">SOON</span>
                    </button>
                </div>

                {/* FREE Tab */}
                {tab === 'free' && (
                    <div className="space-y-6">
                        {/* Quick Practice Card */}
                        <GlassCard
                            onClick={() => navigate('/quiz', { state: { type: 'practice', entryFee: 'Free' } })}
                            className="group p-6 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer border-primary/20"
                        >
                            <div className="absolute top-0 right-0 bg-primary px-4 py-1.5 rounded-bl-2xl">
                                <span className="text-[8px] font-black uppercase tracking-widest text-background-dark">Free</span>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-4 rounded-2xl">
                                    <Gamepad2 size={28} className="text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black italic tracking-tighter uppercase">Practice Arena</h3>
                                    <p className="text-xs text-white/50 font-bold mt-1">5 questions • 15 sec each • ~2 min game</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Winner</span>
                                        <span className="text-sm font-black italic text-primary">+5 ⭐</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">All Players</span>
                                        <span className="text-sm font-black italic text-accent-purple">+5 XP</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Quests</span>
                                        <span className="text-sm font-black italic text-accent-gold">✓ Counts</span>
                                    </div>
                                </div>
                                <div className="bg-primary p-3 rounded-xl text-background-dark group-hover:translate-x-1 transition-transform">
                                    <Zap size={20} />
                                </div>
                            </div>
                        </GlassCard>

                        {/* Practice Tips */}
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">Why Practice?</h4>
                            <div className="space-y-2">
                                <p className="text-xs text-white/60 flex items-center gap-2">
                                    <span className="text-primary">⚡</span> Earn XP and Stars for free
                                </p>
                                <p className="text-xs text-white/60 flex items-center gap-2">
                                    <span className="text-primary">📊</span> Progress your daily quests
                                </p>
                                <p className="text-xs text-white/60 flex items-center gap-2">
                                    <span className="text-primary">🏋️</span> Train before entering tournaments
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STARS Tab */}
                {tab === 'stars' && (
                    <div className="space-y-4">
                        {/* Quick Play Button - prominent */}
                        <button
                            onClick={() => navigate('/quiz', { state: { type: 'quickplay', entryFee: '10 Stars', currency: 'Stars' } })}
                            className="w-full flex items-center justify-between bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 py-5 px-6 rounded-2xl active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">⚡</span>
                                <div className="text-left">
                                    <p className="font-black text-sm uppercase italic tracking-tighter text-yellow-400">Quick Play</p>
                                    <p className="text-[10px] text-white/40 font-bold">Auto-match • 10⭐ entry</p>
                                </div>
                            </div>
                            <div className="bg-yellow-400 text-background-dark font-black px-4 py-2 rounded-xl text-xs uppercase italic">
                                Play
                            </div>
                        </button>

                        {/* Create Custom Room */}
                        <button
                            onClick={() => navigate('/create-tournament')}
                            className="w-full flex items-center justify-between bg-gradient-to-r from-amber-900/20 to-yellow-900/10 border border-yellow-600/30 py-4 px-5 rounded-2xl active:scale-[0.98] transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🏆</span>
                                <div className="text-left">
                                    <p className="font-black text-xs uppercase italic tracking-tight text-yellow-500">Create Custom Room</p>
                                    <p className="text-[10px] text-white/40 font-medium">Set your own entry fee & rules</p>
                                </div>
                            </div>
                            <Plus size={18} className="text-yellow-500" />
                        </button>

                        {loading ? (
                            <div className="text-center py-10 opacity-50 font-black italic">LOADING ROOMS...</div>
                        ) : starsTournaments.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center gap-4">
                                <Star size={44} className="text-accent-gold opacity-20" />
                                <p className="font-black italic text-sm text-white/50">NO STAR ROOMS YET</p>
                                <p className="text-xs text-white/30 max-w-[200px]">Tap Quick Play above to auto-join, or create your own room!</p>
                                <button
                                    onClick={() => navigate('/create-tournament')}
                                    className="mt-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-background-dark font-black px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider italic active:scale-95 transition-all shadow-lg shadow-yellow-500/20"
                                >
                                    🏆 Create a Room
                                </button>
                            </div>
                        ) : (
                            starsTournaments.map((t) => (
                                <TournamentCard key={t.id} tournament={t} navigate={navigate} />
                            ))
                        )}
                    </div>
                )}

                {/* TON Tab */}
                {tab === 'ton' && (
                    <div className="space-y-6">
                        {/* Coming Soon Hero */}
                        <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 overflow-hidden text-center">
                            <div className="absolute inset-0 bg-primary/5 backdrop-blur-sm"></div>
                            <div className="relative z-10">
                                <Lock size={40} className="text-primary mx-auto mb-4 opacity-60" />
                                <h3 className="text-xl font-black italic tracking-tighter uppercase text-primary mb-2">TON Tournaments</h3>
                                <p className="text-xs text-white/50 font-bold mb-1">Coming in Phase 2</p>
                                <p className="text-[10px] text-white/30 leading-relaxed max-w-xs mx-auto mt-3">
                                    Compete for real TON prizes, host your own rooms, and climb the leaderboard.
                                </p>
                            </div>
                        </div>

                        {/* Preview of What's Coming */}
                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-3">What's Coming</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                    <Trophy size={16} className="text-primary" />
                                    <div>
                                        <p className="text-xs font-black italic text-white">Platform Tournaments</p>
                                        <p className="text-[10px] text-white/40">Free entry, TON prizes funded by us</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                    <Plus size={16} className="text-accent-gold" />
                                    <div>
                                        <p className="text-xs font-black italic text-white">Host Your Own</p>
                                        <p className="text-[10px] text-white/40">Set entry fee, max players, and category</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                                    <Zap size={16} className="text-accent-purple" />
                                    <div>
                                        <p className="text-xs font-black italic text-white">Smart Contract Prizes</p>
                                        <p className="text-[10px] text-white/40">Secure, instant payouts via TON blockchain</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Show existing TON tournaments if any */}
                        {tonTournaments.length > 0 && tonTournaments.map((t) => (
                            <TournamentCard key={t.id} tournament={t} navigate={navigate} />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

// Reusable tournament card component
const TournamentCard: React.FC<{ tournament: Tournament; navigate: any }> = ({ tournament: t, navigate }) => (
    <GlassCard
        onClick={() => navigate('/quiz', { state: { tournamentId: t.id, entryFee: t.entryFee, currency: t.currency } })}
        className={`group p-6 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer border-white/5 ${t.status === 'live' ? 'border-primary/20 bonus-glow' : ''}`}
    >
        {/* Status Badge */}
        <div className="absolute top-0 right-0">
            <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest border-l border-b border-white/5 ${t.status === 'live' ? 'bg-primary text-background-dark' : 'bg-white/10 text-white/40'
                }`}>
                {t.status === 'live' && <span className="w-1.5 h-1.5 bg-background-dark rounded-full animate-pulse"></span>}
                {t.tag}
            </div>
        </div>

        <div className="flex flex-col mb-8">
            <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 italic mb-2">Prize Pool</span>
            <div className="flex items-center gap-2">
                <h4 className={`text-4xl font-black italic tracking-tighter ${t.color === 'primary' ? 'text-primary' : 'text-accent-gold'
                    }`}>{t.prizePool}</h4>
                <span className="text-xl font-black opacity-20 italic">{t.currency}</span>
            </div>
            <p className="text-sm font-black text-white italic mt-1 uppercase tracking-tighter">{t.title}</p>
        </div>

        <div className="flex items-center justify-between">
            <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                    <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.id}${i}`} className="w-8 h-8 rounded-full border-2 border-background-dark" alt="player" />
                ))}
                <div className="w-8 h-8 rounded-full bg-white/5 border-2 border-background-dark flex items-center justify-center text-[8px] font-black opacity-40">
                    +{t.joined}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40 leading-none">Entry Fee</span>
                    <span className="text-xs font-black italic text-white">{t.entryFee}</span>
                </div>
                <div className="bg-primary p-2 rounded-xl text-background-dark group-hover:translate-x-1 transition-transform">
                    <ArrowRight size={18} />
                </div>
            </div>
        </div>

        {/* Live Ribbon */}
        {t.status === 'live' && (
            <div className="mt-6 flex items-center justify-between bg-primary/10 -mx-6 px-6 py-2 border-t border-primary/20">
                <div className="flex items-center gap-2">
                    <Timer size={12} className="text-primary animate-spin-slow" />
                    <span className="text-[10px] font-black text-primary uppercase italic tracking-widest">In Progress</span>
                </div>
                <span className="text-[10px] font-black text-primary/40 uppercase tracking-tighter">{t.joined}/{t.maxPlayers} players</span>
            </div>
        )}
    </GlassCard>
);
