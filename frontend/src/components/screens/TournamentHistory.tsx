import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { GlassCard } from '../ui/GlassCard';
import { ChevronLeft, Trophy, Clock, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HistoryItem {
    id: string;
    title: string;
    date: string;
    rank: number;
    reward: string;
    accuracy: string;
    speed: string;
    status: 'WINNER' | 'PARTICIPANT';
}

export const TournamentHistory: React.FC = () => {
    const navigate = useNavigate();

    const history: HistoryItem[] = [
        {
            id: '1',
            title: 'Weekly Crypto Quiz',
            date: 'Oct 24, 2023 • 18:30',
            rank: 2,
            reward: '+0.15 TON',
            accuracy: '18/20',
            speed: '+1.2s',
            status: 'WINNER'
        },
        {
            id: '2',
            title: 'The Open Network Trivia',
            date: 'Oct 22, 2023 • 14:15',
            rank: 15,
            reward: '+0.02 TON',
            accuracy: '14/20',
            speed: '+0.8s',
            status: 'PARTICIPANT'
        },
        {
            id: '3',
            title: 'Elite Master Cup',
            date: 'Oct 19, 2023 • 21:00',
            rank: 1,
            reward: '+1.50 TON',
            accuracy: '20/20',
            speed: '+2.1s',
            status: 'WINNER'
        }
    ];

    return (
        <MainLayout>
            <div className="p-6 pt-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-primary active:scale-95 transition-all"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-white">History</h1>
                </div>

                {/* Summary Card */}
                <GlassCard className="p-6 mb-8 bg-gradient-to-br from-primary/20 to-transparent border-primary/30">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Total Earnings</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <Trophy size={18} />
                                </div>
                                <span className="text-3xl font-black text-white italic">12.45 <span className="text-sm not-italic opacity-50 ml-1">TON</span></span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Win Rate</p>
                            <span className="text-2xl font-black text-primary italic">68%</span>
                        </div>
                    </div>
                </GlassCard>

                {/* History List */}
                <div className="space-y-4 mb-24">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-white/40">Recent Games</h2>
                    </div>

                    {history.map((item) => (
                        <GlassCard key={item.id} className="p-4 border-white/5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-sm text-white mb-1">{item.title}</h3>
                                    <div className="flex items-center gap-1.5 text-white/40">
                                        <Clock size={10} />
                                        <span className="text-[10px] font-bold uppercase">{item.date}</span>
                                    </div>
                                </div>
                                {item.status === 'WINNER' && (
                                    <div className="bg-primary/10 border border-primary/30 text-primary px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(13,242,89,0.1)]">
                                        WINNER
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-extrabold uppercase text-white/30 tracking-wider mb-1">Rank</span>
                                    <span className={`text-xl font-black ${item.rank <= 3 ? 'text-yellow-400' : 'text-white'}`}>#{item.rank}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] font-extrabold uppercase text-white/30 tracking-wider mb-1">Reward</span>
                                    <span className="text-xl font-black text-primary">{item.reward}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-bold text-white/30 uppercase">ACC:</span>
                                        <span className="text-[10px] font-black text-white">{item.accuracy}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="text-[10px] font-bold text-white/30 uppercase">SPD:</span>
                                        <span className="text-[10px] font-black text-white">{item.speed}</span>
                                    </div>
                                </div>
                                <button className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 active:scale-95">
                                    STATS
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};
