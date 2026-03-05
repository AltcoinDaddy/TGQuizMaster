import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';
import { authPost } from '../../utils/authFetch';
import { MainLayout } from '../layout/MainLayout';
import { Rocket, ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StreakPopup } from '../ui/StreakPopup';
import { useAppStore } from '../../store/useAppStore';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [showStreak, setShowStreak] = useState(false);
    const [streakDay, setStreakDay] = useState(1);
    const [streakReward, setStreakReward] = useState('50');
    const [rewardType, setRewardType] = useState<'STARS' | 'CHEST'>('STARS');
    const [chestItems, setChestItems] = useState<any>(null);
    const [leaderboardPreview, setLeaderboardPreview] = useState<any[]>([]);
    const { user } = useAppStore();

    useEffect(() => {
        if (!user.telegramId) return;

        const checkDailyReward = async () => {
            try {
                const res = await fetch(`${API_URL}/api/daily-reward?telegramId=${user.telegramId}`);
                const data = await res.json();

                if (data.claimable) {
                    setStreakDay(data.streakDay);
                    setStreakReward(String(data.reward));
                    setRewardType(data.rewardType || 'STARS');
                    setTimeout(() => setShowStreak(true), 1500);
                }
            } catch (e) {
                console.error('Failed to check daily reward:', e);
            }
        };
        checkDailyReward();
    }, [user.telegramId]);

    const handleClaim = async () => {
        try {
            const res = await authPost('/api/claim-daily', {
                telegramId: user.telegramId
            });
            const data = await res.json();

            if (data.success) {
                // Update local balances in store
                useAppStore.getState().setUser({
                    stars: data.newBalance,
                    balanceShards: data.newShards,
                    inventoryPowerups: data.inventoryPowerups, // Assuming backend returns the full object
                    unlockedAvatars: data.unlockedAvatars
                });

                if (data.rewardType === 'CHEST') {
                    setChestItems(data.chestItems);
                    // Keep popup open for a moment to show chest items if they were randomized
                } else {
                    setShowStreak(false);
                }

                const tg = (window as any).Telegram?.WebApp;
                if (tg?.showAlert) {
                    const msg = data.rewardType === 'CHEST'
                        ? `Mystery Chest Opened! +${data.reward} ⭐ and more!`
                        : `Day ${data.streakDay} reward claimed! +${data.reward} ⭐`;
                    tg.showAlert(msg);
                }

                if (data.rewardType !== 'CHEST') setShowStreak(false);
            } else {
                console.warn('Daily claim failed:', data.error);
                setShowStreak(false);
            }
        } catch (e) {
            console.error('Claim error:', e);
            setShowStreak(false);
        }
    };

    useEffect(() => {
        const fetchPreview = async () => {
            try {
                const res = await fetch(`${API_URL}/api/leaderboard?limit=2`);
                const data = await res.json();
                if (data.leaderboard) {
                    setLeaderboardPreview(data.leaderboard.slice(0, 2));
                }
            } catch (e) {
                console.error('Failed to fetch leaderboard preview:', e);
            }
        };
        fetchPreview();
    }, []);

    return (
        <MainLayout>
            <div className="bg-mesh min-h-full">
                {/* Play Modes */}
                <div className="space-y-3">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-1">Play Now</h2>

                    {/* Free Practice */}
                    <div
                        onClick={() => navigate('/quiz', { state: { type: 'practice', entryFee: 'Free' } })}
                        className="bg-gradient-to-r from-green-500/15 to-green-600/5 border border-green-500/20 rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <div className="text-4xl">🎮</div>
                        <div className="flex-1">
                            <h3 className="font-black text-base uppercase italic tracking-tighter text-green-400">Free Practice</h3>
                            <p className="text-[10px] text-white/40 font-bold mt-0.5">5 questions • Win 5⭐ + XP</p>
                        </div>
                        <ArrowRight size={20} className="text-green-400" />
                    </div>

                    {/* Star Battle */}
                    <div
                        onClick={() => navigate('/tournaments')}
                        className="bg-gradient-to-r from-yellow-500/15 to-amber-600/5 border border-yellow-500/20 rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer"
                    >
                        <div className="text-4xl">⭐</div>
                        <div className="flex-1">
                            <h3 className="font-black text-base uppercase italic tracking-tighter text-yellow-400">Star Battle</h3>
                            <p className="text-[10px] text-white/40 font-bold mt-0.5">Join or create rooms • Win Stars</p>
                        </div>
                        <ArrowRight size={20} className="text-yellow-400" />
                    </div>

                    {/* TON Arena */}
                    <div
                        className="bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/15 rounded-2xl p-5 flex items-center gap-4 opacity-60"
                    >
                        <div className="text-4xl">💎</div>
                        <div className="flex-1">
                            <h3 className="font-black text-base uppercase italic tracking-tighter text-blue-400">TON Arena</h3>
                            <p className="text-[10px] text-white/40 font-bold mt-0.5">Real TON prizes • Coming Soon</p>
                        </div>
                        <span className="bg-blue-500/20 text-blue-300 text-[8px] font-black px-2 py-1 rounded-full uppercase">Soon</span>
                    </div>

                    {/* Squads Global Battle */}
                    <div
                        onClick={() => navigate('/squads')}
                        className="bg-gradient-to-br from-primary/10 via-black/40 to-black/60 border border-primary/20 rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
                        <div className="flex items-center gap-5 relative z-10">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Users size={32} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-black text-xl uppercase italic tracking-tighter text-white">Squads</h3>
                                    <span className="bg-amber-500 text-black text-[8px] font-black px-2 py-0.5 rounded italic">100 TON POOL</span>
                                </div>
                                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">
                                    Join/Create a squad and battle for the global weekly prize.
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <ArrowRight size={24} className="text-primary opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
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

                    {/* Daily Quests */}
                    <div
                        onClick={() => navigate('/quests')}
                        className="bg-white/5 border border-white/10 p-5 rounded-3xl active:scale-[0.98] transition-all flex flex-col justify-between aspect-square cursor-pointer hover:border-primary/30"
                    >
                        <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-4">
                            <Rocket size={24} className="text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg uppercase italic tracking-tighter leading-none mb-1">Daily Quests</h3>
                            <p className="text-[10px] opacity-60 font-bold leading-tight uppercase tracking-tighter">Complete tasks to earn huge rewards.</p>
                        </div>
                        <div className="mt-4 flex items-center text-yellow-400 text-[10px] font-black uppercase tracking-widest gap-2 italic">
                            View Quests <ArrowRight size={14} />
                        </div>
                    </div>
                </div>

                {/* Leaderboard Preview */}
                <div className="space-y-4 mt-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-lg uppercase italic tracking-tighter">Top Players Today</h3>
                        <button onClick={() => navigate('/leaderboard')} className="text-primary text-[10px] font-black uppercase tracking-widest italic">See All</button>
                    </div>
                    <div className="space-y-3">
                        {leaderboardPreview.length > 0 ? (
                            leaderboardPreview.map((player) => (
                                <LeaderboardItem
                                    key={player.rank}
                                    rank={player.rank}
                                    name={player.name}
                                    winCount={parseInt(player.score) || 0}
                                    reward={player.reward}
                                    isTop={player.rank === 1}
                                />
                            ))
                        ) : (
                            <div className="p-4 text-center text-white/30 text-xs font-black italic">Loading...</div>
                        )}
                    </div>
                </div>
            </div>

            {showStreak && (
                <StreakPopup
                    day={streakDay}
                    reward={streakReward}
                    rewardType={rewardType}
                    chestItems={chestItems}
                    onClaim={handleClaim}
                    onClose={() => setShowStreak(false)}
                />
            )}
        </MainLayout>
    );
};

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
            <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">Total XP</p>
        </div>
    </div>
);
