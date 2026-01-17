import Link from 'next/link';

export function Footer() {
    return (
        <footer className="py-16 bg-[var(--background)] border-t-[3px] border-[var(--foreground)]">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col items-center text-center">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 mb-6 group">
                        <div className="w-14 h-14 border-3 border-[var(--foreground)] overflow-hidden flex items-center justify-center shadow-[var(--shadow)] transition-transform group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">
                            <img
                                src="/logo.png"
                                alt="Cloakr Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-3xl font-extrabold uppercase tracking-tight">Cloakr</span>
                    </Link>

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
