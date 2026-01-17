import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-sm font-medium text-zinc-400">{label}</label>
            )}
            <input
                className={`
          w-full px-4 py-3 rounded-xl
          bg-zinc-900 border border-zinc-700
          text-white placeholder:text-zinc-500
          focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500
          transition-all duration-200
          ${error ? 'border-red-500' : ''}
          ${className}
        `}
                {...props}
            />
            {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
    );
}
