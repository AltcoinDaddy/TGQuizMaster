import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Trophy, Zap, Share2, Wallet, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TournamentResults: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div className="relative pt-8 pb-32 px-6">
                {/* Glows */}
                <div className="fixed top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="fixed bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

                {/* Header */}
                <div className="text-center mb-10 relative z-10">
                    <span className="inline-block px-4 py-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase rounded-full mb-6">
                        Tournament Ended
                    </span>
                    <h1 className="text-6xl font-black text-white italic tracking-tighter mb-2 drop-shadow-[0_0_20px_rgba(13,242,89,0.5)]">
                        RANK <span className="text-primary">#1</span>
                    </h1>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs">You conquered the quiz!</p>
                </div>

                {/* Reward Card */}
                <GlassCard className="p-8 mb-8 relative overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Trophy size={120} className="text-primary" />
                    </div>

                    <div className="flex flex-col items-center justify-center space-y-3 mb-8">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Total Reward</span>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Wallet size={24} className="text-white" />
                            </div>
                            <span className="text-5xl font-black text-white italic">0.50 <span className="text-lg not-italic opacity-40 ml-1">TON</span></span>
                        </div>
                        <div className="text-primary font-black text-xl italic tracking-tight">~ $3.25 USD</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-8 border-t border-white/5">
                        <div className="text-center">
                            <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Total Points</div>
                            <div className="text-2xl font-black text-white">2,450</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Speed Bonus</div>
                            <div className="text-2xl font-black text-primary">+450</div>
                        </div>
                    </div>
                </GlassCard>

                {/* Performance Breakdown */}
                <div className="space-y-4 mb-8">
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-widest px-2">Performance Breakdown</h3>
                    <GlassCard className="divide-y divide-white/5 overflow-hidden">
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 size={18} className="text-primary/60" />
                                <span className="text-sm font-bold text-white/80">Accuracy (9/10)</span>
                            </div>
                            <span className="font-black text-white italic">1,800 pts</span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <Zap size={18} className="text-primary/60" />
                                <span className="text-sm font-bold text-white/80">Time Multiplier</span>
                            </div>
                            <span className="font-black text-white italic">x1.25</span>
                        </div>
                        <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                                <Users size={18} className="text-primary/60" />
                                <span className="text-sm font-bold text-white/80">Social Multiplier</span>
                            </div>
                            <span className="font-black text-white italic">x1.10</span>
                        </div>
                    </GlassCard>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 relative z-10">
                    <Button
                        fullWidth
                        onClick={() => navigate('/profile')}
                        className="py-5 text-xl gap-3 shadow-[0_0_30px_rgba(13,242,89,0.3)]"
                    >
                        <Wallet size={24} />
                        CLAIM REWARD
                    </Button>
                    <Button
                        fullWidth
                        variant="secondary"
                        className="py-5 text-xl gap-3 border-white/10"
                    >
                        <Share2 size={24} />
                        SHARE STATS
                    </Button>
                </div>
            </div>

            {/* Invite Referral Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-dark/90 backdrop-blur-xl border-t border-primary/10 z-50 lg:hidden">
                <GlassCard className="p-4 flex items-center justify-between gap-4 border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-3 text-left">
                        <div className="bg-primary/20 p-2 rounded-full text-primary">
                            <Zap size={18} />
                        </div>
                        <div>
                            <div className="text-sm font-black text-white">Invite a Friend</div>
                            <div className="text-[10px] text-white/40 uppercase font-bold tracking-tight">Get 5% of their winnings</div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/referral')}
                        className="bg-primary/20 hover:bg-primary/30 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Invite
                    </button>
                </GlassCard>
            </div>
        </MainLayout>
    );
};
