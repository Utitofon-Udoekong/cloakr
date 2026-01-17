import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass';
}

export function Card({ children, className = '', variant = 'default' }: CardProps) {
    const variants = {
        default: 'bg-zinc-900 border border-zinc-800',
        glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
    };

    return (
        <div className={`rounded-2xl p-6 ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}
