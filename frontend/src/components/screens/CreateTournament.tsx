import React, { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ChevronLeft, Info, Brain, Coins, Film, Trophy, Gamepad2, Lock, Link as LinkIcon, Send, Minus, Plus, Star, Diamond, History, Globe, Music, Landmark, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STAR_PRESETS = [500, 1000, 2500, 5000];
const CHZ_PRESETS = [10, 50, 100, 250];

export const CreateTournament: React.FC = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('General');
    const [players, setPlayers] = useState(5);
    const [feeType, setFeeType] = useState<'stars' | 'custom'>('stars');
    const [starAmount, setStarAmount] = useState(500);
    const [chzAmount, setChzAmount] = useState(50);
    const [isPrivate, setIsPrivate] = useState(false);

    const categories = [
        { name: 'General', icon: <Brain size={20} /> },
        { name: 'Crypto', icon: <Coins size={20} /> },
        { name: 'Movies', icon: <Film size={20} /> },
        { name: 'Sports', icon: <Trophy size={20} /> },
        { name: 'Gaming', icon: <Gamepad2 size={20} /> },
        { name: 'History', icon: <History size={20} /> },
        { name: 'Geography', icon: <Globe size={20} /> },
        { name: 'Music', icon: <Music size={20} /> },
        { name: 'Politics', icon: <Landmark size={20} /> },
        { name: 'Gadgets', icon: <Smartphone size={20} /> },
    ];

    const getEntryFeeStr = () => {
        if (feeType === 'stars') return `${starAmount} Stars`;
        return `${chzAmount} CHZ`;
    };

    const getPrizePool = () => {
        if (feeType === 'stars') return `${starAmount * players} Stars`;
        return `${(chzAmount * players).toFixed(0)} CHZ`;
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
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setFeeType('stars')}
                                className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group ${feeType === 'stars' ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5'}`}
                            >
                                <div className={`p-2 rounded-xl transition-all ${feeType === 'stars' ? 'bg-primary text-background-dark shadow-[0_0_15px_rgba(13,242,89,0.3)]' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}`}>
                                    <Star size={20} fill="currentColor" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${feeType === 'stars' ? 'text-primary' : 'text-white/40'}`}>Stars</span>
                            </button>
                            <button
                                onClick={() => setFeeType('custom')}
                                className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all group ${feeType === 'custom' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/5'}`}
                            >
                                <div className={`p-2 rounded-xl transition-all ${feeType === 'custom' ? 'bg-primary text-background-dark shadow-[0_0_15px_rgba(13,242,89,0.3)]' : 'bg-white/5 text-white/40 group-hover:bg-white/10'}`}>
                                    <Diamond size={20} fill="currentColor" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-wider ${feeType === 'custom' ? 'text-primary' : 'text-white/40'}`}>CHZ</span>
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
                                            onClick={() => setStarAmount(Math.max(500, starAmount - 500))}
                                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all font-black text-[10px]"
                                        >
                                            -500
                                        </button>
                                        <button
                                            onClick={() => setStarAmount(Math.min(100000, starAmount + 500))}
                                            className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary active:scale-90 transition-all font-black text-[10px]"
                                        >
                                            +500
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
                                            {val} <Star size={10} fill="currentColor" className="inline mb-0.5" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CHZ Amount Selector */}
                        {feeType === 'custom' && (
                            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Entry Per Player</p>
                                        <p className="text-2xl font-black text-primary">{chzAmount} <span className="text-sm opacity-40">CHZ</span></p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setChzAmount(Math.max(10, chzAmount - 10))}
                                            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <button
                                            onClick={() => setChzAmount(Math.min(5000, chzAmount + 10))}
                                            className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary active:scale-90 transition-all"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                                {/* Quick presets */}
                                <div className="flex gap-2">
                                    {CHZ_PRESETS.map(val => (
                                        <button
                                            key={val}
                                            onClick={() => setChzAmount(val)}
                                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 ${chzAmount === val ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'bg-white/5 text-white/40'}`}
                                        >
                                            {val} <Diamond size={10} fill="currentColor" />
                                        </button>
                                    ))}
                                </div>

                                {/* CHZ Coming Soon Notice */}
                                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-xl border border-primary/20">
                                    <Info size={14} className="text-primary shrink-0" />
                                    <p className="text-[10px] text-primary/80 font-bold">CHZ tournaments launch in Phase 2. Star rooms are live now!</p>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Prize Pool Preview */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent-gold/10 border border-primary/20 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Estimated Prize Pool</p>
                            <p className="text-xl font-black text-primary">{getPrizePool()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Entry Fee</p>
                            <p className="text-sm font-black text-white">{getEntryFeeStr()}</p>
                        </div>
                    </div>

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
                                <span className={`span-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isPrivate ? 'translate-x-6' : 'translate-x-1'}`}></span>
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
                            // CHZ tournaments not yet supported
                            const tg = (window as any).Telegram?.WebApp;
                            if (tg?.showAlert) {
                                tg.showAlert('CHZ tournaments are coming soon! Try creating a Star room instead.');
                            }
                            return;
                        }

                        // NEW: Persist to sessionStorage in case location.state drops in Telegram WebApp
                        sessionStorage.setItem('pendingRoomConf', JSON.stringify({
                            category,
                            maxPlayers: players
                        }));

                        navigate('/quiz', {
                            state: {
                                type: 'tournament',
                                roomType: 'stars',
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
