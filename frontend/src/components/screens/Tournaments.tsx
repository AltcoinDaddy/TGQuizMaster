import React, { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Timer, Star, Plus, ArrowRight } from 'lucide-react';
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
}

export const Tournaments: React.FC = () => {
    const [tab, setTab] = useState<'live' | 'upcoming'>('live');
    const navigate = useNavigate();

    const tournaments: Tournament[] = [
        { id: '1', title: 'Champions League', prizePool: '2,500', currency: 'TON', entryFee: '50 Stars', joined: 48, maxPlayers: 50, timeLeft: '01:42', tag: 'CHAMPIONS', status: 'live', color: 'primary' },
        { id: '2', title: 'Star Blitz', prizePool: '15,000', currency: 'Stars', entryFee: '10 Stars', joined: 124, maxPlayers: 200, timeLeft: 'Starts in 12m', tag: 'BLITZ', status: 'upcoming', color: 'accent-purple' },
        { id: '3', title: 'Grand Finale', prizePool: '5,000', currency: 'TON', entryFee: '100 Stars', joined: 8, maxPlayers: 100, timeLeft: 'Starts in 2h', tag: 'GRAND', status: 'upcoming', color: 'accent-gold' }
    ];

    const filteredTournaments = tournaments.filter(t => tab === 'live' ? t.status === 'live' : t.status === 'upcoming');

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Premium Header */}
                <header className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Live Arena</span>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Tournaments</h1>
                    </div>
                    <button className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 text-primary active:scale-95 transition-all">
                        <Plus size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Host</span>
                    </button>
                </header>

                {/* Segmented Control */}
                <div className="bg-white/5 p-1 rounded-2xl flex mb-10 border border-white/5">
                    <button
                        onClick={() => setTab('live')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic ${tab === 'live' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-white/40'}`}
                    >
                        Live Now (1)
                    </button>
                    <button
                        onClick={() => setTab('upcoming')}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic ${tab === 'upcoming' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-white/40'}`}
                    >
                        Upcoming (2)
                    </button>
                </div>

                {/* Tournament List */}
                <div className="space-y-6">
                    {filteredTournaments.map((t) => (
                        <GlassCard
                            key={t.id}
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
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 italic mb-2">Grand Prize Pool</span>
                                <div className="flex items-center gap-2">
                                    <h4 className={`text-4xl font-black italic tracking-tighter ${t.color === 'primary' ? 'text-primary' : t.color === 'accent-purple' ? 'text-accent-purple' : 'text-accent-gold'
                                        }`}>{t.prizePool}</h4>
                                    <span className="text-xl font-black opacity-20 italic">TON</span>
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

                            {/* Dynamic Countdown Ribbon */}
                            {t.status === 'live' && (
                                <div className="mt-6 flex items-center justify-between bg-primary/10 -mx-6 px-6 py-2 border-t border-primary/20">
                                    <div className="flex items-center gap-2">
                                        <Timer size={12} className="text-primary animate-spin-slow" />
                                        <span className="text-[10px] font-black text-primary uppercase italic tracking-widest">Ending in 01h 42m</span>
                                    </div>
                                    <span className="text-[px] font-black text-primary/40 uppercase tracking-tighter">Round 3/10</span>
                                </div>
                            )}
                        </GlassCard>
                    ))}
                </div>

                {/* Promotions */}
                <div className="mt-12 p-8 rounded-[2rem] bg-gradient-to-br from-accent-gold/20 to-transparent border border-accent-gold/20 relative overflow-hidden">
                    <Star className="absolute top-4 right-4 text-accent-gold opacity-20 h-24 w-24 -rotate-12" />
                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-accent-gold mb-2">Weekly Grand Slam</h3>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest leading-relaxed mb-6">Enter for a chance to win 5,000 TON and an exclusive NFT avatar frame.</p>
                    <button className="bg-accent-gold text-background-dark font-black px-8 py-3 rounded-full text-[10px] uppercase tracking-widest italic shadow-lg shadow-accent-gold/20 active:scale-95 transition-all">
                        PRE-REGISTER
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};
