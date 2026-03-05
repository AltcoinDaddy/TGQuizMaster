import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';
import { MainLayout } from '../layout/MainLayout';
import { Trophy, Star, ChevronRight, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Leaderboard: React.FC = () => {
    const { user } = useAppStore();
    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'allTime'>('weekly'); // Keeping for UI compliance

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(`${API_URL}/api/leaderboard?period=${activeTab}`);
                const data = await res.json();
                if (data.leaderboard) {
                    const formattedDetails = data.leaderboard.map((p: any) => ({
                        ...p,
                        isUser: p.telegramId === user.telegramId,
                        isTop: p.rank === 1
                    }));
                    setLeaderboardData(formattedDetails);
                }
            } catch (e) {
                console.error('Failed to fetch leaderboard:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [user.telegramId, activeTab]);

    const topPlayers = loading
        ? [{ rank: 1, name: "Loading...", reward: "---", score: "---" }]
        : leaderboardData.length > 0
            ? leaderboardData
            : [{ rank: 1, name: "No Players Yet", reward: "---", score: "---" }];

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* V2 Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Global Arena</span>
                        <h1 className="text-2xl font-black italic tracking-tighter uppercase">Hall of Fame</h1>
                    </div>
                    <div className="bg-primary/10 p-2.5 rounded-2xl border border-primary/20 text-primary">
                        <Trophy size={20} />
                    </div>
                </header>

                {/* Segmented Time Filter */}
                <div className="flex bg-white/5 p-1 rounded-[1.5rem] mb-10 border border-white/5">
                    {['daily', 'weekly', 'allTime'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all italic ${activeTab === tab ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'opacity-40 hover:opacity-100'}`}
                        >
                            {tab === 'allTime' ? 'All-Time' : tab}
                        </button>
                    ))}
                </div>

                {/* Premium Pedestal Podium */}
                <div className="flex items-end justify-center gap-2 mb-12 h-64 relative">
                    <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-75 -z-10"></div>

                    {/* Top 3 Rendering - Dynamic */}
                    {loading ? (
                        <div className="flex items-center justify-center w-full h-48 animate-pulse text-white/20 font-black italic">LOADING ARENA...</div>
                    ) : (
                        <>
                            {/* Rank 2 - Silver Pedestal */}
                            <div className="flex flex-col items-center flex-1">
                                {topPlayers[1] && (
                                    <>
                                        <div className="relative mb-3">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topPlayers[1].name}`} className="w-14 h-14 rounded-full border-2 border-slate-400 object-cover p-1 bg-background-dark" alt="2nd" />
                                            <div className="absolute -bottom-1 -right-1 bg-slate-400 text-[8px] font-black text-white px-2 py-0.5 rounded-full border-2 border-background-dark">2nd</div>
                                        </div>
                                        <div className="w-full bg-gradient-to-b from-slate-400/20 to-transparent h-24 rounded-t-3xl flex flex-col items-center pt-4 border-t-2 border-slate-400/40">
                                            <span className={`text-[9px] font-black uppercase italic tracking-tighter truncate w-16 text-center ${topPlayers[1].hasGoldName ? 'text-amber-400' : 'text-slate-300'}`}>{topPlayers[1].name}{topPlayers[1].hasGoldName && ' ✨'}</span>
                                            <span className="text-xs font-black text-white italic">{topPlayers[1].reward}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Rank 1 - Golden Pedestal (Center) */}
                            <div className="flex flex-col items-center flex-1 scale-110 relative z-10 -top-4">
                                {topPlayers[0] && (
                                    <>
                                        <div className="relative mb-3">
                                            <div className="absolute inset-0 bg-accent-gold/20 blur-xl rounded-full"></div>
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topPlayers[0].name}`} className="relative w-18 h-18 rounded-full border-4 border-accent-gold object-cover p-1 bg-background-dark" alt="1st" />
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl drop-shadow-lg">👑</div>
                                            <div className="absolute -bottom-1 -right-1 bg-accent-gold text-[8px] font-black text-background-dark px-2 py-0.5 rounded-full border-2 border-background-dark">1st</div>
                                        </div>
                                        <div className="w-full bg-gradient-to-b from-accent-gold/30 to-transparent h-36 rounded-t-[2.5rem] flex flex-col items-center pt-6 border-t-4 border-accent-gold/50 bonus-glow">
                                            <span className={`text-[10px] font-black uppercase italic tracking-tighter truncate w-20 text-center ${topPlayers[0].hasGoldName ? 'text-amber-400' : 'text-accent-gold'}`}>{topPlayers[0].name}{topPlayers[0].hasGoldName && ' ✨'}</span>
                                            <span className="text-sm font-black text-white italic">{topPlayers[0].reward}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Rank 3 - Bronze Pedestal */}
                            <div className="flex flex-col items-center flex-1">
                                {topPlayers[2] && (
                                    <>
                                        <div className="relative mb-3">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${topPlayers[2].name}`} className="w-14 h-14 rounded-full border-2 border-orange-500/60 object-cover p-1 bg-background-dark" alt="3rd" />
                                            <div className="absolute -bottom-1 -right-1 bg-orange-600 text-[8px] font-black text-white px-2 py-0.5 rounded-full border-2 border-background-dark">3rd</div>
                                        </div>
                                        <div className="w-full bg-gradient-to-b from-orange-500/20 to-transparent h-20 rounded-t-3xl flex flex-col items-center pt-4 border-t-2 border-orange-500/40">
                                            <span className={`text-[9px] font-black uppercase italic tracking-tighter truncate w-16 text-center ${topPlayers[2].hasGoldName ? 'text-amber-400' : 'text-orange-200'}`}>{topPlayers[2].name}{topPlayers[2].hasGoldName && ' ✨'}</span>
                                            <span className="text-xs font-black text-white italic">{topPlayers[2].reward}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Competition List */}
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic">Tournament Masters</h3>
                    <div className="flex items-center gap-1 text-[8px] font-black text-primary uppercase tracking-widest italic animate-pulse">
                        <TrendingUp size={10} /> Live Stats
                    </div>
                </div>

                <div className="space-y-3">
                    {topPlayers.slice(3).map((player) => (
                        <div
                            key={player.rank}
                            className={`p-4 rounded-[1.5rem] flex items-center justify-between transition-all border ${player.isUser ? 'bg-primary/10 border-primary/30 day-active-glow' : 'bg-white/5 border-white/5'}`}
                        >
                            <div className="flex items-center gap-4">
                                <span className={`font-black italic text-xl w-6 ${player.isUser ? 'text-primary' : 'opacity-20'}`}>{player.rank}</span>
                                <div className="relative">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`} className="w-12 h-12 rounded-full border-2 border-white/10 p-0.5 bg-background-dark" alt={player.name} />
                                    {player.isUser && <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background-dark"></div>}
                                </div>
                                <div className="min-w-0">
                                    <p className={`font-black text-sm uppercase italic tracking-tighter truncate w-32 ${player.hasGoldName ? 'text-amber-400' : player.isUser ? 'text-primary' : 'text-white'}`}>{player.name}{player.hasGoldName && ' ✨'}</p>
                                    <div className="flex items-center gap-3 opacity-40">
                                        <div className="flex items-center gap-1">
                                            <Star size={8} className="text-primary fill-primary" />
                                            <span className="text-[8px] uppercase font-black italic tracking-widest">{player.score}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Trophy size={8} className="text-primary" />
                                            <span className="text-[8px] uppercase font-black italic tracking-widest">{player.totalWins} Wins</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`font-black italic text-sm block ${player.isUser ? 'text-primary' : 'text-white'}`}>{player.reward}</span>
                                <span className="text-[8px] opacity-20 uppercase font-black tracking-widest">Total XP</span>
                            </div>
                        </div>
                    ))}

                    {/* More... */}
                    <button className="w-full py-6 flex items-center justify-center gap-2 text-white/20 hover:text-primary transition-colors active:scale-95">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Load Full Rankings</span>
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};
