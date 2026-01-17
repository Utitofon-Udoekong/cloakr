'use client';

import Link from 'next/link';

export function Header() {
    return (
        <header className="sticky top-0 z-50 bg-[#fafaf7]">
            {/* Rainbow gradient bar */}
            <div className="rainbow-bar" />

            {/* Main header */}
            <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full border border-black/20 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </Link>

                {/* Center Navigation */}
                <div className="hidden md:flex items-center gap-1 text-sm">
                    <Link href="#features" className="px-4 py-2 text-black/70 hover:text-black transition-colors">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="px-4 py-2 text-black/70 hover:text-black transition-colors">
                        How it Works
                    </Link>
                    <Link href="#pricing" className="px-4 py-2 text-black/70 hover:text-black transition-colors">
                        Pricing
                    </Link>
                </div>

                {/* CTA Button */}
                <button className="btn-primary">
                    Get Started
                </button>
            </nav>
        </header>
    );
}
