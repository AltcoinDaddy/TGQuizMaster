import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Button } from '../ui/Button';
import { CheckCircle2, ChevronRight, Share2, Wallet, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WithdrawalSuccess: React.FC = () => {
    const navigate = useNavigate();

    return (
        <MainLayout showHeader={false} showNav={false}>
            <div className="relative min-h-screen flex flex-col items-center justify-between p-8 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>

                {/* Hero */}
                <div className="text-center relative z-10 pt-20 animate-in fade-in slide-in-from-top-10 duration-700">
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(13,242,89,0.5)]">
                        <CheckCircle2 size={56} className="text-background-dark" />
                    </div>
                    <h1 className="text-5xl font-black text-white italic tracking-tighter mb-2">SUCCESS!</h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Withdrawal Initiated</p>
                </div>

                {/* Details */}
                <div className="relative z-10 w-full animate-in zoom-in duration-700 delay-200">
                    <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 backdrop-blur-xl text-center">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-4">You Received</p>
                        <div className="text-5xl font-black text-white italic italic mb-4">5.35 <span className="text-lg not-italic opacity-40">TON</span></div>

                        <div className="h-[1px] bg-white/5 my-8"></div>

                        <div className="space-y-6">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Transferred to</span>
                                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                                    <Wallet size={12} className="text-white/40" />
                                    <span className="font-mono text-xs font-bold text-white/60">EQB1...4z9p</span>
                                </div>
                            </div>

                            <button className="flex items-center gap-2 mx-auto text-primary text-[8px] font-black uppercase tracking-widest italic active:scale-95 transition-all">
                                VIEW ON TON SCAN
                                <ExternalLink size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="relative z-10 w-full space-y-4 pb-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
                    <Button
                        fullWidth
                        size="lg"
                        onClick={() => navigate('/profile')}
                        className="py-5 text-xl font-black italic tracking-widest shadow-[0_10px_30px_rgba(13,242,89,0.3)]"
                    >
                        BACK TO PROFILE
                        <ChevronRight size={24} />
                    </Button>
                    <button className="w-full flex items-center justify-center gap-3 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-white transition-all">
                        <Share2 size={16} />
                        SHARE SUCCESS
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};
