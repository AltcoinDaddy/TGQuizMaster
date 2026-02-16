import React, { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ChevronLeft, Info, Brain, Coins, Film, Trophy, Gamepad2, Lock, Link as LinkIcon, Send, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STAR_PRESETS = [10, 25, 50, 100];
const TON_PRESETS = [0.5, 1, 2.5, 5];

export const CreateTournament: React.FC = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('General');
    const [players, setPlayers] = useState(5);
    const [feeType, setFeeType] = useState<'free' | 'stars' | 'custom'>('free');
    const [starAmount, setStarAmount] = useState(10);
    const [tonAmount, setTonAmount] = useState(1);
    const [isPrivate, setIsPrivate] = useState(false);

    const categories = [
        { name: 'General', icon: <Brain size={20} /> },
        { name: 'Crypto', icon: <Coins size={20} /> },
        { name: 'Movies', icon: <Film size={20} /> },
        { name: 'Sports', icon: <Trophy size={20} /> },
        { name: 'Gaming', icon: <Gamepad2 size={20} /> },
    ];

    const getEntryFeeStr = () => {
        if (feeType === 'free') return 'Free';
        if (feeType === 'stars') return `${starAmount} Stars`;
        return `${tonAmount} TON`;
    };

    const getPrizePool = () => {
        if (feeType === 'free') return '0';
        if (feeType === 'stars') return `${starAmount * players} Stars`;
        return `${(tonAmount * players).toFixed(1)} TON`;
    };

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-40">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white italic uppercase tracking-tighter">Create Room</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                <div className="space-y-8">
                    {/* Category Selection */}
                    <section className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Topic</label>
                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat.name}
                                    onClick={() => setCategory(cat.name)}
                                    className={`flex-shrink-0 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${category === cat.name ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'bg-white/5 border border-white/10 text-white/60'}`}
                                >
                                    {cat.icon}
                                    <span className="text-sm">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Player Count */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Players</label>
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-black text-primary">{players}</span>
                                <span className="text-white/40 font-bold text-xs uppercase">Players</span>
                            </div>
                        </div>
                        <div className="relative px-2">
                            <input
                                type="range"
                                min="2"
                                max="20"
                                value={players}
                                onChange={(e) => setPlayers(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between mt-3 text-[10px] font-black text-white/20">
                                <span>2</span>
                                <span>5</span>
                                <span>10</span>
                                <span>15</span>
                                <span>20</span>
                            </div>
                        </div>
                    </section>

                    {/* Entry Fee Type */}
                    <section className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Entry Fee</label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                onClick={() => setFeeType('free')}
                                className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${feeType === 'free' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/5'}`}
                            >
                                <span className="text-xl">🙌</span>
                                <span className={`text-[10px] font-black uppercase ${feeType === 'free' ? 'text-primary' : 'text-white/40'}`}>Free</span>
                            </button>
                            <button
                                onClick={() => setFeeType('stars')}
                                className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${feeType === 'stars' ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5'}`}
                            >
                                <span className="text-xl">⭐</span>
                                <span className={`text-[10px] font-black uppercase ${feeType === 'stars' ? 'text-primary' : 'text-white/40'}`}>Stars</span>
                            </button>
                            <button
                                onClick={() => setFeeType('custom')}
                                className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${feeType === 'custom' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/5'}`}
                            >
                                <span className="text-xl">💎</span>
                                <span className={`text-[10px] font-black uppercase ${feeType === 'custom' ? 'text-primary' : 'text-white/40'}`}>TON</span>
                            </button>
                        </div>

                        {/* Stars Amount Selector */}
                        {feeType === 'stars' && (
                            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Entry Per Player</p>
                                        <p className="text-2xl font-black text-accent-gold">{starAmount} <span className="text-sm opacity-40">Stars</span></p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setStarAmount(Math.max(5, starAmount - 5))}
                                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <button
                                            onClick={() => setStarAmount(Math.min(500, starAmount + 5))}
                                            className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary active:scale-90 transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                {/* Quick presets */}
                                <div className="flex gap-2">
                                    {STAR_PRESETS.map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setStarAmount(val)}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${starAmount === val ? 'bg-accent-gold text-background-dark' : 'bg-white/5 text-white/40'}`}
                                        >
                                            {val}⭐
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TON Amount Selector */}
                        {feeType === 'custom' && (
                            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Entry Per Player</p>
                                        <p className="text-2xl font-black text-blue-400">{tonAmount} <span className="text-sm opacity-40">TON</span></p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setTonAmount(Math.max(0.1, +(tonAmount - 0.5).toFixed(1)))}
                                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <button
                                            onClick={() => setTonAmount(Math.min(50, +(tonAmount + 0.5).toFixed(1)))}
                                            className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 active:scale-90 transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                {/* Quick presets */}
                                <div className="flex gap-2">
                                    {TON_PRESETS.map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setTonAmount(val)}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${tonAmount === val ? 'bg-blue-500 text-white' : 'bg-white/5 text-white/40'}`}
                                        >
                                            {val} 💎
                                        </button>
                                    ))}
                                </div>

                                {/* TON Coming Soon Notice */}
                                <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                    <Info size={14} className="text-blue-400 shrink-0" />
                                    <p className="text-[10px] text-blue-400/80 font-bold">TON tournaments launch in Phase 2. Star rooms are live now!</p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Prize Pool Preview */}
                    {feeType !== 'free' && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent-gold/10 border border-primary/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Estimated Prize Pool</p>
                                    <p className="text-xl font-black text-primary">{getPrizePool()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Entry Fee</p>
                                    <p className="text-sm font-black text-white">{getEntryFeeStr()}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Privacy */}
                    <GlassCard className={`p-5 space-y-4 border-white/5 ${isPrivate ? 'border-primary/20 shadow-lg shadow-primary/5' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPrivate ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/40'}`}>
                                    <Lock size={18} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-white">Private Room</p>
                                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Only invited friends</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsPrivate(!isPrivate)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${isPrivate ? 'bg-primary' : 'bg-white/10'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`}></span>
                            </button>
                        </div>
                        {isPrivate && (
                            <div className="pt-4 border-t border-white/5">
                                <button className="w-full py-4 px-6 rounded-2xl bg-white/5 text-white font-black text-xs uppercase tracking-widest flex items-center justify-between hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon size={16} className="text-primary" />
                                        <span>Generate Invite Link</span>
                                    </div>
                                    <Send size={14} className="opacity-40" />
                                </button>
                            </div>
                        )}
                    </GlassCard>
                </div>
            </div>

            {/* Sticky Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark via-background-dark/95 to-transparent z-[60]">
                <Button
                    fullWidth
                    onClick={() => {
                        if (feeType === 'custom') {
                            // TON tournaments not yet supported
                            const tg = (window as any).Telegram?.WebApp;
                            if (tg?.showAlert) {
                                tg.showAlert('TON tournaments are coming soon! Try creating a Star room instead.');
                            }
                            return;
                        }

                        navigate('/quiz', {
                            state: {
                                type: 'tournament',
                                roomType: feeType === 'free' ? 'practice' : 'stars',
                                entryFee: getEntryFeeStr(),
                                currency: feeType === 'stars' ? 'Stars' : 'none',
                                category,
                                maxPlayers: players
                            }
                        });
                    }}
                    className="py-5 text-lg gap-3"
                >
                    {feeType === 'custom' ? 'COMING SOON' : 'CREATE & START'}
                    <Send size={20} />
                </Button>
            </div>
        </MainLayout>
    );
};
