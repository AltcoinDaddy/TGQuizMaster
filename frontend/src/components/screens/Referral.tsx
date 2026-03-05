import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Share2, Users, Receipt, Copy, Gift, Award, Crown, Gem, Lock, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const TIERS = [
    {
        id: 'BRONZE',
        label: 'Bronze',
        threshold: 1,
        reward: '50 Stars Bonus',
        description: 'Refer your first friend',
        color: 'orange-500',
        bgColor: 'orange-500/10',
        borderColor: 'orange-500/30',
        icon: Award,
        emoji: '🥉'
    },
    {
        id: 'SILVER',
        label: 'Silver',
        threshold: 5,
        reward: 'Gold Name on Leaderboard',
        description: 'Your name glows gold in rankings',
        color: 'slate-300',
        bgColor: 'slate-300/10',
        borderColor: 'slate-300/30',
        icon: Crown,
        emoji: '🥈'
    },
    {
        id: 'GOLD',
        label: 'Gold',
        threshold: 20,
        reward: '5% Lifetime Commission',
        description: 'Earn from referrals\' purchases',
        color: 'amber-400',
        bgColor: 'amber-400/10',
        borderColor: 'amber-400/30',
        icon: Gem,
        emoji: '🥇'
    }
];

const TIER_ORDER = ['NONE', 'BRONZE', 'SILVER', 'GOLD'];

