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
                        © 2026 Cloakr — Private Proof of Payment on Starknet
                    </p>

                </div>
            </div>
        </footer>
    );
}
