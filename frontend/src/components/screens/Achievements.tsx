import React, { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ChevronLeft, Lock, Share2, Star, Zap, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Badge {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    status: 'unlocked' | 'locked';
    date?: string;
    rarity: 'Common' | 'Rare' | 'Legendary';
    color: string;
}

export const Achievements: React.FC = () => {
    const navigate = useNavigate();
    const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

    const badges: Badge[] = [
        {
            id: '1',
            title: '10 Day Streak',
            description: "You've maintained perfect daily activity for 10 consecutive days.",
            icon: <Zap size={32} />,
            status: 'unlocked',
            date: 'Oct 12, 2023',
            rarity: 'Legendary',
            color: 'primary'
        },
        {
            id: '2',
            title: 'Crypto King',
            description: 'Win 5 tournaments in the Crypto category.',
            icon: <Star size={32} />,
            status: 'unlocked',
            date: 'Oct 15, 2023',
            rarity: 'Rare',
            color: 'yellow-400'
        },
        {
            id: '3',
            title: 'Mind Reader',
            description: 'Answer 10 questions correctly in under 1 second.',
            icon: <Sparkles size={32} />,
            status: 'locked',
            rarity: 'Legendary',
            color: 'purple-400'
        },
        {
            id: '4',
            title: 'Guardian',
            description: 'Use 50 shields to protect your streak.',
            icon: <Shield size={32} />,
            status: 'locked',
            rarity: 'Rare',
            color: 'blue-400'
        }
    ];

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white">Achievements</h1>
                </div>

                {/* Score Card */}
                <GlassCard className="p-6 mb-10 bg-gradient-to-br from-primary/20 to-transparent border-primary/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Total Score</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-4xl font-black text-primary italic">2,450</span>
                                    <span className="text-xs font-bold opacity-40 uppercase">pts</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="inline-block px-3 py-1 rounded-full bg-primary text-background-dark text-[8px] font-black uppercase tracking-widest mb-2">Quiz Novice</span>
                                <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Next: <span className="text-primary italic">Quiz Master</span></p>
                            </div>
                        </div>
                        <div className="w-full h-2.5 bg-background-dark rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(242,185,13,0.5)]" style={{ width: '72%' }}></div>
                        </div>
                    </div>
                </GlassCard>

                {/* Badges Grid */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Your Badges</h2>
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">12 / 24 UNLOCKED</span>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            onClick={() => setSelectedBadge(badge)}
                            className="flex flex-col items-center gap-2 group cursor-pointer transition-all active:scale-95"
                        >
                            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${badge.status === 'unlocked' ? `bg-background-dark border-${badge.color} ring-8 ring-${badge.color}/10 shadow-[0_0_20px_rgba(242,185,13,0.1)]` : 'bg-white/5 border-white/10 opacity-40 grayscale'}`}>
                                {badge.status === 'unlocked' ? (
                                    <div className={`text-${badge.color}`}>
                                        {badge.icon}
                                    </div>
                                ) : (
                                    <Lock size={24} className="text-white/20" />
                                )}
                            </div>
                            <span className={`text-[10px] font-black text-center leading-tight uppercase tracking-wider ${badge.status === 'unlocked' ? 'text-white' : 'text-white/20'}`}>
                                {badge.title}
                            </span>
                        </div>
                    ))}
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
                                {React.cloneElement(selectedBadge.icon as React.ReactElement<{ size?: number; className?: string }>, { size: 48, className: selectedBadge.status === 'unlocked' ? `text-${selectedBadge.color}` : 'text-white/40' })}
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
