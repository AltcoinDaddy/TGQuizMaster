import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authGet } from '../../utils/authFetch';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Users, Trophy, ChevronRight, Search, PlusCircle, MessageSquare } from 'lucide-react';

interface Squad {
    id: string;
    name: string;
    avatar_url: string;
    weekly_xp: number;
    total_xp: number;
    member_count: number;
}

export const Squads = () => {
    const navigate = useNavigate();
    const [squads, setSquads] = useState<Squad[]>([]);
    const [loading, setLoading] = useState(true);
    const [mySquad, setMySquad] = useState<Squad | null>(null);

    useEffect(() => {
        const fetchSquadData = async () => {
            try {
                const [listResp, myResp] = await Promise.all([
                    authGet('/api/squads').then(r => r.json()),
                    authGet('/api/squad/my').then(r => r.json())
                ]);
                setSquads(listResp.squads || []);
                setMySquad(myResp.squad || null);
            } catch (e) {
                console.error('Failed to fetch squads:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchSquadData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-transparent">
                <div className="animate-pulse text-primary font-black italic">LOADING SQUADS...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-black/40 backdrop-blur-xl pb-24 animate-in fade-in duration-500">
            {/* Header */}
            <div className="px-6 pt-12 pb-6">
                <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Squads</h1>
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-1">Climb the global ranks</p>
            </div>

            {/* My Squad Section */}
            <div className="px-4 mb-8">
                {mySquad ? (
                    <GlassCard
                        className="border-primary/30 relative overflow-hidden group cursor-pointer"
                        onClick={() => navigate(`/squad/${mySquad.id}`)}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/20 transition-all duration-500" />
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-black/60 border border-primary/20 flex items-center justify-center overflow-hidden">
                                {mySquad.avatar_url ? (
                                    <img src={mySquad.avatar_url} alt={mySquad.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Users size={32} className="text-primary" />
                                )}
                            </div>
                            <div className="flex-1">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">My Squad</span>
                                <h2 className="text-xl font-black text-white italic">{mySquad.name}</h2>
                                <div className="flex items-center gap-3 mt-1 text-white/40 text-xs font-bold uppercase">
                                    <span className="flex items-center gap-1"><Users size={12} /> {mySquad.member_count}</span>
                                    <span className="flex items-center gap-1"><Trophy size={12} className="text-amber-400" /> {mySquad.weekly_xp} Weekly XP</span>
                                </div>
                            </div>
                            <ChevronRight className="text-white/20" />
                        </div>
                    </GlassCard>
                ) : (
                    <GlassCard className="border-dashed border-white/10 flex flex-col items-center py-8 text-center bg-white/[0.02]">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Users size={32} className="text-white/20" />
                        </div>
                        <h2 className="text-lg font-black text-white uppercase italic">Not in a Squad</h2>
                        <p className="text-white/40 text-xs max-w-[240px] mt-2 mb-6">
                            Join a squad to compete for the weekly **100 TON** prize pool!
                        </p>
                        <div className="flex gap-3 w-full max-w-[280px]">
                            <Button variant="outline" className="flex-1 text-[10px]" onClick={() => navigate('/squad/create')}>
                                <PlusCircle size={14} className="mr-1" /> CREATE
                            </Button>
                            <Button variant="primary" className="flex-1 text-[10px]" onClick={() => {
                                // Scroll to list or open search
                                const searchInput = document.getElementById('squad-search');
                                searchInput?.focus();
                            }}>
                                <Search size={14} className="mr-1" /> JOIN
                            </Button>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Weekly Prize Pool Card */}
            <div className="px-4 mb-8">
                <GlassCard className="bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-white uppercase italic tracking-wider">Weekly Global Pool</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-amber-400">100</span>
                                    <span className="text-sm font-black text-amber-500/80">TON</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-bold text-white/30 uppercase block">Resets in</span>
                            <span className="text-xs font-black text-white italic">3d 14h 22m</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            {/* Squad Leaderboard */}
            <div className="px-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic">Weekly Rankings</h3>
                    <div className="relative">
                        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/20" />
                        <input
                            id="squad-search"
                            type="text"
                            placeholder="FIND SQUAD..."
                            className="bg-white/5 border border-white/10 rounded-full pl-7 pr-3 py-1 text-[9px] font-bold text-white focus:outline-none focus:border-primary/50 transition-all w-32"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    {squads.map((squad, index) => (
                        <GlassCard
                            key={squad.id}
                            className="py-3 flex items-center gap-4 hover:border-white/20 active:scale-[0.98] transition-all cursor-pointer"
                            onClick={() => navigate(`/squad/${squad.id}`)}
                        >
                            <div className="w-6 text-center text-xs font-black italic text-white/20">
                                {index + 1}
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                                {squad.avatar_url ? (
                                    <img src={squad.avatar_url} alt={squad.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Users size={20} className="text-white/20" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white text-sm">{squad.name}</h4>
                                <span className="text-[10px] text-white/30 font-bold uppercase">{squad.member_count} Members</span>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black text-primary italic block">{squad.weekly_xp} XP</span>
                                {index < 3 && (
                                    <span className="text-[8px] font-black text-amber-500 uppercase">
                                        +{[50, 30, 20][index]} TON
                                    </span>
                                )}
                            </div>
                        </GlassCard>
                    ))}

                    {squads.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-white/20 text-xs italic font-bold">No squads found...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Social Recruitment Tip */}
            <div className="px-6 mt-12 pb-8">
                <GlassCard className="bg-primary/5 border-primary/20 py-4 flex gap-4 items-start">
                    <div className="p-2 bg-primary/20 rounded-xl text-primary mt-1">
                        <MessageSquare size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-white uppercase italic">Viral Tip</h4>
                        <p className="text-[10px] text-white/60 leading-relaxed mt-1">
                            Recruit members from other Telegram groups to boost your squad's XP and win the **Global TON Prize**!
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
