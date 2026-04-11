import React from 'react';
import { authPost } from '../../utils/authFetch';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ChevronLeft, ShieldAlert, Wallet, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useAppKit } from '@reown/appkit/react';
import { useAccount, useBalance } from 'wagmi';
import { formatUnits } from 'viem';

export const WithdrawalConfirmation: React.FC = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAppStore();
    const [loading, setLoading] = React.useState(false);
    const [isManual, setIsManual] = React.useState(false);
    const [manualAddress, setManualAddress] = React.useState('');
    const [addressError, setAddressError] = React.useState('');
    const [withdrawAmount, setWithdrawAmount] = React.useState('');
    const [amountError, setAmountError] = React.useState('');

    const { open } = useAppKit();
    const { address, isConnected } = useAccount();
    const { data: balanceData } = useBalance({
        address,
    });

    // Use on-chain balance if connected, otherwise fallback to store balance
    const chilizBalance = isConnected && balanceData 
        ? parseFloat(formatUnits(balanceData.value, balanceData.decimals)) 
        : (user.chilizBalance || 0);

    // Fee logic
    const networkFee = 0.1; // 0.1 CHZ fee (realistically covers gas)

    const numAmount = parseFloat(withdrawAmount) || 0;
    const netAmount = Math.max(0, numAmount - networkFee);
    const isAmountValid = numAmount >= networkFee && numAmount <= chilizBalance;

    const validateAddress = (addr: string) => {
        if (!addr) return 'Address is required';
        if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) return 'Invalid Chiliz address format';
        return '';
    };

    const targetAddress = isManual ? manualAddress : address;
    const isAddressValid = isManual ? !validateAddress(manualAddress) : !!address;

    const handleMax = () => {
        setWithdrawAmount(chilizBalance.toFixed(2));
    };

    const handleWithdraw = async () => {
        if (isManual) {
            const error = validateAddress(manualAddress);
            if (error) {
                setAddressError(error);
                return;
            }
        } else if (!address || !isConnected) {
            open();
            return;
        }

        if (!isAmountValid) {
            if (numAmount < networkFee) {
                setAmountError(`Minimum withdrawal is ${networkFee} CHZ`);
            } else {
                setAmountError("Amount exceeds balance");
            }
            return;
        }

        setLoading(true);
        try {
            const res = await authPost('/api/withdraw', {
                telegramId: user.telegramId,
                amount: numAmount,
                address: targetAddress
            });

            const data = await res.json();
            if (res.ok && data.success) {
                // Update local state
                setUser({ chilizBalance: data.newBalance });
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
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4 border border-primary/20">
                        <img
                            src="https://assets.coingecko.com/coins/images/8834/large/Chiliz.png"
                            alt="CHZ"
                            className="w-12 h-12 rounded-full"
                        />
                    </div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Total Balance</p>
                    <div className="flex items-center justify-center gap-3 mb-1">
                        <span className="text-5xl font-black text-white italic">{chilizBalance.toFixed(2)}</span>
                        <span className="text-2xl font-black text-primary italic">CHZ</span>
                    </div>
                    <p className="text-sm font-bold text-white/30 uppercase tracking-widest">≈ ${(chilizBalance * 0.035).toFixed(2)} USD</p>
                </div>

                {/* Details */}
                <div className="space-y-6 mb-10">
                    {/* Toggle */}
                    <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                        <button
                            onClick={() => setIsManual(false)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${!isManual ? 'bg-primary text-background-dark' : 'text-white/40'}`}
                        >
                            Connected Wallet
                        </button>
                        <button
                            onClick={() => setIsManual(true)}
                            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${isManual ? 'bg-primary text-background-dark' : 'text-white/40'}`}
                        >
                            External Wallet
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">
                            {isManual ? 'External Destination Address' : 'Connected Wallet Address'}
                        </label>
                        
                        {isManual ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={manualAddress}
                                    onChange={(e) => {
                                        setManualAddress(e.target.value);
                                        setAddressError('');
                                    }}
                                    placeholder="0x..."
                                    className={`w-full bg-white/5 border ${addressError ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-5 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all`}
                                />
                                {addressError && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest ml-2">{addressError}</p>}
                            </div>
                        ) : (
                            <GlassCard className="p-5 flex items-center justify-between border-white/5 bg-white/5">
                                <div className="flex items-center gap-3">
                                    <Wallet size={18} className="text-white/40" />
                                    <span className="font-mono text-xs font-bold text-white/80">
                                        {address
                                            ? `${address.slice(0, 6)}...${address.slice(-6)}`
                                            : 'No Wallet Linked'}
                                    </span>
                                </div>
                                {address ? (
                                    <CheckCircle2 size={16} className="text-primary" />
                                ) : (
                                    <ShieldAlert size={16} className="text-accent-gold" />
                                )}
                            </GlassCard>
                        )}
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">
                            Amount to Withdraw
                        </label>
                        <div className="space-y-2">
                            <div className="relative group">
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => {
                                        setWithdrawAmount(e.target.value);
                                        setAmountError('');
                                    }}
                                    placeholder="0.00"
                                    className={`w-full bg-white/5 border ${amountError ? 'border-red-500/50' : 'border-white/10'} rounded-2xl p-5 pr-20 text-xl font-black italic text-white placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all`}
                                />
                                <button
                                    onClick={handleMax}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border border-primary/30 transition-all"
                                >
                                    MAX
                                </button>
                            </div>
                            {amountError && <p className="text-[8px] font-bold text-red-500 uppercase tracking-widest ml-2">{amountError}</p>}
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/30">Network Fee</span>
                            <span className="text-white/80">{networkFee} CHZ</span>
                        </div>
                        <div className="h-[1px] bg-white/5"></div>
                        <div className="flex justify-between items-center italic">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Net Amount to Receive</span>
                            <span className={`text-2xl font-black italic ${isAmountValid ? 'text-primary' : 'text-white/20'}`}>
                                {netAmount.toFixed(2)} CHZ
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
                        disabled={loading || !isAmountValid || !isAddressValid}
                        className="py-5 text-xl gap-3 shadow-[0_10px_30px_rgba(13,242,89,0.3)] font-black italic tracking-widest disabled:opacity-50 disabled:shadow-none"
                    >
                        {loading ? 'PROCESSING...' : (isAddressValid && isAmountValid ? 'CONFIRM & WITHDRAW' : 'CHECK DETAILS')}
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
