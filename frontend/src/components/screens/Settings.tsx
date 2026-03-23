import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MainLayout } from '../layout/MainLayout';
import { ChevronLeft, Volume2, VolumeX, Smartphone, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateSettings } = useAppStore();


    const { soundEnabled, hapticsEnabled } = user.settings || { soundEnabled: true, hapticsEnabled: true };

    const toggleSound = () => {
        updateSettings({ soundEnabled: !soundEnabled, hapticsEnabled });
    };

    const toggleHaptics = () => {
        const newState = !hapticsEnabled;
        updateSettings({ soundEnabled, hapticsEnabled: newState });
        if (newState && (window as any).Telegram?.WebApp?.HapticFeedback) {
            (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
    };

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <MainLayout>
            <div className="p-6 pt-4 pb-32">
                <header className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="bg-white/5 p-2 rounded-xl border border-white/10 active:scale-95 transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black italic tracking-tighter uppercase">Settings</h1>
                </header>

                <div className="space-y-6">
                    {/* Preferences Section */}
                    <div>
                        <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] italic mb-4 pl-2">Preferences</h2>
                        <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                            <div className="p-5 flex items-center justify-between border-b border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${soundEnabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'}`}>
                                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm uppercase italic tracking-tighter">Sound Effects</p>
                                        <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">In-Game Audio</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleSound}
                                    className={`w-12 h-7 rounded-full transition-all relative ${soundEnabled ? 'bg-primary' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${soundEnabled ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>

                            <div className="p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hapticsEnabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/20'}`}>
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-sm uppercase italic tracking-tighter">Haptic Feedback</p>
                                        <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">Vibrations</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleHaptics}
                                    className={`w-12 h-7 rounded-full transition-all relative ${hapticsEnabled ? 'bg-primary' : 'bg-white/10'}`}
                                >
                                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${hapticsEnabled ? 'left-6' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div>
                        <h2 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] italic mb-4 pl-2">Account</h2>
                        <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
                            <button className="w-full p-5 flex items-center justify-between border-b border-white/5 active:bg-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                                        <Shield size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-sm uppercase italic tracking-tighter">Privacy Policy</p>
                                        <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">Read Terms</p>
                                    </div>
                                </div>
                                <ChevronLeft size={16} className="rotate-180 opacity-20" />
                            </button>

                            <button onClick={handleLogout} className="w-full p-5 flex items-center justify-between active:bg-white/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 text-white/20 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-all">
                                        <LogOut size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-sm uppercase italic tracking-tighter text-white/40 group-hover:text-white/60">Sign Out</p>
                                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest">Logout</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>



                <div className="mt-12 text-center opacity-20">
                    <p className="text-[8px] font-black uppercase tracking-[0.4em]">TGQuizMaster Settings</p>
                </div>
            </div>
        </MainLayout>
    );
};
