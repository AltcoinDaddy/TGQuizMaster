import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';

interface PlayerSlide {
    id: number;
    name: string;
    description: string;
    image: string;
    xp: string;
    icon: React.ReactNode;
}

const PLAYERS: PlayerSlide[] = [
    {
        id: 1,
        name: "ELITE BASKETBALL",
        description: "Tournament MVP of the Week",
        image: "/assets/players/basketball.png",
        xp: "Level 42 • 18k XP",
        icon: <Star size={16} fill="currentColor" />
    },
    {
        id: 2,
        name: "MASTER FOOTBALLER",
        description: "Global Leaderboard Rank #1",
        image: "/assets/players/football.png", // Will use gradient fallback if missing
        xp: "Level 50 • 25k XP",
        icon: <Trophy size={16} fill="currentColor" />
    },
    {
        id: 3,
        name: "POWER TENNIS",
        description: "New Grand Slam Challenge Live",
        image: "/assets/players/tennis.png",
        xp: "Level 45 • 21k XP",
        icon: <Zap size={16} fill="currentColor" />
    },
    {
        id: 4,
        name: "PRO ESPORTS",
        description: "Top Strategist in Combat Arena",
        image: "/assets/players/gamer.png", // Will use gradient fallback if missing
        xp: "Level 38 • 12k XP",
        icon: <Zap size={16} fill="currentColor" />
    }
];

export const PlayerSlider: React.FC = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % PLAYERS.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-64 rounded-[32px] overflow-hidden bg-[#102216] border border-white/10 group shadow-2xl shadow-black/40">
            <AnimatePresence mode="wait">
                <motion.div
                    key={PLAYERS[index].id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="absolute inset-0"
                    style={{ willChange: 'opacity' }}
                >
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 bg-cover bg-[center_top_15%]"
                        style={{ 
                            backgroundImage: `url(${PLAYERS[index].image})`,
                            backgroundColor: '#102216'
                        }}
                    >
                        {/* Overlay Gradient - Refined for clarity */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full p-6 flex flex-col justify-end">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-primary text-background-dark text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-lg shadow-primary/20">
                                    SPOTLIGHT
                                </span>
                                <div className="flex text-primary">
                                    {PLAYERS[index].icon}
                                </div>
                            </div>
                            <h3 className="font-black text-2xl uppercase italic tracking-tighter text-white drop-shadow-md">
                                {PLAYERS[index].name}
                            </h3>
                            <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mb-1">
                                {PLAYERS[index].description}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                                    {PLAYERS[index].xp}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-4 right-6 flex gap-1.5">
                {PLAYERS.map((_, i) => (
                    <div 
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === index ? 'w-4 bg-primary' : 'w-1 bg-white/20'}`}
                    />
                ))}
            </div>
        </div>
    );
};
