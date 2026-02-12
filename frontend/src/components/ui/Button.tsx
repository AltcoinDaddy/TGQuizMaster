import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = "",
    ...props
}) => {
    const baseStyles = "font-bold rounded-full transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100";

    const variants = {
        primary: "bg-primary text-background-dark shadow-[0_0_15px_rgba(13,242,89,0.3)]",
        secondary: "bg-white/10 text-white backdrop-blur-md border border-white/10 hover:bg-white/20",
        outline: "border-2 border-primary text-primary hover:bg-primary/10",
        ghost: "text-white/60 hover:text-white hover:bg-white/5"
    };

    const sizes = {
        sm: "px-4 py-1.5 text-xs",
        md: "px-6 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-lg"
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
