import React, { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ChevronLeft, Lock, Share2, Star, Zap, Shield, Sparkles, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: any; // Using any for component reference to simplify
    status: 'unlocked' | 'locked';
    date?: string;
    rarity: string;
    color: string;
}

export const Achievements: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAppStore();
    const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
    const [achievements, setAchievements] = React.useState<Achievement[]>([]);
    const [scoreData, setScoreData] = React.useState({
        total: 0,
        rank: 'Novice',
        nextRank: 'Master',
        progress: 0,
        unlockedCount: 0,
        totalCount: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchAchievements = async () => {
            if (!user.telegramId) return;
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/achievements?telegramId=${user.telegramId}`);
                const data = await res.json();

                if (data.achievements) {
                    // Map icon strings to components
                    const mapIcons = (items: any[]) => items.map(item => ({
                        ...item,
                        icon: item.icon === 'Zap' ? Zap : (item.icon === 'Star' ? Star : (item.icon === 'Sparkles' ? Sparkles : Shield))
                    }));

                    setAchievements(mapIcons(data.achievements));
                    setScoreData({
                        total: data.score.total,
                        rank: data.score.rank,
                        nextRank: data.score.nextRank,
                        progress: data.score.progress,
                        unlockedCount: data.unlockedCount,
                        totalCount: data.totalCount
                    });
                }
            } catch (e) {
                console.error('Failed to fetch achievements:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchAchievements();
    }, [user.telegramId]);

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h1 className="text-xl font-black italic tracking-tighter uppercase">Achievements</h1>
                    </div>
                </header>

                {/* Total Score Card */}
                <GlassCard className="p-6 mb-8 bg-gradient-to-br from-primary/20 to-transparent border-primary/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-colors duration-1000"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total Score</p>
                                <h2 className="text-4xl font-black text-white italic tracking-tighter">{scoreData.total.toLocaleString()}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Rank</p>
                                <span className="text-xl font-black text-white italic tracking-tighter uppercase">{scoreData.rank}</span>
                            </div>
                        </div>

                        {/* Progress */}
                        <div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                                <span className="text-white/40">Next: {scoreData.nextRank}</span>
                                <span className="text-primary">{scoreData.progress}%</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent-gold transition-all duration-1000 ease-out relative"
                                    style={{ width: `${scoreData.progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Filter Tabs */}
                {/* ... existing filter tabs ... */}

                {/* Achievements List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-10 opacity-50 text-xs font-bold uppercase tracking-widest">Loading achievements...</div>
                    ) : (
                        achievements.map((badge) => (
                            <GlassCard
                                key={badge.id}
                                onClick={() => setSelectedBadge(badge)}
                                className={`p-1 relative overflow-hidden transition-all duration-300 ${badge.status === 'locked'
                                    ? 'opacity-60 grayscale-[0.8]'
                                    : 'hover:scale-[1.02] hover:-translate-y-1'
                                    }`}
                            >
                                {/* ... Content ... */}
                                <div className={`p-5 rounded-[1.25rem] bg-background-dark/50 backdrop-blur-md h-full border ${badge.status === 'locked' ? 'border-white/5' : 'border-white/10'
                                    }`}>
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${badge.status === 'locked'
                                            ? 'bg-white/5 text-white/20'
                                            : `bg-${badge.color}/20 text-${badge.color} shadow-[0_0_15px_rgba(var(--${badge.color}-rgb),0.2)]`
                                            }`}>
                                            {badge.status === 'locked' ? <Lock size={20} /> : <badge.icon size={24} />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className={`font-black uppercase italic tracking-tighter ${badge.status === 'locked' ? 'text-white/40' : 'text-white'
                                                    }`}>
                                                    {badge.title}
                                                </h3>
                                                {badge.status === 'unlocked' && (
                                                    <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                        Unlocked
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-[10px] text-white/40 font-bold leading-relaxed mb-3 line-clamp-2">
                                                {badge.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded ${badge.status === 'locked'
                                                    ? 'bg-white/5 text-white/30'
                                                    : `bg-${badge.color}/10 text-${badge.color} border border-${badge.color}/20`
                                                    }`}>
                                                    {badge.rarity}
                                                </span>

                                                {badge.date && (
                                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {badge.date}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        )))}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedBadge && (
                <div
                    className="fixed inset-0 z-[100] flex items-end justify-center animate-in fade-in duration-300"
                    onClick={() => setSelectedBadge(null)}
                >
                    <div className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-md bg-background-dark border-t border-primary/20 rounded-t-[3rem] p-8 pb-12 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-full duration-500"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />

                        <div className="flex flex-col items-center text-center">
                            <div className={`w-32 h-32 rounded-full border-4 ${selectedBadge.status === 'unlocked' ? `border-${selectedBadge.color} bg-background-dark ring-[1.5rem] ring-${selectedBadge.color}/5` : 'border-white/10 bg-white/5 opacity-40'} flex items-center justify-center mb-8`}>
                                {React.createElement(selectedBadge.icon, { size: 48, className: selectedBadge.status === 'unlocked' ? `text-${selectedBadge.color}` : 'text-white/40' })}
                            </div>

                            <h3 className={`text-3xl font-black mb-2 italic tracking-tighter ${selectedBadge.status === 'unlocked' ? `text-${selectedBadge.color}` : 'text-white/40'}`}>
                                {selectedBadge.title}
                            </h3>

                            <p className="text-sm opacity-60 font-bold uppercase tracking-wider text-[10px] leading-relaxed mb-8 max-w-[250px]">
                                {selectedBadge.description}
                            </p>

                            <div className="w-full grid grid-cols-2 gap-4 mb-10 text-[10px] font-black uppercase tracking-widest">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="opacity-30 mb-1">Earned</p>
                                    <p className="text-white">{selectedBadge.date || 'LOCKED'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <p className="opacity-30 mb-1">Rarity</p>
                                    <p className={`text-${selectedBadge.color}`}>{selectedBadge.rarity}</p>
                                </div>
                            </div>

                            <Button
                                fullWidth
                                onClick={() => setSelectedBadge(null)}
                                className={`py-5 text-xl gap-3 ${selectedBadge.status === 'unlocked' ? '' : 'grayscale opacity-50'}`}
                            >
                                <Share2 size={24} />
                                SHARE ACHIEVEMENT
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};
