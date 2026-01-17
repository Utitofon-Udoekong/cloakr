import Link from 'next/link';

// SVG Icons
const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8 text-black">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export function Footer() {
    return (
        <footer className="py-16 bg-[var(--background)] border-t-[3px] border-[var(--foreground)]">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col items-center text-center">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 border-3 border-[var(--foreground)] bg-[var(--accent)] flex items-center justify-center shadow-[var(--shadow)]">
                            <LockIcon />
                        </div>
                        <span className="text-3xl font-extrabold uppercase tracking-tight">Cloakr</span>
                    </div>

                    <p className="text-sm text-[var(--muted)] mb-8 font-medium">
                        © 2025 Cloakr — Built for the Bitcoin x Privacy Hackathon
                    </p>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-bold uppercase">
                        <Link href="#" className="px-5 py-3 border-3 border-[var(--foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--accent)] transition-colors">
                            Docs
                        </Link>
                        <Link href="https://github.com" target="_blank" className="px-5 py-3 border-3 border-[var(--foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--highlight)] transition-colors">
                            GitHub
                        </Link>
                        <Link href="https://t.me/+-5zNW47GSdQ1ZDkx" target="_blank" className="px-5 py-3 border-3 border-[var(--foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--accent)] transition-colors">
                            Telegram
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
