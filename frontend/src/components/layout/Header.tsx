import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Gem } from 'lucide-react';
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useAppStore } from '../../store/useAppStore';
import { socket } from '../../utils/socket';

export const Header: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [tonConnectUI] = useTonConnectUI();
    const userFriendlyAddress = useTonAddress();
    const { user } = useAppStore();

    const isConnected = !!userFriendlyAddress;
    const shortAddress = userFriendlyAddress
        ? `${userFriendlyAddress.slice(0, 4)}...${userFriendlyAddress.slice(-4)}`
        : '';

    // Calculate level based on XP (every 1000 XP is 1 level)
    const currentLevel = Math.floor((user.xp || 0) / 1000) + 1;

    const handleWalletClick = () => {
        if (isConnected) {
            tonConnectUI.disconnect();
        } else {
            tonConnectUI.openModal();
        }
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
            <div className="grid grid-cols-2 gap-3 pb-2">
                <button
                    onClick={() => navigate('/shop')}
                    className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between active:scale-95 transition-all hover:bg-white/10 group"
                >
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-black italic">Stars</span>
                        <span className="text-xl font-black italic tracking-tighter">{(user.stars || 0).toLocaleString()}</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-yellow-400/10 flex items-center justify-center text-yellow-400 border border-yellow-400/20 group-hover:scale-110 transition-transform">
                        <Star size={20} fill="currentColor" className="drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" />
                    </div>
                </button>
                <button
                    onClick={() => navigate('/shop')}
                    className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between active:scale-95 transition-all hover:bg-white/10 group"
                >
                    <div className="flex flex-col items-start">
                        <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-black italic">TON Balance</span>
                        <span className="text-xl font-black italic tracking-tighter">{(user.tonBalance ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400 border border-blue-400/20 group-hover:scale-110 transition-transform">
                        <Gem size={20} fill="currentColor" className="drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]" />
                    </div>
                </button>
            </div>
        </header>
    );
};

