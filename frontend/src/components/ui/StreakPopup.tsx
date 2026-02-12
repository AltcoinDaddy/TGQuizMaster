import React from 'react';
import { X } from 'lucide-react';

interface StreakPopupProps {
    day: number;
    reward: string;
    onClaim: () => void;
    onClose: () => void;
}

export const StreakPopup: React.FC<StreakPopupProps> = ({ day, reward, onClaim, onClose }) => {
    const days = [1, 2, 3, 4, 5, 6, 7];

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

                    <div className="flex justify-between items-end gap-1 mb-8">
                        {days.map((d) => (
                            <div key={d} className="flex flex-col items-center gap-2 flex-1">
                                {d < day ? (
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
                                        <i className="material-icons text-xl">check_circle</i>
                                    </div>
                                ) : d === day ? (
                                    <div className="w-12 h-12 rounded-2xl bg-primary border-2 border-white/20 flex items-center justify-center day-active-glow relative -top-1 text-2xl group">
                                        🎁
                                    </div>
                                ) : d === 7 ? (
                                    <div className="w-10 h-10 rounded-xl bg-accent-purple/20 border border-accent-purple/40 flex items-center justify-center text-xl grayscale opacity-50">
                                        💰
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        <span className="text-sm font-bold opacity-40">{d}</span>
                                    </div>
                                )}
                                <span className={`text-[8px] font-black uppercase italic tracking-tighter ${d === day ? 'text-primary' : 'opacity-40'}`}>
                                    Day {d}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                        <p className="text-[10px] uppercase font-black italic opacity-50 mb-1 tracking-widest leading-none">Today's Reward</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-black italic text-accent-gold">+{reward}</span>
                            <span className="text-xl">⭐️</span>
                        </div>
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
