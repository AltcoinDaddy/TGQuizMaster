import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Brain, Zap, Sparkles, TrendingUp, Info, Loader2, Trophy } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { API_URL } from '../../config/api';
import { authPost } from '../../utils/authFetch';

export const KnowledgeYield: React.FC = () => {
    const { user } = useAppStore();
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [displayAccumulated, setDisplayAccumulated] = useState(0);

    const fetchStatus = async () => {
        try {
            const res = await fetch(`${API_URL}/api/qp-status?telegramId=${user.telegramId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            const data = await res.json();
            setStatus(data);
            setDisplayAccumulated(data.accumulated || 0);
            // Sync to global store
            useAppStore.getState().setUser({ balanceQP: Number(data.balance) });
        } catch (e) {
            console.error('Failed to fetch QP status:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Poll every 30 seconds for server sync
        const poll = setInterval(fetchStatus, 30000);
        return () => clearInterval(poll);
    }, []);

    // Local tick for smooth counter
    useEffect(() => {
        if (!status || status.accumulated >= status.maxCapacity) return;

        const tickRate = status.rate / 3600; // QP per second
        const tickInterval = setInterval(() => {
            setDisplayAccumulated(prev => {
                const next = prev + tickRate;
                return next >= status.maxCapacity ? status.maxCapacity : next;
            });
        }, 1000);

        return () => clearInterval(tickInterval);
    }, [status]);

    const handleClaim = async () => {
        if (displayAccumulated < 1 || claiming) return;

        setClaiming(true);
        try {
            const res = await authPost('/api/claim-qp', { telegramId: user.telegramId });
            const data = await res.json();

            if (data.success) {
                const tg = (window as any).Telegram?.WebApp;
                if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');

                // Update global store
                useAppStore.getState().setUser({ balanceQP: Number(data.newBalance) });

                // Refresh local status
                await fetchStatus();
            } else {
                const tg = (window as any).Telegram?.WebApp;
                if (tg?.showAlert) tg.showAlert(data.error || 'Claim failed');
            }
        } catch (e: any) {
            console.error('Claim failed:', e);
            const tg = (window as any).Telegram?.WebApp;
            if (tg?.showAlert) tg.showAlert('Server error. Please try again.');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-50">
                    <Loader2 className="animate-spin text-primary mb-4" size={32} />
                    <p className="font-black uppercase tracking-widest text-[10px]">Syncing Brain Waves...</p>
                </div>
            </MainLayout>
        );
    }

    const progress = status ? (displayAccumulated / status.maxCapacity) * 100 : 0;
    const isBoosted = status?.boostUntil && new Date(status.boostUntil) > new Date();

    return (
        <MainLayout>
            <div className="text-center pb-4">
                <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Knowledge Yield</h2>
                <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.2em] mt-2">Earn $QUIZ Airdrop Points Passively</p>
            </div>

            {/* Main Gauge */}
            <GlassCard className="p-6 relative overflow-hidden flex flex-col items-center justify-center aspect-square rounded-[3rem] border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
                {/* Unified SVG Ring */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                        {/* Background Ring */}
                        <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="6"
                            className="text-white/5"
                        />
                        {/* Progress Ring */}
                        <circle
                            cx="50"
                            cy="50"
                            r="44"
                            fill="transparent"
                            stroke="currentColor"
                            strokeWidth="6"
                            strokeDasharray={2 * Math.PI * 44}
                            strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
                            strokeLinecap="round"
                            className="text-primary transition-all duration-1000 ease-linear"
                        />
                    </svg>
                </div>

                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto border border-primary/30">
                        <Brain size={40} className={`text-primary ${progress > 90 ? 'animate-pulse' : ''}`} />
                    </div>

                    {/* Total Balance Mini Display */}
                    <div className="flex items-center justify-center gap-1.5 mb-2 opacity-40">
                        <Sparkles size={10} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Total: {(user.balanceQP || 0).toLocaleString()} QP</span>
                    </div>

                    <div className="text-5xl font-black text-white tracking-tighter mb-1">
                        {Math.floor(displayAccumulated).toLocaleString()}
                    </div>
                    <div className="text-[10px] font-black uppercase text-primary tracking-widest opacity-60 italic">QP ACCUMULATED</div>
                </div>

                {progress >= 100 && (
                    <div className="absolute top-10 flex items-center gap-2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce">
                        <Sparkles size={12} /> Capacity Full
                    </div>
                )}
            </GlassCard>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4 flex flex-col items-center">
                    <TrendingUp size={20} className="text-primary mb-2" />
                    <span className="text-lg font-black">{status?.rate} QP/h</span>
                    <span className="text-[8px] uppercase font-bold opacity-40">Yield Speed</span>
                </GlassCard>
                <GlassCard className={`p-4 flex flex-col items-center transition-all ${isBoosted ? 'bg-primary/20 border-primary/40' : ''}`}>
                    <Zap size={20} className={`${isBoosted ? 'text-primary' : 'text-white/20'} mb-2`} />
                    <span className="text-lg font-black">{isBoosted ? 'ACTIVE' : 'NONE'}</span>
                    <span className="text-[8px] uppercase font-bold opacity-40">Win Booster</span>
                </GlassCard>
            </div>

            {/* Claim Section */}
            <div className="space-y-4">
                <Button
                    fullWidth
                    size="lg"
                    className="h-16 text-lg tracking-widest"
                    disabled={displayAccumulated < 1 || claiming}
                    onClick={handleClaim}
                >
                    {claiming ? <Loader2 className="animate-spin" /> : 'COLLECT KNOWLEDGE'}
                </Button>
                <p className="text-[10px] text-center opacity-40 font-bold uppercase tracking-widest">
                    Your Capacity: {status?.maxCapacity} QP ({progress.toFixed(1)}%)
                </p>
            </div>

            {/* Info Section */}
            <GlassCard className="p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Info size={20} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-black text-sm uppercase italic tracking-tighter">What are Quiz Points?</h3>
                        <p className="text-[10px] opacity-60 font-medium leading-relaxed mt-1">
                            QP measures your cerebral contribution to the TGQuizMaster network. The higher your total QP balance, the larger your share of the upcoming <span className="text-primary font-black">$QUIZ Token Airdrop</span>.
                        </p>
                    </div>
                </div>

                <div className="space-y-3 pt-2">
                    <BoostItem
                        icon={<Trophy size={14} />}
                        title="Win Booster"
                        desc="Win any Star tournament to get +50% speed for 1 hour."
                        active={isBoosted}
                    />
                    <BoostItem
                        icon={<TrendingUp size={14} />}
                        title="Chain Streak"
                        desc="Claim daily to maintain your base yield rate."
                        active={true}
                    />
                </div>
            </GlassCard>
        </MainLayout>
    );
};

const BoostItem = ({ icon, title, desc, active }: any) => (
    <div className={`p-3 rounded-2xl border flex items-center gap-3 transition-colors ${active ? 'bg-primary/5 border-primary/20' : 'bg-black/20 border-white/5 opacity-50'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-primary text-background-dark' : 'bg-white/5 text-white/40'}`}>
            {icon}
        </div>
        <div className="flex-1">
            <h4 className="text-[10px] font-black uppercase italic tracking-tighter leading-none">{title}</h4>
            <p className="text-[8px] font-bold opacity-60 mt-1 uppercase tracking-tighter">{desc}</p>
        </div>
        {active && <Sparkles size={14} className="text-primary fill-primary" />}
    </div>
);
