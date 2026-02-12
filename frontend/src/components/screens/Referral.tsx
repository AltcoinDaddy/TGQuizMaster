import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Share2, Users, Receipt, Copy, Gift } from 'lucide-react';

export const Referral: React.FC = () => {
    const referralLink = "https://t.me/tgquizmaster_bot?start=r_alex123";

    const handleShare = () => {
        const inviteText = `I'm challenging you to a real-time quiz battle on TGQuizMaster! 🏆 Play & win TON. Join here: ${referralLink}`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(inviteText)}`;
        (window as any).Telegram?.WebApp?.openTelegramLink(url);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        (window as any).Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    };

    return (
        <MainLayout>
            <div className="text-center pb-6">
                <h2 className="text-2xl font-black text-white">Refer & Earn</h2>
                <p className="text-xs opacity-50 uppercase tracking-widest mt-1">Get 5% of their winnings</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <GlassCard className="flex flex-col items-center p-6 bg-gradient-to-b from-primary/10 to-transparent">
                    <Users size={28} className="text-primary mb-2" />
                    <span className="text-2xl font-black">24</span>
                    <span className="text-[10px] uppercase font-bold opacity-40">Total Referrals</span>
                </GlassCard>
                <GlassCard className="flex flex-col items-center p-6 bg-gradient-to-b from-blue-400/10 to-transparent">
                    <Receipt size={28} className="text-blue-400 mb-2" />
                    <span className="text-2xl font-black">12.50</span>
                    <span className="text-[10px] uppercase font-bold opacity-40">TON Earned</span>
                </GlassCard>
            </div>

            {/* Invite Section */}
            <GlassCard className="p-6 mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Gift size={24} className="text-primary" />
                    </div>
                    <div>
                        <h3 className="font-bold">How it works</h3>
                        <p className="text-xs opacity-60">Share your link. When your friends win in paid tournaments, you get 5% of their reward instantly!</p>
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
                <h3 className="font-black text-lg">Recent Referrals</h3>
                <div className="space-y-3">
                    <ReferralItem name="@Jon_Web3" date="2 hours ago" earned="+0.45 TON" />
                    <ReferralItem name="@Sarah_Crypto" date="Yesterday" earned="+1.20 TON" />
                    <ReferralItem name="@Mike_Bits" date="3 days ago" earned="+0.15 TON" />
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
            <span className="text-[8px] opacity-40 uppercase font-bold tracking-widest">Share Earned</span>
        </div>
    </GlassCard>
);
