import { useEffect, useState } from 'react';

interface SnackbarProps {
    message: string | null;
    onClose: () => void;
    duration?: number;
    type?: 'success' | 'error' | 'info';
}

export function Snackbar({ message, onClose, duration = 4000, type = 'info' }: SnackbarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for fade out animation
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, duration, onClose]);

    if (!message && !isVisible) return null;

    const bgColor = type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-[#0a0a0a]';

    return (
        <div
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out px-6 py-3 rounded-none shadow-[2px_2px_0px_white] border-2 border-white text-white font-bold uppercase text-sm flex items-center gap-3 ${bgColor} ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
            <span>{message}</span>
            <button onClick={() => setIsVisible(false)} className="ml-2 hover:opacity-70 font-mono text-lg">×</button>
        </div>
    );
}
