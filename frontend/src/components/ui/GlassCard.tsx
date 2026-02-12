import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`glass-card rounded-2xl p-4 transition-all duration-200 ${onClick ? 'active:scale-[0.98] cursor-pointer' : ''} ${className}`}
        >
            {children}
        </div>
    );
};
