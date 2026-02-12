import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';
import { ShieldAlert, Zap, Sparkles, Check, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdFreeUpsell: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div className="relative min-h-screen flex flex-col p-6 pt-4 pb-32">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white">Premium Access</h1>
                </div>

                {/* Hero */}
                <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[3rem] p-10 mb-8 overflow-hidden shadow-[0_20px_50px_rgba(79,70,229,0.3)] group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <ShieldAlert size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                            <Sparkles className="text-white" size={24} />
                        </div>
                        <h2 className="text-4xl font-black text-white italic italic tracking-tighter mb-2 leading-none uppercase">GO AD-FREE</h2>
                        <p className="text-white/60 font-bold text-[10px] uppercase tracking-[0.2em]">Unlock the ultimate quiz experience</p>
                    </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-12 flex-1">
                    <BenefitItem text="Zero intrusive ads between quizzes" />
                    <BenefitItem text="Double daily quest rewards" />
                    <BenefitItem text="Exclusive 'Legend' badge & frame" />
                    <BenefitItem text="Priority matchmaking in tournaments" />
                    <BenefitItem text="Exclusive weekly prize pools" />
                </div>

                {/* Pricing / CTA */}
                <div className="space-y-4">
                    <GlassCard className="p-6 flex items-center justify-between border-primary/20 bg-primary/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Monthly Pass</span>
                            <span className="text-3xl font-black text-white italic italic">2.50 <span className="text-sm not-italic opacity-40">TON</span></span>
                        </div>
                        <div className="bg-primary text-background-dark px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                            SAVE 20%
                        </div>
                    </GlassCard>

                    <Button
                        fullWidth
                        size="lg"
                        onClick={() => navigate('/shop')}
                        className="py-5 text-xl italic font-black tracking-widest shadow-[0_10px_30px_rgba(13,242,89,0.2)]"
                    >
                        UPGRADE NOW
                        <Zap size={24} className="ml-2" />
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
};

const BenefitItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/5 border border-white/5 transition-all hover:bg-white/10">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
            <Check size={14} />
        </div>
        <span className="text-xs font-bold text-white/70 uppercase tracking-tight">{text}</span>
    </div>
);
