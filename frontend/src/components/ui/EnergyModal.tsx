import React from 'react';
import { Play, X, BatteryLow } from 'lucide-react';

interface EnergyModalProps {
    isOpen: boolean;
    onWatchAd: () => void;
    onClose: () => void;
}

export const EnergyModal: React.FC<EnergyModalProps> = ({ isOpen, onWatchAd, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background-dark/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="glass-card-primary p-8 w-full max-w-sm flex flex-col items-center text-center bonus-glow relative border-2 border-primary/30">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 day-active-glow">
                    <BatteryLow size={40} className="text-primary fill-primary" />
                </div>

                <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2 text-primary leading-none">Energy Depleted!</h2>
                <p className="text-sm opacity-70 font-bold uppercase tracking-tight leading-relaxed mb-8">
                    You've used all your free trials for today. Watch a short video to refill and get <span className="text-primary">+2 bonus games</span>!
                </p>

                <div className="w-full space-y-3">
                    <button
                        onClick={onWatchAd}
                        className="primary-button w-full flex items-center justify-center gap-3 py-4 text-lg"
                    >
                        <Play size={20} fill="currentColor" /> GET 2 FREE GAMES
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity"
                    >
                        No Thanks, Maybe Later <X size={12} className="inline ml-1" />
                    </button>
                </div>

                {/* Decorative elements */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-primary/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary/20 rounded-full blur-2xl"></div>
            </div>
        </div>
    );
};
