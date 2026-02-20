import React from 'react';
import { API_URL } from '../../config/api';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ChevronLeft, ShieldAlert, Wallet, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

export const WithdrawalConfirmation: React.FC = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAppStore();
    const [loading, setLoading] = React.useState(false);

    // Fee logic
    const networkFee = 0.05;
    const withdrawableAmount = Math.max(0, user.tonBalance - networkFee);

    const handleWithdraw = async () => {
        if (withdrawableAmount <= 0) {
            alert("Insufficient balance to cover fees.");
            return;
        }
        if (!user.walletAddress) {
            alert("Please connect a wallet first.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: user.telegramId,
                    amount: withdrawableAmount,
                    address: user.walletAddress
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                // Update local state
                setUser({ tonBalance: data.newBalance });
                navigate('/withdrawal-success');
            } else {
                alert(data.error || 'Withdrawal failed');
            }
        } catch (e) {
            console.error('Withdraw error:', e);
            alert('Network error during withdrawal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white">Confirm Withdrawal</h1>
                </div>

                {/* Amount Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-500/10 mb-4 border border-blue-500/20">
                        <img
                            src="https://ton.org/download/ton_symbol.svg"
                            alt="TON"
                            className="w-12 h-12"
                        />
                    </div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Total Balance</p>
                    <div className="flex items-center justify-center gap-3 mb-1">
                        <span className="text-5xl font-black text-white italic">{user.tonBalance.toFixed(2)}</span>
                        <span className="text-2xl font-black text-primary italic">TON</span>
                    </div>
                    <p className="text-sm font-bold text-white/30 uppercase tracking-widest">≈ ${(user.tonBalance * 5.15).toFixed(2)} USD</p>
                </div>

                {/* Details */}
                <div className="space-y-4 mb-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Destination Wallet</label>
                        <GlassCard className="p-5 flex items-center justify-between border-white/5 bg-white/5">
                            <div className="flex items-center gap-3">
                                <Wallet size={18} className="text-white/40" />
                                <span className="font-mono text-xs font-bold text-white/80">
                                    {user.walletAddress
                                        ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-6)}`
                                        : 'No Wallet Linked'}
                                </span>
                            </div>
                            {user.walletAddress ? (
                                <CheckCircle2 size={16} className="text-primary" />
                            ) : (
                                <ShieldAlert size={16} className="text-red-400" />
                            )}
                        </GlassCard>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/30">Network Fee</span>
                            <span className="text-white/80">{networkFee} TON</span>
                        </div>
                        <div className="h-[1px] bg-white/5"></div>
                        <div className="flex justify-between items-center italic">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Net Amount to Receive</span>
                            <span className={`text-2xl font-black italic ${withdrawableAmount > 0 ? 'text-primary' : 'text-white/20'}`}>
                                {withdrawableAmount.toFixed(2)} TON
                            </span>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-accent-gold/10 border border-accent-gold/20 rounded-3xl p-5 flex gap-4 mb-10">
                    <ShieldAlert size={24} className="text-accent-gold flex-shrink-0" />
                    <p className="text-[10px] font-bold leading-relaxed text-accent-gold/80 uppercase tracking-wide">
                        Please double-check the wallet address. Crypto transactions are final and cannot be reversed once confirmed on the blockchain.
                    </p>
                </div>

                {/* Action */}
                <div className="space-y-4">
                    <Button
                        fullWidth
                        onClick={handleWithdraw}
                        disabled={loading || withdrawableAmount <= 0 || !user.walletAddress}
                        className="py-5 text-xl gap-3 shadow-[0_10px_30px_rgba(13,242,89,0.3)] font-black italic tracking-widest disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? 'PROCESSING...' : (user.walletAddress ? 'CONFIRM & WITHDRAW' : 'CONNECT WALLET FIRST')}
                    </Button>
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full text-white/30 font-black text-[10px] uppercase tracking-widest py-4 rounded-2xl active:bg-white/5 transition-all"
                    >
                        CANCEL
                    </button>
                </div>
            </div>
        </MainLayout>
    );
};
