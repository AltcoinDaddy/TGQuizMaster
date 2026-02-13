import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Trophy, Rocket, Gift, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StreakPopup } from '../ui/StreakPopup';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [showStreak, setShowStreak] = useState(false);

    useEffect(() => {
        const claimed = localStorage.getItem('streak_claimed_today');
        if (!claimed) {
            const timer = setTimeout(() => setShowStreak(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClaim = () => {
        localStorage.setItem('streak_claimed_today', 'true');
        setShowStreak(false);
    };

    return (
        <MainLayout>
            <div className="bg-mesh min-h-full">
                {/* Tournament Card (Hero) */}
                <div
                    onClick={() => navigate('/quiz')}
                    className="relative group cursor-pointer active:scale-[0.98] transition-all"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-xl -z-10 group-hover:bg-primary/30"></div>
                    <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-xl p-6 text-background-dark shadow-xl overflow-hidden relative">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-background-dark text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase italic tracking-tighter">Live Now ⚡️</span>
                                <div className="flex -space-x-2">
                                    <img className="w-6 h-6 rounded-full border-2 border-primary" src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" alt="participant" />
                                    <img className="w-6 h-6 rounded-full border-2 border-primary" src="https://api.dicebear.com/7.x/avataaars/svg?seed=2" alt="participant" />
                                    <div className="w-6 h-6 rounded-full bg-background-dark flex items-center justify-center border-2 border-primary">
                                        <span className="text-[8px] font-black text-white">+84</span>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-2xl font-black mb-1 leading-tight uppercase italic tracking-tighter">Elite Tournament</h2>
                            <p className="text-sm font-bold opacity-80 mb-6 font-display italic">Battle for the massive 500 TON prize pool!</p>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black opacity-60 uppercase italic tracking-tighter">Entry Fee</span>
                                    <span className="text-lg font-black italic">10 TON</span>
                                </div>
                                <button className="bg-background-dark text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest italic flex items-center gap-2">
                                    Enter Now 🏆
                                </button>
                            </div>
                        </div>
                        {/* Abstract Design Element */}
                        <div className="absolute -right-8 -bottom-8 opacity-20 transform rotate-12">
                            <Trophy size={160} className="text-background-dark" />
                        </div>
                    </div>
                </div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                    {/* Free Quiz */}
                    <div
                        onClick={() => navigate('/quiz', { state: { type: 'practice', entryFee: 'Free' } })}
                        className="bg-white/5 border border-white/10 p-5 rounded-3xl active:scale-[0.98] transition-all flex flex-col justify-between aspect-square cursor-pointer hover:border-primary/30"
                    >
                        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                            <Rocket size={24} className="text-primary" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg uppercase italic tracking-tighter leading-none mb-1">Daily Practice</h3>
                            <p className="text-[10px] opacity-60 font-bold leading-tight uppercase tracking-tighter">Master your skills and earn free XP daily.</p>
                        </div>
                        <div className="mt-4 flex items-center text-primary text-[10px] font-black uppercase tracking-widest gap-2 italic">
                            Start Free <ArrowRight size={14} />
                        </div>
                    </div>

                    {/* Sponsored Quiz */}
                    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl active:scale-[0.98] transition-all flex flex-col justify-between aspect-square">
                        <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center mb-4">
                            <Gift size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg uppercase italic tracking-tighter leading-none mb-1">Brand Quiz</h3>
                            <p className="text-[10px] opacity-60 font-bold leading-tight uppercase tracking-tighter">Win exclusive NFTs and tokens from partners.</p>
                        </div>
                        <div className="mt-4 flex items-center text-blue-400 text-[10px] font-black uppercase tracking-widest gap-2 italic">
                            Explore <ArrowRight size={14} />
                        </div>
                    </div>
                </div>

                {/* Leaderboard Preview */}
                <div className="space-y-4 mt-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-lg uppercase italic tracking-tighter">Top Players Today</h3>
                        <button className="text-primary text-[10px] font-black uppercase tracking-widest italic">See All</button>
                    </div>
                    <div className="space-y-3">
                        <LeaderboardItem rank={1} name="@CryptoWizard" winCount={842} reward="124.5 TON" isTop />
                        <LeaderboardItem rank={2} name="@SatoshiVibes" winCount={712} reward="98.2 TON" />
                    </div>
                </div>
            </div>

            {showStreak && (
                <StreakPopup
                    day={5}
                    reward="500"
                    onClaim={handleClaim}
                    onClose={() => setShowStreak(false)}
                />
            )}
        </MainLayout>
    );
}

const LeaderboardItem = ({ rank, name, winCount, reward, isTop = false }: any) => (
    <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-3xl flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
            <span className={`font-black italic text-xl w-6 ${isTop ? 'text-primary' : 'opacity-20'}`}>{rank}</span>
            <div className="relative">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} className="w-11 h-11 rounded-full border-2 border-white/10" alt={name} />
                {isTop && <span className="absolute -top-1 -right-1 text-sm">👑</span>}
            </div>
            <div>
                <p className="font-black text-sm uppercase italic tracking-tighter">{name}</p>
                <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">{winCount} Games Won</p>
            </div>
        </div>
        <div className="text-right">
            <p className={`font-black italic text-base ${isTop ? 'text-primary' : 'text-white/90'}`}>{reward}</p>
            <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">Earned</p>
        </div>
    </div>
);
