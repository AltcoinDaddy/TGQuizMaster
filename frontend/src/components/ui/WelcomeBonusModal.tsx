import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';
import { Gift, Star, PartyPopper } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const WelcomeBonusModal: React.FC = () => {
    const { user } = useAppStore();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Show modal if it's a new user (0 games played) 
        // and we haven't shown it this session
        // CRITICAL: Wait for isSynced to be true to avoid showing it for old users during initial load
        const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
        if (user.isSynced && user.telegramId && user.totalGames === 0 && user.xp === 0 && !hasSeenWelcome) {
            setIsVisible(true);
        }
    }, [user.isSynced, user.telegramId, user.totalGames, user.xp]);

    const handleClaim = () => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenWelcome', 'true');
        // Trigger haptics if available
        (window as any).Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <GlassCard className="w-full max-w-sm p-8 text-center bg-gradient-to-b from-primary/20 to-background-dark border-primary/30 shadow-[0_0_50px_rgba(13,242,89,0.15)] relative overflow-hidden group">
                {/* Background Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[80px]" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-6 animate-bounce shadow-[0_0_30px_rgba(13,242,89,0.3)]">
                        <Gift size={40} className="text-primary" />
                    </div>

                    <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2">Welcome, Champion! 🏆</h2>
                    <p className="text-xs opacity-60 uppercase tracking-widest font-bold mb-8">You've unlocked your starter bonus</p>

                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 w-full justify-center">
                        <span className="text-4xl font-black italic text-primary">+100</span>
                        <div className="flex flex-col items-start leading-none">
                            <Star size={18} className="text-primary fill-primary mb-1" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Stars</span>
                        </div>
                    </div>

                    <p className="text-[10px] text-white/50 leading-relaxed mb-8 px-4 font-bold uppercase tracking-wide">
                        Use your Stars to enter real-time tournaments and win rewards. Master the trivia to climb the global leaderboard!
                    </p>

                    <Button fullWidth onClick={handleClaim} className="py-4 text-base gap-2 group-hover:scale-[1.02] transition-transform">
                        <PartyPopper size={20} />
                        Let's Play!
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
};
