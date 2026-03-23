import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Gem, Zap } from 'lucide-react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useAppStore } from '../../store/useAppStore';
import { socket } from '../../utils/socket';

export const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { open } = useAppKit();
    const { address, isConnected } = useAppKitAccount();
    const { user } = useAppStore();

    const shortAddress = address
        ? `${address.slice(0, 4)}...${address.slice(-4)}`
        : '';

    // Calculate level based on XP (every 1000 XP is 1 level)
    const currentLevel = Math.floor((user.xp || 0) / 1000) + 1;

    const handleWalletClick = () => {
        open();
    };

    return (
        <header className="safe-top sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-5 pt-4 pb-2">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {location.pathname !== '/' && (
                        <button
                            onClick={() => {
                                socket.emit('leave_room');
                                navigate('/');
                            }}
                            className="mr-1 p-1.5 bg-white/10 rounded-full active:scale-95 transition-all hover:bg-white/20"
                        >
                            <ArrowLeft size={20} className="text-white" />
                        </button>
                    )}
                    <div className="relative">
                        <img
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full border-2 border-primary"
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-primary w-4 h-4 rounded-full border-2 border-background-dark flex items-center justify-center">
                            <span className="text-[8px] text-background-dark font-bold">LV{currentLevel}</span>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-sm font-bold opacity-70 italic text-white/90">Hello, {user.username}</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black bg-primary/20 text-primary px-3 py-1 rounded-full border border-primary/20 uppercase italic tracking-tighter">{user.isPro ? 'Pro Player' : 'Player'}</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleWalletClick}
                    className={`font-black text-[10px] px-5 py-2.5 rounded-full shadow-[0_5px_15px_rgba(13,242,89,0.3)] active:scale-95 transition-all uppercase tracking-tighter italic ${isConnected
                        ? 'bg-white/10 text-primary border border-primary/30'
                        : 'bg-primary text-background-dark'
                        }`}
                >
                    {isConnected ? shortAddress : 'Connect Wallet'}
                </button>
            </div>

            {/* Balances Grid */}
            <div className="grid grid-cols-3 gap-2 pb-2">
                <button
                    onClick={() => navigate('/shop')}
                    className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col items-center active:scale-95 transition-all hover:bg-white/10 group"
                >
                    <Star size={14} fill="currentColor" className="text-yellow-400 mb-1" />
                    <span className="text-[10px] font-black italic tracking-tighter">{(user.stars || 0).toLocaleString()}</span>
                </button>
                <button
                    onClick={() => navigate('/quests')}
                    className="bg-white/5 border border-primary/20 p-3 rounded-2xl flex flex-col items-center active:scale-95 transition-all hover:bg-primary/10 group"
                >
                    <Zap size={14} fill="currentColor" className="text-primary mb-1" />
                    <span className="text-[10px] font-black italic tracking-tighter text-primary">{(user.balanceQP || 0).toLocaleString()}</span>
                </button>
                <button
                    onClick={() => navigate('/onboarding')}
                    className="bg-white/5 border border-white/10 p-3 rounded-2xl flex flex-col items-center active:scale-95 transition-all hover:bg-white/10 group"
                >
                    <Gem size={14} fill="currentColor" className="text-primary mb-1" />
                    <span className="text-[10px] font-black italic tracking-tighter">{(user.chilizBalance ?? 0).toFixed(1)}</span>
                </button>
            </div>
        </header>
    );
};

