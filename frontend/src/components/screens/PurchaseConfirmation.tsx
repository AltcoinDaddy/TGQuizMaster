import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { Star, ChevronLeft, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PurchaseConfirmation: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white">Confirm Purchase</h1>
                    <div className="w-10"></div>
                </div>

                {/* Hero Product */}
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-3xl scale-150 animate-pulse"></div>
                        <div className="relative w-32 h-32 bg-background-dark border-4 border-yellow-400 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                            <Star size={64} className="text-yellow-400 fill-yellow-400" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-white italic italic tracking-tighter mb-2">STAR CHEST</h2>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">6,000 PREMIUM STARS</p>
                </div>

                {/* Details */}
                <div className="space-y-4 mb-10">
                    <GlassCard className="p-6 border-white/5 bg-white/5 space-y-6">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/30">Price</span>
                            <span className="text-white font-black text-sm italic italic tracking-tighter">250 STARS</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/30">Bonus Reward</span>
                            <span className="text-primary font-black text-sm italic italic tracking-tighter">+500 XP</span>
                        </div>
                        <div className="h-[1px] bg-white/5"></div>
                        <div className="flex justify-between items-center italic italic font-black">
                            <span className="text-[10px] uppercase tracking-widest text-white/30">Total Balance After</span>
                            <span className="text-xl text-yellow-400">7,240 ★</span>
                        </div>
                    </GlassCard>

                    <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                        <ShieldCheck size={18} className="text-primary" />
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wide">Secure Transaction via Telegram Stars</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <Button
                        fullWidth
                        size="lg"
                        onClick={() => navigate('/shop')}
                        className="py-5 text-xl italic font-black tracking-widest shadow-[0_10px_30px_rgba(242,204,13,0.3)]"
                    >
                        COMPLETE PURCHASE
                        <Zap size={20} className="ml-2" />
                    </Button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full text-white/30 font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl active:bg-white/5 transition-all"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};
