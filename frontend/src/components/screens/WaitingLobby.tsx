import React from 'react';
import { MainLayout } from '../layout/MainLayout';
import { Button } from '../ui/Button';
import { Copy, Users, MessageSquare, LogOut, ChevronLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WaitingLobby: React.FC = () => {
    const navigate = useNavigate();

    const players = [
        { id: 1, name: 'Alex K.', isHost: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
        { id: 2, name: 'Sarah J.', isHost: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
        { id: 3, name: 'Mike Ross', isHost: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
    ];

    const maxPlayers = 6;
    const emptySlots = Array(maxPlayers - players.length).fill(null);

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                {/* V2 Header */}
                <header className="flex items-center justify-between mb-10">
                    <button onClick={() => navigate(-1)} className="bg-white/5 p-2.5 rounded-2xl border border-white/10 text-white/40 hover:text-primary transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-primary italic">Live Lobby</span>
                        <h1 className="text-sm font-black text-white italic tracking-widest uppercase">Quick Match #442</h1>
                    </div>
                    <button className="bg-white/5 p-2.5 rounded-2xl border border-white/10 text-white/40 hover:text-red-500 transition-all">
                        <LogOut size={20} />
                    </button>
                </header>

                {/* Neon Room Code Card */}
                <div className="mb-12 relative">
                    <div className="absolute inset-0 bg-accent-purple/20 blur-3xl rounded-full scale-75 -z-10"></div>
                    <div className="bg-slate-900 border border-accent-purple/30 rounded-[2.5rem] p-8 flex flex-col items-center relative overflow-hidden bonus-glow">
                        <div className="absolute top-0 right-0 bg-accent-purple/10 px-4 py-1 rounded-bl-2xl">
                            <span className="text-[8px] font-black text-accent-purple uppercase tracking-widest">PRIVATE</span>
                        </div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3 italic">Share this code</span>
                        <div className="flex items-center gap-4">
                            <span className="text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">QZ77</span>
                            <button className="bg-accent-purple/20 text-accent-purple w-12 h-12 rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-accent-purple/30 group">
                                <Copy size={20} className="group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Player Grid High-Fidelity */}
                <div className="grid grid-cols-3 gap-6 mb-12">
                    {players.map((player) => (
                        <div key={player.id} className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className={`w-20 h-20 rounded-[2rem] border-2 ${player.isHost ? 'border-primary shadow-[0_0_25px_rgba(13,242,89,0.3)]' : 'border-white/10'} p-1 bg-background-dark overflow-hidden transition-all hover:scale-105 active:scale-95`}>
                                    <img src={player.avatar} alt={player.name} className="w-full h-full rounded-[1.7rem] object-cover" />
                                </div>
                                {player.isHost && (
                                    <div className="absolute -top-1 -right-1 bg-primary text-background-dark w-6 h-6 rounded-lg flex items-center justify-center border-2 border-background-dark shadow-xl">
                                        <ShieldCheck size={14} />
                                    </div>
                                )}
                            </div>
                            <span className={`text-[10px] font-black uppercase italic tracking-tighter ${player.isHost ? 'text-primary' : 'text-white/60'}`}>
                                {player.name}
                            </span>
                        </div>
                    ))}

                    {emptySlots.map((_, i) => (
                        <button key={`empty-${i}`} className="flex flex-col items-center gap-3 group">
                            <div className="w-20 h-20 rounded-[2rem] border-2 border-dashed border-white/5 flex items-center justify-center bg-white/5 group-active:scale-95 transition-all text-white/10 group-hover:text-primary group-hover:border-primary/40 group-hover:bg-primary/5">
                                <Users size={32} />
                            </div>
                            <span className="text-[10px] font-black text-white/10 uppercase tracking-widest group-hover:text-primary transition-colors">invite</span>
                        </button>
                    ))}
                </div>

                {/* Immersive Footer */}
                <div className="fixed bottom-0 left-0 right-0 p-8 pb-10 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-50">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="flex gap-1.5 leading-none">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-100"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse delay-200"></div>
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Waiting for 3 more challengers...</p>
                    </div>

                    <div className="flex gap-6 items-center">
                        <button className="bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center text-white/40 border border-white/10 active:scale-90 transition-all hover:text-primary">
                            <MessageSquare size={24} />
                        </button>
                        <Button
                            disabled
                            fullWidth
                            className="py-5 text-xl gap-3 italic font-black bg-zinc-800 text-white/10 border-none group opacity-50"
                        >
                            <Sparkles size={24} className="group-hover:animate-spin-slow" />
                            START MATCH
                        </Button>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
