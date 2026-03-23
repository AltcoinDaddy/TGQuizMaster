import React from 'react';
import { X } from 'lucide-react';

interface StreakPopupProps {
    day: number;
    reward: string;
    rewardType: 'STARS' | 'CHEST';
    chestItems?: { stars: number; shards: number; powerup: string | null };
    onClaim: () => void;
    onClose: () => void;
}

export const StreakPopup: React.FC<StreakPopupProps> = ({ day, reward, rewardType, chestItems, onClaim, onClose }) => {
    const days = Array.from({ length: 14 }, (_, i) => i + 1);
    const chestDays = [3, 7, 14];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0" onClick={onClose}></div>

            <div className="bg-slate-900 border border-white/10 rounded-[2rem] w-full max-w-sm overflow-hidden relative bonus-glow z-10 animate-in fade-in zoom-in duration-300">
                <div className="h-32 bg-gradient-to-b from-accent-purple/30 to-transparent absolute top-0 left-0 right-0 -z-10"></div>

                <div className="p-6 text-center">
                    <div className="flex justify-center gap-4 mb-2">
                        <span className="text-3xl">🔥</span>
                        <span className="text-4xl transform -translate-y-2">⭐</span>
                        <span className="text-3xl">🏆</span>
                    </div>

                    <h2 className="text-2xl font-black text-white mb-1 uppercase italic tracking-tighter">Daily Bonus</h2>
                    <p className="text-accent-gold font-bold text-sm mb-6 uppercase italic tracking-tighter">Your {day} Day Streak is Heating Up!</p>

                    <div className="grid grid-cols-7 gap-1.5 mb-8">
                        {days.map((d) => (
                            <div key={d} className="flex flex-col items-center gap-1.5">
                                {d < day ? (
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                                        <i className="material-icons text-base">check_circle</i>
                                    </div>
                                ) : d === day ? (
                                    <div className="w-10 h-10 rounded-xl bg-primary border-2 border-white/20 flex items-center justify-center day-active-glow relative -top-1 text-xl">
                                        {chestDays.includes(d) ? '📦' : '🎁'}
                                    </div>
                                ) : chestDays.includes(d) ? (
                                    <div className="w-8 h-8 rounded-lg bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-lg grayscale opacity-50">
                                        📦
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                                        <span className="text-[10px] font-bold opacity-40">{d}</span>
                                    </div>
                                )}
                                <span className={`text-[7px] font-black uppercase italic tracking-tighter ${d === day ? 'text-primary' : 'opacity-40'}`}>
                                    D{d}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 relative overflow-hidden">
                        <p className="text-[10px] uppercase font-black italic opacity-50 mb-1 tracking-widest leading-none">Today's Reward</p>
                        {rewardType === 'CHEST' ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl">📦</span>
                                    <span className="text-xl font-black italic text-accent-purple uppercase tracking-tighter">Mystery Chest</span>
                                </div>
                                {chestItems && (
                                    <div className="flex justify-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500 delay-300">
                                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                            <span className="text-xs font-black text-accent-gold">+{chestItems.stars}⭐</span>
                                        </div>
                                        {chestItems.shards > 0 && (
                                            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                                <span className="text-xs font-black text-accent-purple">+{chestItems.shards}💎</span>
                                            </div>
                                        )}
                                        {chestItems.powerup && (
                                            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                                <span className="text-xs font-black text-primary">+{chestItems.powerup}⚡</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-3xl font-black italic text-accent-gold">+{reward}</span>
                                <span className="text-xl">⭐️</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClaim}
                        className="w-full bg-gradient-to-r from-accent-purple to-purple-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-purple-500/30 active:scale-[0.97] transition-all mb-4 uppercase italic tracking-widest text-sm"
                    >
                        CLAIM REWARD 🚀
                    </button>

                    <p className="text-[11px] font-bold opacity-50 uppercase tracking-tighter italic">
                        Next reward available in <span className="text-white">14h 20m</span>
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
