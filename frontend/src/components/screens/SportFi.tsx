import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Trophy, ArrowRight, Zap, Star, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const SportFi: React.FC = () => {
    const navigate = useNavigate();
    const { user, setChilizWallet } = useAppStore();
    const [isLinking, setIsLinking] = React.useState(false);
    const [chilizInput, setChilizInput] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [activeTrack, setActiveTrack] = React.useState<'SOCIAL' | 'PRO'>('SOCIAL');

    // Filter $CHZ specific rewards for the recent list
    const chzRewards = user.transactions?.filter(t => t.currency === 'CHZ') || [];
    const internalCHZBalance = user.balanceCHZ || 0;
    const onChainCHZBalance = user.onChainCHZBalance || 0;
    const totalCHZ = internalCHZBalance + onChainCHZBalance;

    const holdsFanToken = (user.onChainFanTokenBalance || 0) > 0;
    const canEnterFanClash = holdsFanToken;
    const canEnterGauntlet = totalCHZ >= 5;
    const canEnterPro = totalCHZ >= 10;

    React.useEffect(() => {
        const { socket } = import.meta.env.DEV ? (window as any) : { socket: null };
        const realSocket = socket || (window as any).socket;

        if (!realSocket) return;

        const onUpdated = (data: any) => {
            console.log('[SPORTFI] Wallet updated confirmation:', data);
            setChilizWallet(data.chilizWalletConnected, data.chilizWalletAddress);
            setLoading(false);
            setIsLinking(false);
        };

        const onError = (err: any) => {
            alert(err.message || 'Failed to update wallet');
            setLoading(false);
        };

        realSocket.on('chiliz_wallet_updated', onUpdated);
        realSocket.on('error', onError);

        return () => {
            realSocket.off('chiliz_wallet_updated', onUpdated);
            realSocket.off('error', onError);
        };
    }, [setChilizWallet]);

    const handleLinkChiliz = async () => {
        if (!chilizInput.startsWith('0x') || chilizInput.length !== 42) {
            alert('Please enter a valid Chiliz/EVM address starting with 0x');
            return;
        }

        setLoading(true);
        const { socket } = import.meta.env.DEV ? (window as any) : { socket: null };
        const realSocket = socket || (window as any).socket;

        if (realSocket) {
            realSocket.emit('update_chiliz_wallet', { 
                telegramId: user.telegramId,
                username: user.username,
                chilizAddress: chilizInput 
            });
        } else {
            alert('Connection pending. Please wait...');
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <header className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic underline decoration-primary/30 underline-offset-4">Powered by Chiliz</span>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(13,242,89,0.3)]">SportFi Arena</h1>
                    </div>
                    {user.chilizWalletConnected ? (
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest mb-1 italic">Chiliz Elite</span>
                            <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black italic">
                                {user.chilizWalletAddress?.slice(0, 6)}...{user.chilizWalletAddress?.slice(-4)}
                            </div>
                        </div>
                    ) : (
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_20px_rgba(13,242,89,0.1)]">
                            <Trophy size={24} />
                        </div>
                    )}
                </header>

                <div className="space-y-6">
                    {!user.chilizWalletConnected ? (
                        /* LOCKED STATE: For Non-Members */
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6 border border-primary/20 shadow-[0_0_40px_rgba(13,242,89,0.2)] animate-pulse">
                                <Trophy size={48} />
                            </div>
                            <h2 className="text-2xl font-black italic uppercase text-white mb-2 tracking-tighter text-balance">Elite Access Only</h2>
                            <p className="text-xs text-white/40 font-bold max-w-[240px] mb-8 uppercase tracking-widest leading-relaxed">
                                This Arena is exclusive to the <span className="text-primary">Chiliz Community</span>. Hold Fan Tokens to enter.
                            </p>

                            <div className="w-full space-y-3">
                                {!isLinking ? (
                                    <button
                                        onClick={() => setIsLinking(true)}
                                        className="w-full py-4 rounded-2xl bg-primary text-background-dark font-black uppercase italic tracking-tighter shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Zap size={18} fill="currentColor" />
                                        Link Chiliz Wallet
                                    </button>
                                ) : (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <input
                                            type="text"
                                            placeholder="Enter 0x... address"
                                            value={chilizInput}
                                            onChange={(e) => setChilizInput(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-white/20 font-bold focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsLinking(false)}
                                                className="flex-1 py-4 rounded-2xl bg-white/5 text-white/60 font-black uppercase italic tracking-tighter hover:bg-white/10 transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleLinkChiliz}
                                                disabled={loading}
                                                className="flex-[2] py-4 rounded-2xl bg-primary text-background-dark font-black uppercase italic tracking-tighter shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                                            >
                                                {loading ? 'Verifying...' : 'Verify & Link'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="p-[1px] rounded-2xl bg-gradient-to-r from-primary/50 to-transparent">
                                    <button
                                        onClick={() => window.open('https://www.socios.com/', '_blank')}
                                        className="w-full py-4 rounded-2xl bg-background-dark/90 text-white font-black uppercase italic tracking-tighter hover:bg-background-dark transition-all flex items-center justify-center gap-2 border border-white/5"
                                    >
                                        Get Fan Tokens
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-12 grid grid-cols-2 gap-4 w-full opacity-50">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                                    <Star size={20} className="text-accent-gold mb-2" fill="currentColor" />
                                    <span className="text-[8px] font-black uppercase text-white/60">Win $CHZ</span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center">
                                    <Trophy size={20} className="text-primary mb-2" />
                                    <span className="text-[8px] font-black uppercase text-white/60">Pro Badges</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ACTIVE STATE: For Members */
                        <>
                            {/* Chiliz Wallet Card */}
                            <GlassCard className="p-5 mb-8 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60 italic">My SportFi Wallet</span>
                                            {holdsFanToken && (
                                                <span className="text-[8px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30 uppercase italic">Verified Fan Holder</span>
                                            )}
                                        </div>
                                        <h3 className="text-3xl font-black italic tracking-tighter text-white">
                                            {(user.onChainCHZBalance || 0).toLocaleString()} <span className="text-primary text-xl">$CHZ</span>
                                        </h3>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => window.open('https://chiliz.com/exchange', '_blank')}
                                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase italic tracking-tighter hover:bg-white/10 transition-all"
                                        >
                                            Deposit
                                        </button>
                                        <button 
                                            onClick={() => alert('Withdrawal request submitted! Payouts processed within 24h to your linked address.')}
                                            className="px-4 py-2 rounded-xl bg-primary text-background-dark text-[10px] font-black uppercase italic tracking-tighter shadow-lg shadow-primary/20 active:scale-95 transition-all"
                                        >
                                            Withdraw
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-background-dark/50 rounded-2xl border border-white/5">
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                    <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">
                                        Linked: {user.chilizWalletAddress}
                                    </span>
                                </div>
                            </GlassCard>
 
                            {/* The Gauntlet (Survival) Entry Card - SportFi Exclusive */}
                            <div 
                                onClick={() => {
                                    if (canEnterGauntlet) {
                                        navigate('/gauntlet');
                                    } else {
                                        window.open('https://chiliz.com/exchange', '_blank');
                                    }
                                }}
                                className={`mb-8 bg-gradient-to-br from-primary/10 via-black/40 to-black/60 border rounded-3xl p-6 relative overflow-hidden group cursor-pointer transition-all active:scale-95 ${
                                    canEnterGauntlet 
                                    ? 'border-primary/20 shadow-[0_0_20px_rgba(13,242,89,0.1)]' 
                                    : 'border-white/5 opacity-80 grayscale-[0.5]'
                                }`}
                            >
                                {!canEnterGauntlet && (
                                    <div className="absolute inset-0 bg-background-dark/40 backdrop-blur-[1px] flex items-center justify-end pr-10 z-20">
                                        <div className="flex flex-col items-end">
                                            <span className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded italic mb-1">INSUFFICIENT $CHZ</span>
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Needs 5 $CHZ</span>
                                        </div>
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-[0_0_15px_rgba(13,242,89,0.2)] group-hover:scale-110 transition-transform">
                                        <Flame size={32} fill="currentColor" fillOpacity={0.1} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-xl uppercase italic tracking-tighter text-white">The Gauntlet</h3>
                                            <span className="bg-primary text-background-dark text-[8px] font-black px-2 py-0.5 rounded italic animate-pulse">EXTREME SURVIVAL</span>
                                        </div>
                                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">
                                            Sudden Death • Win real $CHZ for high streaks.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        {canEnterGauntlet ? (
                                            <ArrowRight size={24} className="text-primary opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        ) : (
                                            <Zap size={24} className="text-white/20" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Track Selector */}
                            <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 mb-6">
                                <button
                                    onClick={() => setActiveTrack('SOCIAL')}
                                    className={`flex-1 py-3 rounded-xl font-black uppercase italic tracking-tighter text-xs transition-all ${
                                        activeTrack === 'SOCIAL' 
                                        ? 'bg-primary text-background-dark shadow-lg shadow-primary/20 scale-[1.02]' 
                                        : 'text-white/40 hover:text-white/60'
                                    }`}
                                >
                                    Social Arena
                                </button>
                                <button
                                    onClick={() => setActiveTrack('PRO')}
                                    className={`flex-1 py-3 rounded-xl font-black uppercase italic tracking-tighter text-xs transition-all ${
                                        activeTrack === 'PRO' 
                                        ? 'bg-accent-gold text-background-dark shadow-lg shadow-accent-gold/20 scale-[1.02]' 
                                        : 'text-white/40 hover:text-white/60'
                                    }`}
                                >
                                    Pro Arena
                                </button>
                            </div>

                            {activeTrack === 'SOCIAL' ? (
                                /* SOCIAL TRACK CARDS */
                                <div className="space-y-4">
                                    <GlassCard
                                        onClick={() => {
                                            if (canEnterFanClash) {
                                                navigate('/quiz', { state: { roomType: 'sportfi', track: 'SOCIAL', category: 'Sports', entryFee: 'Free' } });
                                            } else {
                                                window.open('https://www.socios.com/', '_blank');
                                            }
                                        }}
                                        className={`group p-6 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer h-56 flex flex-col justify-between ${
                                            canEnterFanClash ? 'border-primary/20 bonus-glow' : 'border-white/5 grayscale-[0.8] opacity-60'
                                        }`}
                                    >
                                        {!canEnterFanClash && (
                                            <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 text-center px-4">
                                                <Trophy size={32} className="text-white/20 mb-3" />
                                                <span className="bg-white/10 text-white text-[8px] font-black px-2 py-1 rounded italic mb-2 tracking-[0.2em]">LOCKED</span>
                                                <p className="text-[10px] font-black text-white/60 uppercase tracking-tighter leading-tight">
                                                    Hold 1+ Fan Token to unlock<br/>this daily arena.
                                                </p>
                                                <span className="mt-4 text-[9px] font-black text-primary underline underline-offset-4 tracking-[0.1em]">GET TOKENS NOW</span>
                                            </div>
                                        )}
                                        <div className="absolute top-0 right-0 bg-primary px-4 py-1.5 rounded-bl-2xl shadow-lg">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-background-dark">FAN EXCLUSIVE</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20">
                                                    <Trophy size={24} />
                                                </div>
                                                <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Daily Fan Clash</h2>
                                            </div>
                                            <p className="text-xs text-white/50 font-bold max-w-[200px]">Hold 1+ Fan Token for FREE ENTRY. Earn Stars, XP & QP!</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Entry</span>
                                                    <span className="text-sm font-black italic text-primary">FREE</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Rewards</span>
                                                    <span className="text-sm font-black italic text-accent-gold">Stars + XP</span>
                                                </div>
                                            </div>
                                            <div className="bg-primary p-3 rounded-xl text-background-dark group-hover:translate-x-1 transition-transform shadow-lg shadow-primary/20">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </GlassCard>
                                </div>
                            ) : (
                                /* PRO TRACK CARDS */
                                <div className="space-y-4">
                                    <GlassCard
                                        onClick={() => {
                                            if (canEnterPro) {
                                                navigate('/quiz', { state: { roomType: 'sportfi', track: 'PRO', category: 'Sports', entryFee: '10 $CHZ' } });
                                            } else {
                                                window.open('https://chiliz.com/exchange', '_blank');
                                            }
                                        }}
                                        className={`group p-6 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer h-56 flex flex-col justify-between shadow-[0_0_30px_rgba(255,215,0,0.05)] ${
                                            canEnterPro ? 'border-accent-gold/20' : 'border-white/5 grayscale opacity-60'
                                        }`}
                                    >
                                        {!canEnterPro && (
                                            <div className="absolute inset-0 bg-background-dark/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 text-center px-4">
                                                <Zap size={32} className="text-white/20 mb-3" />
                                                <span className="bg-red-500/20 text-red-500 text-[8px] font-black px-2 py-1 rounded italic mb-2 tracking-[0.2em]">INSUFFICIENT FUNDS</span>
                                                <p className="text-[10px] font-black text-white/60 uppercase tracking-tighter leading-tight">
                                                    Needs 10 $CHZ for Pro entry.<br/>(Total: {totalCHZ} $CHZ)
                                                </p>
                                                <span className="mt-4 text-[9px] font-black text-accent-gold underline underline-offset-4 tracking-[0.1em]">TOP UP $CHZ</span>
                                            </div>
                                        )}
                                        <div className="absolute top-0 right-0 bg-accent-gold px-4 py-1.5 rounded-bl-2xl shadow-lg">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-background-dark">STAKES MATCH</span>
                                        </div>

                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-3 bg-accent-gold/10 rounded-xl text-accent-gold border border-accent-gold/20">
                                                    <Zap size={24} fill="currentColor" fillOpacity={0.1} />
                                                </div>
                                                <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Chiliz Pro League</h2>
                                            </div>
                                            <p className="text-xs text-white/50 font-bold max-w-[200px]">Stake 10 $CHZ. Winner takes the shared Prize Pool!</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Entry Fee</span>
                                                    <span className="text-sm font-black italic text-accent-gold">10 $CHZ</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Prize Pool</span>
                                                    <span className="text-sm font-black italic text-primary">Dynamic $CHZ</span>
                                                </div>
                                            </div>
                                            <div className="bg-accent-gold p-3 rounded-xl text-background-dark group-hover:translate-x-1 transition-transform shadow-lg shadow-accent-gold/20">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </GlassCard>
                                </div>
                            )}

                            {/* Entertainment Card (Always Available or Contextual) */}
                            <GlassCard
                                onClick={() => navigate('/quiz', { state: { type: 'mega', category: 'Entertainment', entryFee: '10 Stars' } })}
                                className="group p-6 mt-4 relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer border-white/5 h-48 flex flex-col justify-between"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-3 bg-yellow-400/10 rounded-xl text-yellow-400 border border-yellow-400/20">
                                        <Star size={24} fill="currentColor" fillOpacity={0.1} />
                                    </div>
                                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">Entertainment Stars</h2>
                                </div>

                                <p className="text-xs text-white/40 font-bold">Pop culture, music, and movies. Compete for the ultimate fan badge.</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-background-dark bg-white/5 overflow-hidden">
                                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=ent${i}`} alt="player" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">124 Players</span>
                                        <div className="bg-white/10 p-2.5 rounded-xl text-white group-hover:text-primary transition-colors">
                                            <Zap size={18} />
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Info Card / Rewards Summary */}
                            <div className="bg-white/5 border border-white/5 p-5 rounded-3xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Fan Utility & Rewards</h3>
                                    {totalCHZ > 0 && (
                                        <span className="text-[10px] font-black text-primary italic bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                                            {totalCHZ} $CHZ Total Balance
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-background-dark/50 p-3 rounded-2xl border border-white/5">
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">Game Winnings</p>
                                        <p className="text-xs font-black italic text-accent-gold">{user.balanceCHZ || 0} $CHZ</p>
                                    </div>
                                    <div className="bg-background-dark/50 p-3 rounded-2xl border border-white/5">
                                        <p className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-1">$CHZ Holders</p>
                                        <p className="text-xs font-black italic text-primary">1.2x Multiplier</p>
                                    </div>
                                </div>

                                {/* Recent CHZ Rewards */}
                                {chzRewards.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-20 ml-1">Recent Rewards</span>
                                        {chzRewards.slice(0, 2).map((reward, i) => (
                                            <div key={i} className="flex justify-between items-center p-2 rounded-xl bg-white/5 border border-white/5">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-white italic uppercase">{reward.metadata?.reason || 'Prize'}</span>
                                                    <span className="text-[7px] text-white/30 font-bold uppercase">{new Date(reward.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-primary italic">+{reward.amount} $CHZ</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};
