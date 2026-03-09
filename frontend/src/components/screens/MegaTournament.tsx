import React, { useState, useEffect } from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Trophy, Star, ArrowLeft, Zap, Gift, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../config/api';
import { useAppStore } from '../../store/useAppStore';
import { getTimeRemaining } from '../../utils/time';

export const MegaTournament: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAppStore();
    const [season, setSeason] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSeasonData = async () => {
            try {
                // 1. Fetch Active Season
                const sRes = await fetch(`${API_URL}/api/tournament-season/active`);
                const sData = await sRes.json();

                if (sData.season) {
                    setSeason(sData.season);
                    // 2. Fetch Leaderboard for this season
                    const lRes = await fetch(`${API_URL}/api/tournament-season/${sData.season.id}/leaderboard`);
                    const lData = await lRes.json();
                    setLeaderboard(lData.leaderboard || []);
                }
            } catch (e) {
                console.error('Failed to fetch season data:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchSeasonData();
    }, []);

    const myRank = leaderboard.findIndex(p => p.telegram_id === user.telegramId) + 1;
    const myScore = leaderboard.find(p => p.telegram_id === user.telegramId)?.season_xp || 0;

    if (loading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-yellow-500 font-black italic uppercase tracking-widest animate-pulse">Loading Season...</p>
                </div>
            </MainLayout>
        );
    }

    if (!season) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                    <Trophy size={64} className="text-white/10 mb-6" />
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-2">No Active Season</h2>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest mb-8">The next Mega Tournament is being prepared. Stay tuned!</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-white/10 text-white px-8 py-4 rounded-3xl font-black uppercase tracking-widest italic flex items-center gap-2 hover:bg-white/20 transition-all"
                    >
                        <ArrowLeft size={20} /> Back Home
                    </button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="pb-24">
                {/* Header Section */}
                <div className="relative pt-6 pb-12 overflow-hidden px-1">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-6 text-white/40 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Back to Hub</span>
                    </button>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase italic tracking-tighter shadow-lg shadow-yellow-400/20">Active Season</span>
                            <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
                                <Timer size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    Ends in {getTimeRemaining(season.end_time)}
                                </span>
                            </div>
                        </div>
                        <h1 className="text-5xl font-black uppercase italic tracking-tighter text-white leading-none mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                            {season.title}
                        </h1>
                        <p className="text-sm text-white/60 font-medium max-w-[80%] leading-relaxed">
                            Play any ranked game to earn Season XP. The Top 30 players will split 20 Million Stars and unlock Legendary Mystery Chests.
                        </p>
                    </div>

                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -ml-24 -mb-24" />
                </div>

                {/* Prize Pool Highlights */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-gradient-to-br from-yellow-500/20 to-transparent border border-yellow-500/20 rounded-[32px] p-6 relative overflow-hidden group">
                        <Star size={48} className="absolute -top-4 -right-4 text-yellow-400/10 group-hover:scale-125 transition-transform duration-700" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400/60 mb-2">Grand Prize</p>
                        <h3 className="text-3xl font-black italic tracking-tighter text-white mb-1">20.0M</h3>
                        <p className="text-[8px] font-black uppercase tracking-tighter text-white/40">Stars Pool</p>
                    </div>
                    <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 rounded-[32px] p-6 relative overflow-hidden group">
                        <Gift size={48} className="absolute -top-4 -right-4 text-primary/10 group-hover:scale-125 transition-transform duration-700" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-2">Exclusive Drop</p>
                        <h3 className="text-3xl font-black italic tracking-tighter text-white mb-1">Mega</h3>
                        <p className="text-[8px] font-black uppercase tracking-tighter text-white/40">Chests for Top 30</p>
                    </div>
                </div>

                {/* My Standing Section */}
                <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 flex flex-col items-end opacity-20">
                        <Zap size={64} className="text-primary mb-2" />
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-6">Your Performance</h3>
                        <div className="flex items-center gap-10">
                            <div>
                                <p className="text-4xl font-black italic text-white tracking-tighter mb-1">
                                    {myRank > 0 ? `#${myRank}` : '---'}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Current Rank</p>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10" />
                            <div>
                                <p className="text-4xl font-black italic text-primary tracking-tighter mb-1">
                                    {myScore.toLocaleString()}
                                </p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Season XP</p>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <button
                                onClick={() => navigate('/tournaments')}
                                className="bg-primary text-black px-8 py-4 rounded-full font-black uppercase tracking-widest italic flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-primary/20"
                            >
                                Play Ranked <Zap size={18} fill="currentColor" />
                            </button>
                            <p className="text-[9px] font-bold text-white/20 italic max-w-[120px] text-right">
                                Every correct answer in Star Battles adds to your score
                            </p>
                        </div>
                    </div>
                </div>

                {/* Leaderboard Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-xl uppercase italic tracking-tighter text-white">Season Leaderboard</h3>
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Showing Top 30</span>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-[40px] overflow-hidden">
                        {leaderboard.length > 0 ? (
                            leaderboard.map((player, index) => (
                                <LeaderboardRow
                                    key={player.telegram_id}
                                    rank={index + 1}
                                    name={player.username}
                                    score={player.season_xp}
                                    isMe={player.telegram_id === user.telegramId}
                                />
                            ))
                        ) : (
                            <div className="py-20 text-center opacity-30 italic font-black text-sm uppercase tracking-widest">
                                No players yet. Be the first!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

const LeaderboardRow = ({ rank, name, score, isMe }: any) => {
    const isPrizeTier = rank <= 30;
    const isTop3 = rank <= 3;

    return (
        <div className={`flex items-center justify-between p-5 border-b border-white/[0.03] last:border-0 ${isMe ? 'bg-primary/10' : ''}`}>
            <div className="flex items-center gap-4">
                <div className={`w-8 text-center font-black italic text-lg ${isTop3 ? 'text-yellow-400' : 'opacity-20'}`}>
                    {rank}
                </div>
                <div className="relative">
                    <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'Anon'}`}
                        className={`w-10 h-10 rounded-full border-2 ${isTop3 ? 'border-yellow-400' : 'border-white/10'}`}
                        alt={name}
                    />
                    {isTop3 && <span className="absolute -top-1 -right-1 text-xs">👑</span>}
                </div>
                <div>
                    <h4 className={`font-black text-sm uppercase italic tracking-tighter ${isMe ? 'text-primary' : 'text-white'}`}>
                        {name || 'Anon Player'} {isMe && <span className="text-[8px] lowercase font-medium ml-1 opacity-60">(you)</span>}
                    </h4>
                    {isPrizeTier && (
                        <div className="flex items-center gap-1 mt-0.5">
                            <Star size={8} fill="#facc15" className="text-yellow-400" />
                            <span className="text-[8px] font-black text-yellow-400/60 uppercase tracking-tighter">In Prize Tier</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="text-right">
                <p className="text-lg font-black italic tracking-tighter text-white">
                    {parseInt(score || 0).toLocaleString()}
                </p>
                <p className="text-[8px] font-black uppercase text-white/20 tracking-widest uppercase">XP</p>
            </div>
        </div>
    );
};
