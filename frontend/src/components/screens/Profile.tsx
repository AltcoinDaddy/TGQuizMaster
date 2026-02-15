import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Wallet, Settings, ChevronRight, LogOut, Award, PlayCircle, Zap, HelpCircle, ExternalLink, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useTonConnectUI } from '@tonconnect/ui-react';

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const user = useAppStore(state => state.user);

    const [tonConnectUI] = useTonConnectUI();

    const handleDisconnect = async () => {
        try {
            await tonConnectUI.disconnect();
            console.log('Wallet disconnected via SDK');
        } catch (e) {
            console.warn('Disconnect error (ignoring to force logout):', e);
        }

        // Visual feedback and navigation
        console.log('Processed wallet disconnect');
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.showAlert && typeof tg.showAlert === 'function') {
            try { tg.showAlert('Wallet Disconnected'); } catch (e) { console.warn(e); }
        }
        navigate('/');
    };

    const transactions = (user.transactions || []).map((tx: any) => ({
        id: tx.id,
        title: tx.metadata?.title || (tx.type === 'PRIZE' ? 'Prize Won' : tx.type === 'ENTRY_FEE' ? 'Tournament Entry' : 'Referral Bonus'),
        date: new Date(tx.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        amount: `${tx.amount > 0 ? '+' : ''}${tx.amount} ${tx.currency}`,
        type: tx.type === 'PRIZE' ? 'win' : tx.type === 'ENTRY_FEE' ? 'entry' : 'referral'
    }));

    return (
        <MainLayout>
            <div className="relative p-6 pt-4 pb-32">
                {/* V2 Header with Settings */}
                <header className="flex items-center justify-between mb-10">
                    <h1 className="text-xl font-black italic tracking-tighter uppercase">My Profile</h1>
                    <button onClick={() => navigate('/settings')} className="bg-white/5 p-2.5 rounded-2xl border border-white/10 text-white/40 hover:text-primary transition-all">
                        <Settings size={20} />
                    </button>
                </header>

                {/* Profile Card */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-125"></div>
                        <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            className="relative w-32 h-32 rounded-full border-4 border-primary shadow-[0_0_40px_rgba(13,242,89,0.4)] object-cover bg-background-dark p-1"
                            alt="Profile"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-primary text-background-dark flex items-center justify-center w-10 h-10 rounded-full border-4 border-background-dark shadow-xl">
                            <ShieldCheck size={20} />
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1 uppercase tracking-tighter leading-none">
                        {user.firstName || user.username}
                    </h2>
                    <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-6 italic opacity-80">@{user.username}</p>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-black italic">{user.wins}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Wins</span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-black italic">{user.xp}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">XP</span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-black italic">{user.totalGames}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Games</span>
                        </div>
                    </div>
                </div>

                {/* Premium Wallet Card */}
                <GlassCard className="p-6 mb-8 bg-gradient-to-br from-primary/10 to-transparent border-primary/20 bonus-glow">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Wallet className="text-primary" size={16} />
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] italic">Total Balance</h3>
                        </div>
                        <button className="text-[10px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1 hover:text-primary transition-colors">
                            TON SPACE <ExternalLink size={12} />
                        </button>
                    </div>

                    <div className="space-y-1 mb-8">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white italic tracking-tighter">{user.tonBalance?.toFixed(2) || '0.00'}</span>
                            <span className="text-lg font-black text-primary italic">TON</span>
                        </div>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest italic animate-pulse">≈ ${(user.tonBalance * 5.15).toFixed(2)} USD</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                // Simplified Deposit Alert/Modal
                                const tg = (window as any).Telegram?.WebApp;
                                tg?.showPopup({
                                    title: 'Deposit TON',
                                    message: `Send TON to your wallet address:\n\n${user.walletAddress || 'Please connect wallet first'}\n\n(Copy feature coming soon)`,
                                    buttons: [{ type: 'ok' }]
                                });
                            }}
                            className="bg-primary text-background-dark font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] italic shadow-lg shadow-primary/20 active:scale-95 transition-all"
                        >
                            DEPOSIT TON
                        </button>
                        <button
                            onClick={() => navigate('/withdrawal')}
                            className="bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] italic active:scale-95 transition-all"
                        >
                            WITHDRAW
                        </button>
                    </div>
                </GlassCard>

                {/* Recent Activity V2 */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic">Transaction Log</h3>
                        <button className="text-primary text-[9px] font-black uppercase tracking-widest italic">View All</button>
                    </div>
                    <div className="space-y-2">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'win' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'}`}>
                                        {tx.type === 'win' ? <Award size={18} /> : tx.type === 'entry' ? <PlayCircle size={18} /> : <Zap size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase italic tracking-tighter">{tx.title}</p>
                                        <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">{tx.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-black italic ${tx.amount.startsWith('+') ? 'text-primary' : 'text-accent-gold'}`}>{tx.amount}</p>
                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{tx.type.toUpperCase()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security & Support Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/referral')}
                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 active:bg-primary/20 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <Users size={18} className="text-primary" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest italic">Refer & Earn</span>
                        </div>
                        <ChevronRight size={14} className="text-primary/50" />
                    </button>

                    <button className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 active:bg-white/10 transition-all">
                        <div className="flex items-center gap-3">
                            <HelpCircle size={18} className="text-white/40" />
                            <span className="text-[10px] font-black text-white/80 uppercase tracking-widest italic">Support Center</span>
                        </div>
                        <ChevronRight size={14} className="text-white/20" />
                    </button>

                    <button
                        onClick={handleDisconnect}
                        className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 active:scale-[0.98] transition-all"
                    >
                        <LogOut size={16} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Disconnect Wallet</span>
                    </button>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em] italic mb-2">TGQuizMaster v1.0.4 Premium</p>
                    <div className="flex justify-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
                    </div>
                </div>
            </div >
        </MainLayout >
    );
};
