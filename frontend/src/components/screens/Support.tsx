import React, { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { ChevronLeft, Search, MessageSquare, Bug, Activity, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const Support: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAppStore();
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    const faqs = [
        {
            id: '1',
            category: 'Payments & CHZ',
            questions: [
                { q: 'How do I link my Chiliz wallet?', a: 'Go to the Profile tab, click "Link Wallet" and follow the prompts from your preferred wallet via AppKit.' },
                { q: 'How long do withdrawals take?', a: 'Most withdrawals are instant, but some may take up to 24 hours for security review.' }
            ]
        },
        {
            id: '2',
            category: 'Gameplay Rules',
            questions: [
                { q: 'How are points calculated?', a: 'Points are based on accuracy and speed. Faster answers get more points!' },
                { q: 'What is Knowledge Yield?', a: 'A passive earning mechanism where you accumulate $QUIZ Airdrop Points hourly. Collect them in the "Yield" tab.' }
            ]
        }
    ];

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white">Help & Support</h1>
                </div>

                {/* Search */}
                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search size={18} className="text-primary/60" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search for help..."
                        className="w-full bg-white/5 border border-white/10 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold transition-all outline-none"
                    />
                </div>

                {/* Quick Actions */}
                <div className="space-y-4 mb-10">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-2">Quick Actions</h2>
                    <button className="w-full flex items-center gap-4 p-5 rounded-3xl bg-primary text-background-dark font-black italic active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(242,204,13,0.2)]">
                        <div className="w-12 h-12 rounded-full bg-background-dark/10 flex items-center justify-center">
                            <MessageSquare size={24} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm leading-tight">CONTACT SUPPORT</p>
                            <p className="text-[10px] font-bold opacity-60 uppercase tracking-wider">Chat with @SupportBot</p>
                        </div>
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate('/bug-report')}
                            className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white/5 border border-white/10 active:scale-95 transition-all"
                        >
                            <Bug size={24} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Report Bug</span>
                        </button>
                        {user.isAdmin && (
                            <button
                                onClick={() => navigate('/admin')}
                                className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-white/5 border border-white/10 active:scale-95 transition-all"
                            >
                                <Activity size={24} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Admin Stats</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* FAQ */}
                <div className="space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary px-2">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqs.map((cat) => (
                            <GlassCard key={cat.id} className="overflow-hidden border-white/5">
                                <button
                                    onClick={() => setOpenFaq(openFaq === cat.id ? null : cat.id)}
                                    className="w-full flex items-center justify-between p-5 focus:outline-none"
                                >
                                    <span className="font-black text-sm uppercase tracking-wide text-white/80">{cat.category}</span>
                                    {openFaq === cat.id ? <ChevronUp size={20} className="text-primary" /> : <ChevronDown size={20} className="text-primary/50" />}
                                </button>
                                {openFaq === cat.id && (
                                    <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-6">
                                        {cat.questions.map((q, idx) => (
                                            <div key={idx}>
                                                <p className="text-[10px] font-black text-primary mb-2 uppercase tracking-tight">{q.q}</p>
                                                <p className="text-xs text-white/40 font-bold leading-relaxed">{q.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        ))}
                    </div>
                </div>

                {/* Footer Status */}
                <div className="mt-12 flex flex-col items-center opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <HelpCircle size={40} className="text-primary" />
                    </div>
                    <p className="text-[10px] font-black tracking-[0.2em] text-primary uppercase">Still need help?</p>
                    <p className="text-xs font-bold text-white/40 mt-1 uppercase">Our team is available 24/7</p>
                </div>
            </div>
        </MainLayout>
    );
};
