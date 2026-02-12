import React from 'react';
import { GlassCard } from './GlassCard';
import { Users, Heart, Watch } from 'lucide-react';

export type PowerUpType = '5050' | 'extraLife' | 'timeFreeze';

interface PowerUpProps {
    type: PowerUpType;
    count: number;
    disabled?: boolean;
    onUse: (type: PowerUpType) => void;
}

export const PowerUp: React.FC<PowerUpProps> = ({ type, count, disabled, onUse }) => {
    const configs = {
        '5050': {
            icon: <Users size={20} />,
            label: '50/50',
            color: 'text-orange-400',
            bgColor: 'bg-orange-400/10',
        },
        'extraLife': {
            icon: <Heart size={20} />,
            label: 'Life',
            color: 'text-red-400',
            bgColor: 'bg-red-400/10',
        },
        'timeFreeze': {
            icon: <Watch size={20} />,
            label: 'Freeze',
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
        }
    };

    const config = configs[type];

    return (
        <div className="flex flex-col items-center gap-2">
            <GlassCard
                onClick={() => !disabled && count > 0 && onUse(type)}
                className={`relative w-14 h-14 flex items-center justify-center p-0 rounded-xl border-dashed ${disabled || count === 0 ? 'opacity-40 grayscale pointer-events-none' : 'border-primary/30'}`}
            >
                <div className={`${config.color}`}>{config.icon}</div>
                <div className="absolute -top-1 -right-1 bg-background-dark text-primary text-[8px] font-black w-5 h-5 rounded-full border border-primary flex items-center justify-center">
                    {count}
                </div>
            </GlassCard>
            <span className="text-[10px] font-bold uppercase opacity-60">{config.label}</span>
        </div>
    );
};
