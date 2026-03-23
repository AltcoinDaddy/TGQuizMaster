import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { authGet, authPost } from '../../utils/authFetch';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Users, ChevronLeft, Share2, LogOut, Award } from 'lucide-react';

interface Member {
    telegram_id: number;
    username: string;
    stats_xp: number;
}

interface Squad {
    id: string;
    name: string;
    avatar_url: string;
    weekly_xp: number;
    total_xp: number;
    member_count: number;
}

export const SquadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAppStore();
    const [squad, setSquad] = useState<Squad | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await authGet(`/api/squad/${id}`).then(r => r.json());
                setSquad(data.squad);
                setMembers(data.members || []);
            } catch (e) {
                console.error('Failed to fetch squad detail:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleJoin = async () => {
        if (!id) return;
        setJoining(true);
        try {
            await authPost('/api/squad/join', { squadId: id });
            // Refresh local state/store
            useAppStore.getState().setUser({ squadId: id, squadName: squad?.name });
            window.location.reload(); // Simplest way to refresh all XP data
        } catch (e) {
            console.error('Join failed:', e);
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        const confirm = window.confirm('Leave this squad? You will stop contributing XP to their weekly total.');
        if (!confirm) return;

        try {
            await authPost('/api/squad/leave', {});
            useAppStore.getState().setUser({ squadId: undefined, squadName: undefined });
            navigate('/squads');
        } catch (e) {
            console.error('Leave failed:', e);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen text-primary italic font-black">LOADING...</div>;
    if (!squad) return <div className="p-8 text-center text-white/40 font-black italic">Squad not found</div>;

    const isMySquad = user.squadId === squad.id;

    return (
        <div className="flex flex-col min-h-screen bg-black/40 backdrop-blur-xl pb-24">
            {/* Nav */}
            <div className="p-6 flex items-center justify-between">
                <button onClick={() => navigate('/squads')} className="p-2 bg-white/5 rounded-xl text-white/60">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex gap-2">
                    <button className="p-2 bg-white/5 rounded-xl text-white/60">
                        <Share2 size={20} />
                    </button>
                    {isMySquad && (
                        <button onClick={handleLeave} className="p-2 bg-white/5 rounded-xl text-white/40">
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Squad Info */}
            <div className="flex flex-col items-center px-6 pb-8 text-center">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/30 to-black/60 border border-primary/20 flex items-center justify-center overflow-hidden mb-4 shadow-[0_0_50px_rgba(13,242,89,0.15)]">
                    {squad.avatar_url ? (
                        <img src={squad.avatar_url} alt={squad.name} className="w-full h-full object-cover" />
                    ) : (
                        <Users size={48} className="text-primary" />
                    )}
                </div>
                <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">{squad.name}</h1>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Squad ID: {squad.id.slice(0, 8)}</p>

                {!isMySquad && (
                    <Button
                        variant="primary"
                        className="mt-6 px-12"
                        onClick={handleJoin}
                        disabled={joining}
                    >
                        {joining ? 'JOINING...' : 'JOIN SQUAD'}
                    </Button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 px-4 mb-8">
                <GlassCard className="py-4 text-center">
                    <span className="text-[10px] font-black text-white/30 uppercase block mb-1">Weekly XP</span>
                    <span className="text-xl font-black text-primary italic">{squad.weekly_xp}</span>
                </GlassCard>
                <GlassCard className="py-4 text-center text-amber-500">
                    <span className="text-[10px] font-black text-white/30 uppercase block mb-1">Global Rank</span>
                    <span className="text-xl font-black italic">#4</span>
                </GlassCard>
            </div>

            {/* Members List */}
            <div className="px-4 space-y-4">
                <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic px-2">Top Members</h3>
                <div className="space-y-2">
                    {members.map((member, idx) => (
                        <div
                            key={member.telegram_id}
                            className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/5"
                        >
                            <div className="flex items-center gap-3">
                                <span className="w-4 text-[10px] font-black text-white/20 italic">{idx + 1}</span>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black overflow-hidden border border-white/10">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} alt="" />
                                </div>
                                <div>
                                    <span className="text-sm font-bold text-white/90">@{member.username}</span>
                                    {member.telegram_id.toString() === user.telegramId && (
                                        <span className="ml-2 text-[8px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-black uppercase">YOU</span>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs font-black text-white/40 italic">{member.stats_xp} XP</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Weekly Goal Call to Action */}
            <div className="p-6 mt-4">
                <GlassCard className="border-amber-500/20 bg-amber-500/5 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                        <Award size={24} />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-white uppercase italic">Weekly Target</h4>
                        <p className="text-[10px] text-white/60">Hit **10,000 XP** as a squad to unlock specialized rewards.</p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
