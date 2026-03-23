import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config/api';
import { getInitData } from '../../utils/socket';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { ChevronLeft, Users, Trophy, Activity, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';

interface Stats {
    totalUsers: number;
    monthlySignups: number;
    activePlayers: number;
    economicallyActiveUsers: number;
    totalTournaments: number;
    totalPrizePool: string;
    dailySignups?: Record<string, number>;
}

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const initData = getInitData();
                const headers: Record<string, string> = {
                    'x-admin-id': useAppStore.getState().user.telegramId
                };
                if (initData) headers['x-telegram-init-data'] = initData;

                const res = await fetch(`${API_URL}/api/admin/stats`, { headers });
                const data = await res.json();
                if (data.success) {
                    setStats(data.stats);
                }
            } catch (e) {
                console.error('Failed to fetch admin stats:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white italic tracking-tighter uppercase italic">Admin Dashboard</h1>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20 animate-pulse text-white/20 font-black italic">
                        FETCHING METRICS...
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Highlights Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                icon={<Users size={20} />}
                                label="Total Users"
                                value={stats?.totalUsers.toString() || '0'}
                                color="text-primary"
                                subtitle="All registered"
                            />
                            <StatCard
                                icon={<Calendar size={20} />}
                                label="Monthly Signups"
                                value={stats?.monthlySignups.toString() || '0'}
                                color="text-green-400"
                                subtitle="Last 30 days"
                            />
                            <StatCard
                                icon={<Activity size={20} />}
                                label="Active Players"
                                value={stats?.activePlayers.toString() || '0'}
                                color="text-blue-400"
                                subtitle="Played > 0 games"
                            />
                            <StatCard
                                icon={<DollarSign size={20} />}
                                label="Transacting"
                                value={stats?.economicallyActiveUsers.toString() || '0'}
                                color="text-yellow-400"
                                subtitle="Made a transaction"
                            />
                            <StatCard
                                icon={<Trophy size={20} />}
                                label="Tournaments"
                                value={stats?.totalTournaments.toString() || '0'}
                                color="text-purple-400"
                            />
                        </div>

                        {/* Revenue/Prize Pool Card */}
                        <GlassCard className="p-6 bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500/60 mb-1 italic">Total Prize Pool</p>
                                    <h2 className="text-3xl font-black italic text-white">{stats?.totalPrizePool} <span className="text-sm not-italic opacity-30">STARS/CHZ</span></h2>
                                </div>
                                <div className="p-4 bg-yellow-500/10 rounded-2xl text-yellow-500">
                                    <DollarSign size={28} />
                                </div>
                            </div>
                        </GlassCard>

                        {/* Growth Info */}
                        <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4 flex items-center gap-2">
                                <TrendingUp size={14} className="text-primary" />
                                Ecosystem Status
                            </h3>
                            <div className="space-y-4">
                                <StatusRow label="Database Connection" status="Healthy" />
                                <StatusRow label="Bot Polling" status="Active" />
                                <StatusRow label="Analytics Sync" status="Real-time" />
                            </div>
                        </div>

                        <p className="text-center text-[8px] font-bold text-white/20 uppercase tracking-[0.4em] pt-4">
                            Authorized Access Only • TGQuizMaster v1.0
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

const StatCard = ({ icon, label, value, color, subtitle }: any) => (
    <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] flex flex-col items-center justify-center text-center">
        <div className={`p-2.5 rounded-xl bg-white/5 ${color} mb-3`}>
            {icon}
        </div>
        <span className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1 italic">{label}</span>
        <span className={`text-2xl font-black italic ${color}`}>{value}</span>
        {subtitle && <span className="text-[8px] font-bold opacity-20 mt-1 uppercase">{subtitle}</span>}
    </div>
);

const StatusRow = ({ label, status }: any) => (
    <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-white/60">{label}</span>
        <span className="text-[10px] font-black text-primary uppercase italic tracking-widest">{status}</span>
    </div>
);
