import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { socket } from '../../utils/socket';
import { 
    Zap, 
    Star, 
    Trophy, 
    User, 
    Loader2, 
    ArrowLeft,
    Sparkles,
    Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const REWARDS = [
    { type: 'STARS', label: '50 Stars', color: '#ffcc00', icon: Star },
    { type: 'QP', label: '10 QP', color: '#00ffcc', icon: Trophy },
    { type: 'SHARD', label: 'Avatar Shard', color: '#cc33ff', icon: User },
    { type: 'STARS', label: '500 Stars', color: '#ffcc00', icon: Star },
    { type: 'QP', label: '100 QP', color: '#00ffcc', icon: Trophy },
    { type: 'SHARD', label: 'Avatar Shard', color: '#cc33ff', icon: User },
    { type: 'STARS', label: '200 Stars', color: '#ffcc00', icon: Star },
    { type: 'STARS', label: '100 Stars', color: '#ffcc00', icon: Star },
];

export const LuckySpin: React.FC = () => {
    const navigate = useNavigate();
    const { user, syncFromBackend } = useAppStore();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<any>(null);
    const [cooldown, setCooldown] = useState<string | null>(null);

    useEffect(() => {
        // Enforce cooldown check locally
        if (user.lastLuckySpin) {
            const lastSpin = new Date(user.lastLuckySpin).getTime();
            const now = Date.now();
            const hoursSince = (now - lastSpin) / (1000 * 60 * 60);
            
            if (hoursSince < 24) {
                const remaining = 24 - hoursSince;
                setCooldown(`${Math.ceil(remaining)}h`);
            } else {
                setCooldown(null);
            }
        }

        const handleResult = (data: any) => {
            console.log('[LUCKY-SPIN] Result matched:', data);
            
            // Calculate final rotation to land on the correct segment
            // 360 / 8 segments = 45 degrees per segment
            const rewardIndex = REWARDS.findIndex(r => r.type === data.type);
            const extraSpins = 5; // Spin 5 times before landing
            const finalAngle = (extraSpins * 360) + (rewardIndex * 45);
            
            setRotation(finalAngle);
            
            setTimeout(() => {
                setIsSpinning(false);
                setResult(data);
                syncFromBackend(data.newBalances);
            }, 5000); // Animation duration
        };

        const handleError = (err: any) => {
            alert(err.message || 'Spin failed');
            setIsSpinning(false);
        };

        socket.on('lucky_spin_result', handleResult);
        socket.on('error', handleError);

        return () => {
            socket.off('lucky_spin_result', handleResult);
            socket.off('error', handleError);
        };
    }, [user.lastLuckySpin, syncFromBackend]);

    const handleSpin = () => {
        if (isSpinning || cooldown) return;
        
        setIsSpinning(true);
        setResult(null);
        socket.emit('lucky_spin', { 
            telegramId: user.telegramId,
            username: user.username 
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#102216] text-white p-6 pb-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 z-10">
                <button 
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white/5 rounded-xl border border-white/10"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <Sparkles className="text-primary" size={20} />
                    <h1 className="text-xl font-black italic tracking-tighter">LUCKY SPIN</h1>
                </div>
                <div className="w-10" /> {/* Spacer */}
            </div>

            {/* The Wheel Container */}
            <div className="flex-1 flex flex-col items-center justify-center relative py-12">
                {/* Pointer */}
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 z-20">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,255,136,0.5)]">
                        <Zap size={16} className="text-[#102216] fill-current" />
                    </div>
                    <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-primary mx-auto" />
                </div>

                {/* Spinning Wheel */}
                <motion.div 
                    className="w-72 h-72 rounded-full border-[8px] border-white/10 bg-[#0a160e] relative shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 5, ease: "circOut" }}
                >
                    {/* Segments */}
                    {REWARDS.map((reward, i) => (
                        <div 
                            key={i}
                            className="absolute top-0 left-0 w-full h-full"
                            style={{ 
                                transform: `rotate(${i * 45}deg)`,
                                transformOrigin: 'center center'
                            }}
                        >
                            <div 
                                className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-[50%] flex flex-col items-center pt-4"
                                style={{ transformOrigin: 'center bottom' }}
                            >
                                <reward.icon size={24} style={{ color: reward.color }} />
                                <span className="text-[10px] font-bold mt-1 text-center opacity-70">{reward.label}</span>
                            </div>
                            {/* Segment divider line */}
                            <div className="absolute top-0 left-1/2 w-[1px] h-[50%] bg-white/10 origin-bottom" style={{ transform: 'translateX(-50%)' }} />
                        </div>
                    ))}
                    
                    {/* Inner Center Circle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#102216] rounded-full border-4 border-white/10 z-10 flex items-center justify-center">
                        <Star size={16} className="text-primary fill-current" />
                    </div>
                </motion.div>

                {/* Spin Button */}
                <div className="mt-12 w-full max-w-[280px]">
                    <button
                        onClick={handleSpin}
                        disabled={isSpinning || !!cooldown}
                        className={`w-full py-5 rounded-2xl font-black italic text-lg tracking-tight shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${
                            cooldown 
                            ? 'bg-white/10 text-white/30 border border-white/5 cursor-not-allowed'
                            : 'bg-primary text-[#102216] shadow-primary/20 animate-pulse'
                        }`}
                    >
                        {isSpinning ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : cooldown ? (
                            <>
                                <Loader2 size={24} className="opacity-50" />
                                NEXT SPIN IN {cooldown}
                            </>
                        ) : (
                            <>
                                <Sparkles size={24} />
                                SPIN NOW (FREE)
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-white/40 mt-4 leading-relaxed tracking-wider italic font-bold">
                        DAILY FREE LUCK • WIN STARS, QP, OR SHARDS
                    </p>
                </div>
            </div>

            {/* Result Modal */}
            <AnimatePresence>
                {result && !isSpinning && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
                    >
                        <div className="w-full max-w-xs bg-[#1a3322] border-2 border-primary/30 rounded-3xl p-8 text-center shadow-[0_0_50px_rgba(0,255,136,0.2)]">
                            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Gift className="text-primary" size={40} />
                            </div>
                            <h2 className="text-2xl font-black italic tracking-tighter mb-2">CONGRATS!</h2>
                            <p className="text-white/60 text-sm mb-6 font-bold uppercase tracking-widest">You won from Lucky Spin</p>
                            
                            <div className="bg-black/20 rounded-2xl p-4 mb-8 border border-white/5">
                                <div className="text-3xl font-black italic text-primary">{result.label}</div>
                            </div>

                            <button
                                onClick={() => setResult(null)}
                                className="w-full py-4 bg-primary text-[#102216] rounded-2xl font-bold uppercase tracking-widest shadow-lg active:scale-95"
                            >
                                SWEET!
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