export const Referral: React.FC = () => {
    const { user } = useAppStore();
    const botUsername = import.meta.env.VITE_BOT_USERNAME || 'TGQuizMasters_bot';
    const referralLink = `https://t.me/${botUsername}?start=ref_${user.telegramId || 'unknown'}`;
    const referralCount = user.referralCount || 0;
    const currentTier = user.referralTier || 'NONE';
    const currentTierIndex = TIER_ORDER.indexOf(currentTier);

    const handleShare = () => {
        const inviteText = `I'm challenging you to a real-time quiz battle on TGQuizMaster! 🏆 Play & win TON. Join here: ${referralLink}`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(inviteText)}`;
        (window as any).Telegram?.WebApp?.openTelegramLink(url);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    };

    // Calculate progress to next tier
    const nextTier = TIERS.find(t => TIER_ORDER.indexOf(t.id) > currentTierIndex);
    const prevThreshold = currentTierIndex > 0 ? TIERS[currentTierIndex - 1]?.threshold || 0 : 0;
    const nextThreshold = nextTier ? nextTier.threshold : TIERS[TIERS.length - 1].threshold;
    const progressPercent = nextTier
        ? Math.min(100, ((referralCount - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
        : 100;

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <header className="text-center mb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Referral Program</span>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">Refer & Earn</h1>
                    <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1 font-bold">Unlock tiers. Earn forever.</p>
                </header>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <GlassCard className="flex flex-col items-center p-5 bg-gradient-to-b from-primary/10 to-transparent">
                        <Users size={24} className="text-primary mb-2" />
                        <span className="text-2xl font-black italic">{referralCount}</span>
                        <span className="text-[9px] uppercase font-black opacity-40 tracking-widest">Referrals</span>
                    </GlassCard>
                    <GlassCard className="flex flex-col items-center p-5 bg-gradient-to-b from-blue-400/10 to-transparent">
                        <Receipt size={24} className="text-blue-400 mb-2" />
                        <span className="text-2xl font-black italic">{(user.referralEarnings || 0).toFixed(2)}</span>
                        <span className="text-[9px] uppercase font-black opacity-40 tracking-widest">TON Earned</span>
                    </GlassCard>
                </div>

                {/* Current Tier Badge */}
                {currentTier !== 'NONE' && (
                    <div className="flex items-center justify-center mb-8">
                        <div className={`px-6 py-3 rounded-2xl border bg-gradient-to-r ${currentTier === 'GOLD' ? 'from-amber-400/20 to-amber-600/10 border-amber-400/40' :
                            currentTier === 'SILVER' ? 'from-slate-300/20 to-slate-500/10 border-slate-300/40' :
                                'from-orange-500/20 to-orange-700/10 border-orange-500/40'
                            }`}>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">
                                {TIERS.find(t => t.id === currentTier)?.emoji} {currentTier} REFERRER
                            </span>
                        </div>
                    </div>
                )}

                {/* Milestone Progress Tracker */}
                <div className="mb-10">
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic px-2 mb-4">Referral Milestones</h3>

                    <div className="space-y-3">
                        {TIERS.map((tier) => {
                            const tierIndex = TIER_ORDER.indexOf(tier.id);
                            const isUnlocked = currentTierIndex >= tierIndex;
                            const isCurrent = currentTier === tier.id;
                            const isNext = tierIndex === currentTierIndex + 1;
                            const TierIcon = tier.icon;

                            return (
                                <div
                                    key={tier.id}
                                    className={`relative p-5 rounded-2xl border transition-all ${isUnlocked
                                        ? isCurrent
                                            ? `bg-${tier.bgColor} border-${tier.borderColor} shadow-lg`
                                            : 'bg-white/5 border-white/10'
                                        : 'bg-white/[0.02] border-white/5 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isUnlocked ? `bg-${tier.bgColor}` : 'bg-white/5'
                                                }`}>
                                                {isUnlocked ? (
                                                    <TierIcon size={22} className={`text-${tier.color}`} />
                                                ) : (
                                                    <Lock size={18} className="text-white/20" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black uppercase italic tracking-tighter ${isUnlocked ? `text-${tier.color}` : 'text-white/40'
                                                        }`}>
                                                        {tier.emoji} {tier.label}
                                                    </span>
                                                    {isUnlocked && (
                                                        <span className="text-[8px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                            Unlocked
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-white/40 mt-0.5">{tier.description}</p>
                                                <p className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isUnlocked ? 'text-primary' : 'text-white/20'
                                                    }`}>
                                                    🎁 {tier.reward}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {isUnlocked ? (
                                                <Check size={20} className="text-primary" />
                                            ) : (
                                                <span className="text-[10px] font-black text-white/30 italic">
                                                    {tier.threshold} refs
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress bar for next tier */}
                                    {isNext && (
                                        <div className="mt-4">
                                            <div className="flex justify-between text-[8px] font-black uppercase tracking-wider mb-1 opacity-50">
                                                <span>{referralCount} / {tier.threshold}</span>
                                                <span>{Math.round(progressPercent)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary shadow-[0_0_10px_rgba(13,242,89,0.5)] transition-all duration-1000"
                                                    style={{ width: `${progressPercent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Invite Section */}
                <GlassCard className="p-6 mb-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Gift size={24} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold">How it works</h3>
                            <p className="text-xs opacity-60">Share your link. Unlock tiers as you refer more friends. Gold tier earns you lifetime commissions!</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-background-dark/50 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                            <code className="text-[10px] text-primary truncate font-display">
                                {referralLink}
                            </code>
                            <button onClick={copyToClipboard} className="text-primary hover:scale-110 active:scale-90 transition-transform">
                                <Copy size={18} />
                            </button>
                        </div>

                        <Button fullWidth className="gap-2" onClick={handleShare}>
                            <Share2 size={18} />
                            Share With Friends
                        </Button>
                    </div>
                </GlassCard>

                {/* Recent Referrals */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic px-2">Recent Referrals</h3>
                    <div className="space-y-3">
                        {user.referrals && user.referrals.length > 0 ? (
                            user.referrals.map((ref: any, index: number) => (
                                <ReferralItem
                                    key={index}
                                    name={ref.username || 'Unknown'}
                                    date={new Date(ref.date).toLocaleDateString()}
                                    earned={ref.earned || '+0.00 TON'}
                                />
                            ))
                        ) : (
                            <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-xs opacity-50 uppercase tracking-widest font-black italic">No referrals yet</p>
                                <p className="text-[10px] opacity-30 mt-1">Share your link to start earning!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

const ReferralItem = ({ name, date, earned }: any) => (
    <GlassCard className="flex items-center justify-between p-4 border-white/5">
        <div className="flex items-center gap-3">
            <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`}
                className="w-10 h-10 rounded-full border border-white/10"
                alt={name}
            />
            <div>
                <p className="font-bold text-sm">{name}</p>
                <p className="text-[10px] opacity-40 uppercase font-black">{date}</p>
            </div>
        </div>
        <div className="text-right">
            <span className="text-primary font-black block">{earned}</span>
            <span className="text-[8px] opacity-40 uppercase font-bold tracking-widest">Referral Bonus</span>
        </div>
    </GlassCard>
);
