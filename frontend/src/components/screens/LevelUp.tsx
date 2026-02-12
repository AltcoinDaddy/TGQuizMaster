import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Button } from '../ui/Button';
import { Trophy, Star, ArrowRight, Share2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LevelUp: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MainLayout showHeader={false} showNav={false}>
            <div className="relative min-h-screen flex flex-col items-center justify-between p-8 overflow-hidden">
                {/* Background Rays */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

                {/* Header */}
                <div className="text-center relative z-10 pt-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <span className="text-primary font-black tracking-[0.3em] text-[10px] uppercase mb-4 block">New Milestone Reached</span>
                    <h1 className="text-6xl font-black text-white italic italic tracking-tighter drop-shadow-[0_0_20px_rgba(242,204,13,0.5)]">LEVEL UP!</h1>
                </div>

                {/* Center Content: Level Gem */}
                <div className="relative z-10 flex items-center justify-center animate-in zoom-in duration-700 delay-200">
                    <div className="w-64 h-64 rounded-full border-[10px] border-primary/20 flex items-center justify-center relative bg-background-dark shadow-[0_0_50px_rgba(242,204,13,0.2)]">
                        <div className="absolute inset-0 border-[10px] border-primary rounded-full shadow-[0_0_30px_rgba(242,204,13,0.5)]" style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 10% 0%)' }}></div>
                        <div className="text-[140px] leading-none font-black text-primary italic drop-shadow-2xl">10</div>
                    </div>
                    {/* Particles */}
                    <div className="absolute -top-10 -right-5 text-4xl animate-bounce">✨</div>
                    <div className="absolute bottom-10 -left-10 text-3xl animate-pulse">⭐</div>
                </div>

                {/* Rewards */}
                <div className="relative z-10 w-full text-center space-y-6">
                    <div>
                        <h2 className="text-2xl font-black text-white italic italic uppercase tracking-tighter">Quiz Expert Unlocked</h2>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">You're crushing the leaderboards!</p>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 backdrop-blur-xl">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-6">Rewards Unlocked</p>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="flex flex-col items-center gap-2 group">
                                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Trophy size={32} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight opacity-60">New Badge</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group">
                                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <Star size={32} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight opacity-60">+100 Stars</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 group">
                                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary relative overflow-hidden group-hover:scale-110 transition-transform">
                                    <Sparkles size={32} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-tight opacity-60">Pro Frame</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="relative z-10 w-full space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
                    <Button
                        fullWidth
                        size="lg"
                        onClick={() => navigate('/')}
                        className="py-5 text-xl font-black italic italic tracking-widest shadow-[0_10px_30px_rgba(242,204,13,0.3)]"
                    >
                        CONTINUE
                        <ArrowRight size={24} />
                    </Button>
                    <Button
                        fullWidth
                        variant="secondary"
                        className="py-4 text-sm font-black uppercase tracking-widest bg-white/5 border-white/10"
                    >
                        <Share2 size={20} className="mr-2" />
                        SHARE RANK
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
};
