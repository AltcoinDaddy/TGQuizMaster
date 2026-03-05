import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { authPost } from '../../utils/authFetch';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { ChevronLeft, Rocket, Shield, Info } from 'lucide-react';

export const SquadCreate = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [telegramLink, setTelegramLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        setError('');

        try {
            const resp = await authPost('/api/squad/create', {
                name: name.trim(),
                telegramLink: telegramLink.trim()
            });
            const data = await resp.json();

            if (data.success) {
                // Update local store
                useAppStore.getState().setUser({
                    squadId: data.squad.id,
                    squadName: data.squad.name
                });
                navigate(`/squad/${data.squad.id}`);
            } else {
                setError(data.error || 'Failed to create squad');
            }
        } catch (e) {
            console.error('Squad creation error:', e);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black/40 backdrop-blur-xl pb-24 animate-in slide-in-from-bottom duration-500">
            {/* Nav */}
            <div className="p-6">
                <button onClick={() => navigate('/squads')} className="p-2 bg-white/5 rounded-xl text-white/60">
                    <ChevronLeft size={20} />
                </button>
            </div>

            <div className="px-8 pt-4 pb-8">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 text-primary shadow-[0_0_40px_rgba(13,242,89,0.1)]">
                    <Rocket size={40} />
                </div>
                <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Create Your<br /><span className="text-primary italic">Squad</span></h1>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-4 leading-relaxed">
                    Unite your community and compete for the weekly **100 TON** prize pool!
                </p>
            </div>

            <form onSubmit={handleCreate} className="px-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic px-2">Squad Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ENTER SQUAD NAME..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold uppercase placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all"
                        maxLength={32}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic px-2">Telegram Group Link (Optional)</label>
                    <input
                        type="text"
                        value={telegramLink}
                        onChange={(e) => setTelegramLink(e.target.value)}
                        placeholder="T.ME/YOUR_GROUP..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold placeholder:text-white/10 focus:outline-none focus:border-primary/50 transition-all text-sm"
                    />
                    <div className="flex items-start gap-2 px-2 pt-1">
                        <Info size={12} className="text-white/20 mt-0.5 shrink-0" />
                        <p className="text-[9px] text-white/30 font-medium">Linking your Telegram group helps members join and promotes your squad.</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <div className="pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full py-5 text-sm"
                        disabled={loading || !name.trim()}
                    >
                        {loading ? 'CREATING SQUAD...' : 'INITIALIZE SQUAD'}
                    </Button>
                </div>
            </form>

            <div className="px-8 mt-12">
                <GlassCard className="bg-white/[0.02] border-white/10 py-5 flex gap-4 items-center">
                    <div className="p-2 bg-white/5 rounded-xl text-white/40">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-white/50 uppercase italic tracking-widest">Squad Leader Tip</h4>
                        <p className="text-[9px] text-white/30 font-medium mt-1">As a founder, you'll earn a **bonus 5% XP** from all your squad member's game contributions.</p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
