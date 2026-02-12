import React, { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Zap, Star, Gift, Lock, Trophy, Sparkles } from 'lucide-react';

interface Quest {
    id: string;
    title: string;
    progress: number;
    total: number;
    reward: string;
    type: 'stars' | 'xp';
    status: 'in-progress' | 'claimable' | 'completed' | 'locked';
    icon: React.ReactNode;
}

export const Quests: React.FC = () => {
    const [showReward, setShowReward] = useState(false);
    const [claimingQuest, setClaimingQuest] = useState<Quest | null>(null);

    const quests: Quest[] = [
        {
            id: '1',
            title: 'Play 3 Free Quizzes',
            progress: 1,
            total: 3,
            reward: '+20 Stars',
            type: 'stars',
            status: 'in-progress',
            icon: <Zap size={24} />
        },
        {
            id: '2',
            title: 'Win a Tournament',
            progress: 0,
            total: 1,
            reward: '+100 XP',
            type: 'xp',
            status: 'in-progress',
            icon: <Trophy size={24} />
        },
        {
            id: '3',
            title: 'Invite 1 Friend',
            progress: 1,
            total: 1,
            reward: '+50 Stars',
            type: 'stars',
            status: 'claimable',
            icon: <Gift size={24} />
        },
        {
            id: '4',
            title: 'Premium Daily',
            progress: 0,
            total: 1,
            reward: '+200 Stars',
            type: 'stars',
            status: 'locked',
            icon: <Sparkles size={24} />
        }
    ];

    const handleClaim = (quest: Quest) => {
        setClaimingQuest(quest);
        setShowReward(true);
    };

    return (
        <MainLayout>
            <div className="p-6 pt-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-black text-white">Quests</h1>
                        <div className="flex items-center mt-1 gap-2 text-primary">
                            <Zap size={14} />
                            <span className="text-xs font-bold uppercase tracking-wider">Resets in 18h 45m</span>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-bold">1,240</span>
                    </div>
                </div>

                {/* Weekly Milestone */}
                <GlassCard className="p-4 mb-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Weekly Milestone</h2>
                        <span className="text-xs font-black text-primary">12/15 Quests</span>
                    </div>
                    <div className="relative h-6 bg-background-dark rounded-full overflow-hidden flex items-center p-1 border border-white/5">
                        <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(13,242,89,0.5)]" style={{ width: '80%' }}></div>
                    </div>
                    <p className="mt-3 text-[10px] text-center text-white/40 font-medium italic">Complete 3 more to unlock the Epic Mystery Chest!</p>
                </GlassCard>

                {/* Quest List */}
                <div className="space-y-4 mb-24">
                    {quests.map((quest) => (
                        <GlassCard
                            key={quest.id}
                            className={`p-4 flex items-center gap-4 border-white/5 ${quest.status === 'locked' ? 'opacity-50 grayscale' : ''} ${quest.status === 'claimable' ? 'border-primary/40 shadow-[0_0_20px_rgba(13,242,89,0.1)]' : ''}`}
                        >
                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${quest.status === 'claimable' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-background-dark text-white/60 border-white/10'}`}>
                                {quest.icon}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-sm truncate">{quest.title}</h3>
                                    {quest.status === 'locked' && <Lock size={12} className="text-white/40" />}
                                </div>

                                <div className="w-full bg-background-dark h-2 rounded-full overflow-hidden border border-white/5 mb-1">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                                    ></div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className={`text-[10px] font-black uppercase tracking-wider ${quest.status === 'claimable' ? 'text-primary' : 'text-white/40'}`}>
                                        {quest.status === 'claimable' ? 'COMPLETED' : `${quest.progress} / ${quest.total}`}
                                    </span>
                                    <span className="text-[10px] font-black text-primary">{quest.reward}</span>
                                </div>
                            </div>

                            {quest.status === 'claimable' ? (
                                <button
                                    onClick={() => handleClaim(quest)}
                                    className="bg-primary hover:bg-primary/90 text-background-dark font-black py-2 px-4 rounded-full text-[10px] uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                >
                                    CLAIM
                                </button>
                            ) : (
                                <button
                                    disabled={quest.status === 'locked'}
                                    className={`py-2 px-4 rounded-full text-[10px] font-black uppercase transition-all ${quest.status === 'locked' ? 'bg-white/5 text-white/20' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                >
                                    {quest.status === 'locked' ? 'LOCKED' : 'GO'}
                                </button>
                            )}
                        </GlassCard>
                    ))}
                </div>
            </div>

            {/* Reward Modal */}
            {showReward && (
                <div className="fixed inset-0 bg-background-dark/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="relative w-full max-w-sm flex flex-col items-center">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>

                        <div className="relative z-10 w-64 h-64 mb-8">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCgjHD79ri_y3juSvxGwpuRXkYmgYz6owPiVGTo3YWYlIfXW-5ucFB5SyYRfwKnY0OTr9QSMVYG99EyjI4B-2lbp0u-8gwekAh3AH_-QzIf9LUmwOssdMNYxllfY0BrWewpLolcevTFcvEY1wiWYul8TXyhLzG-inP_fjMB12yR4fLt7IXCA1k065AiCIh287WXXUsqrZVfwfdKSSN-F3sopwZCqUwEF3HWVHARkDCK8V3eEWbx0fMgBqH8Np2IpehJOu3p20hOXo"
                                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(13,242,89,0.5)]"
                                alt="Chest"
                            />
                        </div>

                        <div className="text-center mb-8 relative z-10">
                            <h2 className="text-4xl font-black text-white mb-2">Success!</h2>
                            <p className="text-primary/70 font-bold uppercase tracking-widest text-xs">Quest Rewards Unlocked</p>
                        </div>

                        <div className="flex gap-4 mb-10 relative z-10">
                            <div className="bg-white/10 border border-white/20 px-6 py-3 rounded-2xl flex items-center gap-2 backdrop-blur-md shadow-xl">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background-dark">
                                    <Sparkles size={18} />
                                </div>
                                <span className="text-white font-black text-xl">{claimingQuest?.reward.split(' ')[0]}</span>
                                <span className="text-[10px] font-bold opacity-50 uppercase">{claimingQuest?.reward.split(' ')[1]}</span>
                            </div>
                        </div>

                        <Button
                            fullWidth
                            onClick={() => setShowReward(false)}
                            className="py-5 text-xl relative z-10"
                        >
                            AWESOME!
                        </Button>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};
