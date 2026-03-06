import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Wallet, Settings, ChevronRight, LogOut, Award, PlayCircle, Zap, HelpCircle, ExternalLink, Users, Target, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useTonConnectUI } from '@tonconnect/ui-react';

// Level System Constants (Mirroring Backend)
const LEVEL_THRESHOLDS = [
    { level: 1, xp: 0, title: 'Beginner' },
    { level: 2, xp: 100, title: 'Rookie' },
    { level: 3, xp: 300, title: 'Player' },
    { level: 4, xp: 600, title: 'Competitor' },
    { level: 5, xp: 1000, title: 'Expert' },
    { level: 6, xp: 1500, title: 'Master' },
    { level: 7, xp: 2500, title: 'Champion' },
    { level: 8, xp: 4000, title: 'Legend' },
    { level: 9, xp: 6000, title: 'Mythic' },
    { level: 10, xp: 10000, title: 'Immortal' },
];

function calculateLevelInfo(xp: number) {
    let current = LEVEL_THRESHOLDS[0];
    for (const t of LEVEL_THRESHOLDS) {
        if (xp >= t.xp) current = t;
        else break;
    }
    const nextIdx = LEVEL_THRESHOLDS.findIndex(t => t.level === current.level) + 1;
    const nextLevel = nextIdx < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[nextIdx] : null;

    // Calculate progress percentage
    let progress = 0;
    if (nextLevel) {
        const range = nextLevel.xp - current.xp;
        const gained = xp - current.xp;
        progress = Math.min(100, Math.max(0, (gained / range) * 100));
    } else {
        progress = 100; // Max level
    }

    return { current, nextLevel, progress };
}

export const Profile: React.FC = () => {
    const navigate = useNavigate();
    const user = useAppStore(state => state.user);
    const { current, nextLevel, progress } = calculateLevelInfo(user.xp || 0);

    const [tonConnectUI] = useTonConnectUI();
    // ... (keep handling disconnect same as before)

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
                            src={user.unlockedAvatars?.includes('PREMIUM_CYBER_AVATAR')
                                ? `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.username}`
                                : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                            className="relative w-32 h-32 rounded-full border-4 border-primary shadow-[0_0_40px_rgba(13,242,89,0.4)] object-cover bg-background-dark p-1"
                            alt="Profile"
                        />
                        <div className="absolute -bottom-1 -right-1 bg-primary text-background-dark flex items-center justify-center w-10 h-10 rounded-full border-4 border-background-dark shadow-xl">
                            <span className="font-black italic text-xs">Lvl {current.level}</span>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black text-white italic tracking-tighter mb-1 uppercase tracking-tighter leading-none">
                        {user.firstName || user.username}
                    </h2>
                    <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4 italic opacity-80">@{user.username}</p>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/60">{current.title}</p>
                    </div>

                    {/* Level Progress */}
                    <div className="w-full max-w-[200px] mb-8">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-wider mb-1 opacity-60">
                            <span>XP {user.xp || 0}</span>
                            <span>{nextLevel ? nextLevel.xp : 'MAX'}</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary shadow-[0_0_10px_rgba(13,242,89,0.5)] transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-black italic">{user.wins}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Wins</span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-black italic">{user.totalGames}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Games</span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-black italic text-primary">{(user.balanceQP || 0).toLocaleString()}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">QP</span>
                        </div>
                        <div className="w-[1px] h-8 bg-white/10"></div>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-black italic text-cyan-400">{user.balanceShards || 0}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Shards</span>
                        </div>
                    </div>

                    {/* Shard Progress */}
                    <div className="w-full max-w-[240px] mt-8 p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-2xl text-center">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 italic">Cyber Shards</span>
                            <span className="text-[10px] font-black text-white">{user.balanceShards || 0}/10</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-1000"
                                style={{ width: `${Math.min((user.balanceShards || 0) * 10, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-[8px] font-bold text-white/30 uppercase mt-2 tracking-tighter italic">
                            {user.unlockedAvatars?.includes('PREMIUM_CYBER_AVATAR')
                                ? '✨ PREMIUM AVATAR UNLOCKED'
                                : 'Collect 10 shards to unlock Premium Avatar'}
                        </p>
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
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest italic animate-pulse">≈ ${((user.tonBalance ?? 0) * 5.15).toFixed(2)} USD</p>
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

                {/* Power-Ups Inventory */}
                <div className="mb-10">
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic px-2 mb-4">Power-Ups Inventory</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                                    <Target size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tighter">50/50</span>
                            </div>
                            <span className="text-sm font-black italic text-primary">x{user.inventoryPowerups?.pu_5050 || 0}</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 border border-yellow-400/20 group-hover:scale-110 transition-transform">
                                    <Timer size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tighter">Extra Time</span>
                            </div>
                            <span className="text-sm font-black italic text-yellow-400">x{user.inventoryPowerups?.pu_time || 0}</span>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent-purple/10 flex items-center justify-center text-accent-purple border border-accent-purple/20 group-hover:scale-110 transition-transform">
                                    <Zap size={20} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tighter">2x Points</span>
                            </div>
                            <span className="text-sm font-black italic text-accent-purple">x{user.inventoryPowerups?.pu_double || 0}</span>
                        </div>
                    </div>
                </div>

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
                        onClick={() => navigate('/tournament-history')}
                        className="w-full flex items-center justify-between p-5 rounded-2xl bg-white/5 border border-white/5 active:bg-white/10 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <Award size={18} className="text-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Tournament History</span>
                        </div>
                        <ChevronRight size={14} className="text-white/20" />
                    </button>

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

                    <button
                        onClick={() => navigate('/squads')}
                        className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all ${user.squadId ? 'bg-amber-500/10 border-amber-500/20 active:bg-amber-500/20' : 'bg-white/5 border-white/5 active:bg-white/10'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Users size={18} className={user.squadId ? 'text-amber-500' : 'text-white/40'} />
                            <div className="text-left">
                                <span className={`text-[10px] font-black uppercase tracking-widest italic block ${user.squadId ? 'text-amber-500' : 'text-white/80'}`}>
                                    {user.squadId ? 'My Squad' : 'Squads & Battles'}
                                </span>
                                {user.squadId && (
                                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest italic tracking-tighter">
                                        [{user.squadName}] • Global Rank #4
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!user.squadId && <span className="text-[8px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded italic">100 TON</span>}
                            <ChevronRight size={14} className={user.squadId ? 'text-amber-500/50' : 'text-white/20'} />
                        </div>
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
