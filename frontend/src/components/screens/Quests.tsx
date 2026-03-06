import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';
import { authPost } from '../../utils/authFetch';
import { useAppStore } from '../../store/useAppStore';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Zap, Gift, Lock, Trophy, Loader2, ChevronLeft, Twitter, Send, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    const { user } = useAppStore();
    const navigate = useNavigate();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [weeklyMilestone, setWeeklyMilestone] = useState({ current: 0, target: 15, reward: 'Epic Chest' });
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<string | null>(null);
    const [showReward, setShowReward] = useState(false);
    const [claimingQuest, setClaimingQuest] = useState<Quest | null>(null);

    useEffect(() => {
        const fetchQuests = async () => {
            if (!user.telegramId) return;
            try {
                setLoading(true); // Moved setLoading(true) here
                const res = await fetch(`${API_URL}/api/quests?telegramId=${user.telegramId}`);
                const data = await res.json();
                if (data.quests) {
                    // Map API status to UI icons (re-added this logic as it was removed in the snippet but needed for Quest interface)
                    const mappedQuests = data.quests.map((q: any) => {
                        let icon = <Gift size={24} />;
                        if (q.id === '1') icon = <Zap size={24} />;
                        else if (q.id === '2') icon = <Trophy size={24} />;
                        else if (q.id === '3') icon = <Gift size={24} />;
                        else if (q.id === '4') icon = <Send size={24} />;
                        else if (q.id === '5') icon = <Twitter size={24} />;

                        return { ...q, icon };
                    });
                    setQuests(mappedQuests);
                }
                if (data.weeklyMilestone) {
                    setWeeklyMilestone(data.weeklyMilestone);
                }
            } catch (e) {
                console.error('Failed to fetch quests:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchQuests();
    }, [user.telegramId]);

    const handleClaim = async (quest: Quest) => { // Changed back to Quest object for reward modal
        setClaiming(quest.id); // Use quest.id for claiming state
        try {
            const res = await authPost('/api/claim-quest', {
                telegramId: user.telegramId, questId: quest.id
            });
            const data = await res.json();

            if (res.ok && data.success) { // Check res.ok and data.success
                // Update local state
                setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, status: 'completed' } : q));
                // Update milestone if applicable
                setWeeklyMilestone(prev => ({ ...prev, current: prev.current + 1 }));

                // Show reward modal
                setClaimingQuest(quest); // Set the quest being claimed for the modal
                setShowReward(true);
                // User balance will be synced via socket/profile_synced eventually, 
                // but let's assume we want immediate feedback in real apps.
            } else {
                console.error('Failed to claim quest:', data.message || 'Unknown error');
                alert('Failed to claim quest');
            }
        } catch (e) {
            console.error('Claim error:', e);
            alert('Claim failed due to network error.');
        } finally {
            setClaiming(null);
        }
    };

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
                    <h1 className="text-xl font-black text-white">Quests</h1>
                </div>

                {/* Weekly Milestone */}
                <GlassCard className="p-6 mb-8 bg-gradient-to-br from-primary/20 to-transparent border-primary/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-colors duration-1000"></div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Weekly Milestone</p>
                                <h2 className="text-2xl font-black text-white italic tracking-tighter">Complete {weeklyMilestone.target} Quests</h2>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background-dark shadow-lg shadow-primary/20 animate-bounce-slow">
                                <Gift size={20} />
                            </div>
                        </div>

                        <div className="mb-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                                <span className="text-white/40">{weeklyMilestone.current}/{weeklyMilestone.target} Quests</span>
                                <span className="text-primary">{Math.round((weeklyMilestone.current / weeklyMilestone.target) * 100)}%</span>
                            </div>
                            <div className="h-3 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/5">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent-gold transition-all duration-1000 ease-out relative"
                                    style={{ width: `${Math.min(100, (weeklyMilestone.current / weeklyMilestone.target) * 100)}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Reward: <span className="text-white">{weeklyMilestone.reward}</span></span>
                        </div>
                    </div>
                </GlassCard>

                {/* Quest List */}
                <div className="space-y-4 mb-24">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-50">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            <p className="text-xs font-black uppercase tracking-widest">Syncing Quests...</p>
                        </div>
                    ) : (
                        quests.map((quest) => (
                            <GlassCard
                                key={quest.id}
                                className={`p-4 flex items-center gap-4 border-white/5 ${quest.status === 'locked' ? 'opacity-50 grayscale' : ''} ${quest.status === 'claimable' ? 'border-primary/40 shadow-[0_0_20px_rgba(13,242,89,0.1)]' : ''}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${quest.status === 'claimable'
                                    ? 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_15px_rgba(13,242,89,0.2)]'
                                    : 'bg-white/5 text-white/40 border-white/10'
                                    }`}>
                                    {React.cloneElement(quest.icon as React.ReactElement<any>, { size: 24 })}
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
                                        disabled={claiming === quest.id}
                                        className="bg-primary hover:bg-primary/90 text-background-dark font-black py-2 px-4 rounded-full text-[10px] uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center gap-1 disabled:opacity-70 disabled:active:scale-100"
                                    >
                                        {claiming === quest.id ? <Loader2 size={12} className="animate-spin" /> : 'CLAIM'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            if (quest.id === '4') window.open('https://t.me/TGQuizMaster', '_blank');
                                            else if (quest.id === '5') window.open('https://x.com/TGQuizMaster', '_blank');
                                        }}
                                        disabled={quest.status === 'locked' || quest.status === 'completed'}
                                        className={`py-2 px-4 rounded-full text-[10px] font-black uppercase transition-all ${quest.status === 'locked' ? 'bg-white/5 text-white/20' : (quest.status === 'completed' ? 'bg-white/5 text-primary opacity-50' : 'bg-white/10 hover:bg-white/20 text-white')}`}
                                    >
                                        {quest.status === 'locked' ? 'LOCKED' : (quest.status === 'completed' ? 'CLAIMED' : 'GO')}
                                    </button>
                                )}
                            </GlassCard>
                        ))
                    )}
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
                            <div className="bg-white/10 border border-white/20 px-8 py-4 rounded-[2rem] flex items-center gap-3 backdrop-blur-md shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-background-dark shadow-lg shadow-primary/20">
                                    <Star size={24} fill="currentColor" />
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-black text-2xl tracking-tighter leading-none">{claimingQuest?.reward.split(' ')[0]}</p>
                                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">{claimingQuest?.reward.split(' ')[1]}</p>
                                </div>
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
