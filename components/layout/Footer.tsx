import Link from 'next/link';

export function Footer() {
    return (
        <footer className="py-16 bg-[#fafaf7]">
            <div className="max-w-6xl mx-auto px-6">
                {/* Large Logo */}
                <div className="flex flex-col items-center text-center">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-semibold tracking-tight">Cloakr</span>
                    </div>

                    <p className="text-sm text-black/50 mb-8">
                        © 2025 Cloakr — Built for the Bitcoin x Privacy Hackathon on Starknet
                    </p>

                    {/* Links */}
                    <div className="flex gap-8 text-sm">
                        <Link href="#" className="text-black/60 hover:text-black transition-colors">
                            Documentation
                        </Link>
                        <Link href="https://github.com" target="_blank" className="text-black/60 hover:text-black transition-colors">
                            GitHub
                        </Link>
                        <Link href="https://t.me/+-5zNW47GSdQ1ZDkx" target="_blank" className="text-black/60 hover:text-black transition-colors">
                            Telegram
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
