import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';
import { authPost } from '../../utils/authFetch';
import { MainLayout } from '../layout/MainLayout';
import { ArrowRight, Users, Gamepad2, Star, Gem, Trophy, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StreakPopup } from '../ui/StreakPopup';
import { useAppStore } from '../../store/useAppStore';
import { adsService } from '../../utils/AdsService';

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const [showStreak, setShowStreak] = useState(false);
    const [streakDay, setStreakDay] = useState(1);
    const [streakReward, setStreakReward] = useState('50');
    const [rewardType, setRewardType] = useState<'STARS' | 'CHEST'>('STARS');
    const [chestItems, setChestItems] = useState<any>(null);
    const [leaderboardPreview, setLeaderboardPreview] = useState<any[]>([]);
    const [loadingAd, setLoadingAd] = useState(false);
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

        // Trigger profile sync to ensure fresh energy/stars data
        const socket = (window as any).socket;
        const tg = (window as any).Telegram?.WebApp;

        // NEW: Handle Deep Linking (startapp=room_ID)
        const startParam = tg?.initDataUnsafe?.start_param;
        const hasProcessed = sessionStorage.getItem('startParamProcessed');

        if (startParam && startParam.startsWith('room_') && !hasProcessed) {
            const roomId = startParam.replace('room_', '');
            console.log(`[DEEP LINK] Joining room: ${roomId}`);
            sessionStorage.setItem('startParamProcessed', 'true');
            navigate(`/quiz?roomId=${roomId}&type=tournament`);
            return;
        }

        if (socket && user.telegramId) {
            socket.emit('sync_profile', {
                telegramId: user.telegramId,
                initData: tg?.initData
            });
        }
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
                        ? `Mystery Chest Opened! +${data.reward} Stars and more!`
                        : `Day ${data.streakDay} reward claimed! +${data.reward} Stars`;
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

    const handleStartPractice = async () => {
        if (loadingAd) return;

        const gamesLeft = Math.max(0, 10 - (user.dailyGamesToday || 0));
        if (gamesLeft > 0) {
            navigate('/quiz', { state: { type: 'practice', entryFee: 'Free' } });
        } else {
            // Show Ad to refill
            setLoadingAd(true);
            try {
                const success = await adsService.showRewardedVideo();
                if (success) {
                    const res = await authPost('/api/refill-energy', { telegramId: user.telegramId });
                    const data = await res.json();
                    if (data.success) {
                        useAppStore.getState().setUser({ dailyGamesToday: data.dailyGamesToday });
                        const tg = (window as any).Telegram?.WebApp;
                        if (tg?.showAlert) tg.showAlert(`Energy refilled! +5 games added.`);
                    }
                }
            } catch (e) {
                console.error('Failed to refill energy:', e);
            } finally {
                setLoadingAd(false);
            }
        }
    };

    return (
        <MainLayout>
            <div className="bg-mesh min-h-full">
                {/* Play Modes */}
                <div className="space-y-3">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-1">Play Now</h2>

                    <div
                        onClick={handleStartPractice}
                        className="bg-white/5 border border-white/10 rounded-[32px] p-4 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group hover:bg-white/[0.07]"
                    >
                        {Math.max(0, 10 - (user.dailyGamesToday || 0)) === 0 && (
                            <div className="absolute top-0 right-0 bg-primary text-black text-[8px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-tighter z-10 shadow-lg shadow-primary/20">Refill Ready</div>
                        )}

                        <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 group-hover:scale-110 transition-transform">
                            {loadingAd ? (
                                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Gamepad2 size={32} fill="currentColor" fillOpacity={0.1} className="drop-shadow-[0_0_10px_rgba(74,222,128,0.4)]" />
                            )}
                        </div>

                        <div className="flex-1">
                            <h3 className={`font-black text-lg uppercase italic tracking-tighter ${loadingAd ? 'text-white/20' : 'text-white'} flex items-center gap-2 mb-0.5`}>
                                {loadingAd ? 'Loading Ad...' : 'Free Practice'}
                                {Math.max(0, 10 - (user.dailyGamesToday || 0)) === 0 && !loadingAd && <span className="text-[10px] text-primary/60 font-black tracking-widest uppercase">(AD REFILL)</span>}
                            </h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">
                                {loadingAd ? 'Please wait...' : `${Math.max(0, 10 - (user.dailyGamesToday || 0))}/10 Energy • Win 5★ + XP`}
                            </p>
                        </div>
                        <ArrowRight size={20} className="text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* Star Battle */}
                    <div
                        onClick={() => navigate('/tournaments')}
                        className="bg-white/5 border border-white/10 rounded-[32px] p-4 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer group hover:bg-white/[0.07]"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-400 border border-yellow-500/20 group-hover:scale-110 transition-transform">
                            <Star size={32} fill="currentColor" fillOpacity={0.1} className="drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-lg uppercase italic tracking-tighter text-white mb-0.5">Star Battle</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">Join rooms • Win Stars</p>
                        </div>
                        <ArrowRight size={20} className="text-white/20 group-hover:text-yellow-400 group-hover:translate-x-1 transition-all" />
                    </div>

                    {/* TON Arena */}
                    <div
                        className="bg-white/5 border border-white/10 rounded-[32px] p-4 flex items-center gap-4 opacity-50 relative overflow-hidden group transition-all"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                            <Gem size={32} fill="currentColor" fillOpacity={0.1} className="drop-shadow-[0_0_10px_rgba(96,165,250,0.4)]" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black text-lg uppercase italic tracking-tighter text-white mb-0.5">TON Arena</h3>
                            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest leading-none">Real TON prizes • Coming Soon</p>
                        </div>
                        <span className="bg-blue-500/20 text-blue-300 text-[8px] font-black px-3 py-1 rounded-full uppercase italic tracking-tighter border border-blue-500/20 mr-2">Soon</span>
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
                        onClick={handleStartPractice}
                        className="bg-white/5 border border-white/10 p-5 rounded-[32px] active:scale-[0.98] transition-all flex flex-col justify-between aspect-square cursor-pointer hover:bg-white/[0.07] group relative overflow-hidden"
                    >
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 relative border border-green-500/20 text-green-400 group-hover:scale-110 transition-transform">
                            {loadingAd ? (
                                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Gamepad2 size={24} fill="currentColor" fillOpacity={0.1} />
                            )}
                            {Math.max(0, 10 - (user.dailyGamesToday || 0)) === 0 && !loadingAd && (
                                <div className="absolute -top-2 -right-2 bg-primary text-background-dark text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-primary/20 animate-pulse">Refill</div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-black text-lg uppercase italic tracking-tighter leading-none ${loadingAd ? 'text-white/20' : 'text-white'}`}>
                                    {loadingAd ? 'Refilling...' : 'Daily Training'}
                                </h3>
                                <span className={`text-[10px] font-black ${loadingAd ? 'text-white/20' : 'text-primary'}`}>
                                    {Math.max(0, 10 - (user.dailyGamesToday || 0))}/10
                                    <Zap size={10} fill="currentColor" className="inline ml-1 mb-0.5 text-primary" />
                                </span>
                            </div>
                            <p className="text-[10px] opacity-40 font-bold leading-tight uppercase tracking-widest leading-none">
                                {loadingAd ? 'Station connection...' : 'Earn free XP and Stars every day.'}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center text-primary text-[10px] font-black uppercase tracking-widest gap-2 italic group-hover:translate-x-1 transition-all">
                            {loadingAd ? (
                                <span className="animate-pulse">Loading Ad...</span>
                            ) : Math.max(0, 10 - (user.dailyGamesToday || 0)) > 0 ? (
                                <>Enter Arena <ArrowRight size={14} /></>
                            ) : (
                                <>Watch & Refill <Gamepad2 size={14} /></>
                            )}
                        </div>
                    </div>

                    {/* Daily Quests */}
                    <div
                        onClick={() => navigate('/quests')}
                        className="bg-white/5 border border-white/10 p-5 rounded-[32px] active:scale-[0.98] transition-all flex flex-col justify-between aspect-square cursor-pointer hover:bg-white/[0.07] group"
                    >
                        <div className="w-12 h-12 bg-yellow-400/10 rounded-2xl flex items-center justify-center mb-4 border border-yellow-400/20 text-yellow-400 group-hover:scale-110 transition-transform">
                            <Trophy size={24} fill="currentColor" fillOpacity={0.1} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg uppercase italic tracking-tighter leading-none mb-1 text-white">Daily Quests</h3>
                            <p className="text-[10px] opacity-40 font-bold leading-tight uppercase tracking-widest leading-none">Complete challenges for rewards.</p>
                        </div>
                        <div className="mt-4 flex items-center text-yellow-400 text-[10px] font-black uppercase tracking-widest gap-2 italic group-hover:translate-x-1 transition-all">
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
