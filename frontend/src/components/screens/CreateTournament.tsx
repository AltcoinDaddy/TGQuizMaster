import React, { useState } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ChevronLeft, Info, Brain, Coins, Film, Trophy, Gamepad2, Settings, Lock, Link as LinkIcon, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateTournament: React.FC = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState('General');
    const [players, setPlayers] = useState(6);
    const [feeType, setFeeType] = useState<'free' | 'stars' | 'ton'>('stars');
    const [isPrivate, setIsPrivate] = useState(true);

    const categories = [
        { name: 'General', icon: <Brain size={20} /> },
        { name: 'Crypto', icon: <Coins size={20} /> },
        { name: 'Movies', icon: <Film size={20} /> },
        { name: 'Sports', icon: <Trophy size={20} /> },
        { name: 'Gaming', icon: <Gamepad2 size={20} /> },
    ];

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white">Create Tournament</h1>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all">
                        <Settings size={20} />
                    </button>
                </div>

                <div className="space-y-10">
                    {/* Category Selection */}
                    <section className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Topic Selection</label>
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
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Competitors</label>
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
                            <div className="flex justify-between mt-4 text-[10px] font-black text-white/20">
                                <span>2</span>
                                <span>5</span>
                                <span>10</span>
                                <span>15</span>
                                <span>20</span>
                            </div>
                        </div>
                    </section>

                    {/* Entry Fee */}
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
                                <span className={`text-[10px] font-black uppercase ${feeType === 'stars' ? 'text-primary' : 'text-white/40'}`}>10 Stars</span>
                            </button>
                            <button
                                onClick={() => setFeeType('ton')}
                                className={`py-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${feeType === 'ton' ? 'bg-primary/10 border-primary' : 'bg-white/5 border-white/5'}`}
                            >
                                <span className="text-xl">💎</span>
                                <span className={`text-[10px] font-black uppercase ${feeType === 'ton' ? 'text-primary' : 'text-white/40'}`}>Custom</span>
                            </button>
                        </div>

                        {feeType === 'ton' && (
                            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <Trophy size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">TON Amount</p>
                                        <p className="text-lg font-black text-white">2.5 <span className="text-sm font-bold opacity-40">TON</span></p>
                                    </div>
                                </div>
                                <button className="p-2 rounded-xl bg-white/10 text-primary active:scale-90 transition-all">
                                    <Settings size={18} />
                                </button>
                            </div>
                        )}
                    </section>

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
                        <div className="pt-4 border-t border-white/5">
                            <button className="w-full py-4 px-6 rounded-2xl bg-white/5 text-white font-black text-xs uppercase tracking-widest flex items-center justify-between hover:bg-white/10 transition-all">
                                <div className="flex items-center gap-2">
                                    <LinkIcon size={16} className="text-primary" />
                                    <span>Generate Invite Link</span>
                                </div>
                                <Send size={14} className="opacity-40" />
                            </button>
                        </div>
                    </GlassCard>

                    {/* Info */}
                    <div className="flex items-center gap-3 p-4 bg-yellow-400/10 rounded-2xl border border-yellow-400/20">
                        <Info size={18} className="text-yellow-400 shrink-0" />
                        <p className="text-[10px] text-yellow-400/80 font-bold leading-relaxed uppercase tracking-wide">
                            Creating a private room requires a small platform fee of 0.1 TON or 5 Stars.
                        </p>
                    </div>
                </div>
            </div>

            {/* Sticky Action Button */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background-dark to-transparent z-[60]">
                <Button
                    fullWidth
                    onClick={() => navigate('/quiz')}
                    className="py-5 text-lg gap-3"
                >
                    CREATE & INVITE FRIENDS
                    <Send size={20} />
                </Button>
            </div>
        </MainLayout>
    );
};
