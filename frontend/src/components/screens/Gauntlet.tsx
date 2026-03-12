import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Flame, Zap, Skull, Shield, Target } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const Gauntlet: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAppStore();
 
    React.useEffect(() => {
        if (!user.chilizWalletConnected) {
            navigate('/', { replace: true });
        }
    }, [user.chilizWalletConnected, navigate]);

    // Reward tiers
    const tiers = [
        { streak: 10, reward: 1, label: 'Standard', color: 'text-white' },
        { streak: 15, reward: 2, label: 'Elite', color: 'text-primary' },
        { streak: 25, reward: 5, label: 'Legendary', color: 'text-primary animate-pulse' }
    ];

    return (
        <MainLayout showNav={true}>
            <div className="flex flex-col min-h-full pb-20">
                {/* Header Section */}
                <div className="pt-8 pb-6 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_40px_rgba(13,242,89,0.2)] animate-pulse mb-4">
                        <Flame size={48} className="text-primary" fill="currentColor" fillOpacity={0.2} />
                    </div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">The Gauntlet</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mt-2">Endless Survival • One Strike Out</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <GlassCard className="p-4 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 italic text-white/60">High Score</p>
                        <div className="flex items-center justify-center gap-2">
                            <Target size={14} className="text-primary" />
                            <span className="text-2xl font-black italic text-white">{(user as any).survival_high_score || 0}</span>
                        </div>
                    </GlassCard>
                    <GlassCard className="p-4 bg-white/5 border-white/10 text-center">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 italic text-white/60">Total Runs</p>
                        <div className="flex items-center justify-center gap-2">
                            <Zap size={14} className="text-primary" />
                            <span className="text-2xl font-black italic text-white">12</span> {/* Mock for now */}
                        </div>
                    </GlassCard>
                </div>

                {/* Rules & Rewards */}
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-2 mb-3">Gauntlet Rules</h2>
                <GlassCard className="p-5 space-y-4 mb-6 border-white/5 bg-white/2">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                            <Skull size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase italic tracking-widest text-white">Sudden Death</h4>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter mt-1 leading-tight">One wrong answer and your run ends immediately.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                            <Zap size={18} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black uppercase italic tracking-widest text-white">Ramping Voids</h4>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter mt-1 leading-tight">Timer decreases every 5 questions. SPEED IS CRITICAL.</p>
                        </div>
                    </div>
                </GlassCard>

                {/* Reward Ladder */}
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 px-2 mb-3">$CHZ Reward Ladder</h2>
                <div className="space-y-3 mb-8">
                    {tiers.map((t, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black italic ${t.color}`}>
                                    {t.streak}
                                </div>
                                <span className={`text-xs font-black uppercase tracking-widest ${t.color}`}>{t.label} Streak</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black italic text-white">{t.reward} <span className="text-[10px] text-primary">$CHZ</span></span>
                                <Shield size={14} className="text-primary/40" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Section */}
                <div className="mt-auto space-y-4">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">Entrance Fee: 5 $CHZ</p>
                    </div>
                    <button 
                        onClick={() => navigate('/quiz', { state: { type: 'survival', entryFee: 5, currency: 'CHZ' } })}
                        className="w-full py-5 bg-primary hover:opacity-90 text-background-dark font-black text-lg uppercase italic tracking-widest rounded-[28px] shadow-[0_0_30px_rgba(13,242,89,0.3)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                        <Flame size={20} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                        Enter The Gauntlet
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-white/5 border border-white/10 text-white/60 font-black text-xs uppercase tracking-widest rounded-[24px]"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};
