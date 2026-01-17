'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    return (
        <>
            <header className="sticky top-0 z-50 bg-[#fafaf7]">
                <div className="rainbow-bar" />

                <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between border-b-[3px] border-[#0a0a0a]">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 border-3 border-[#0a0a0a] bg-[#f97316] flex items-center justify-center shadow-[2px_2px_0px_#0a0a0a]">
                            <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span className="text-lg font-extrabold uppercase tracking-tight">Cloakr</span>
                    </Link>

                    {/* Center Navigation - Updated links */}
                    <div className="hidden md:flex items-center gap-1 text-sm font-semibold uppercase tracking-wide">
                        <Link href="#how-it-works" className="px-4 py-2 hover:bg-[#fde047] transition-all border-2 border-transparent hover:border-[#0a0a0a]">
                            How it Works
                        </Link>
                        <Link href="#about" className="px-4 py-2 hover:bg-[#fde047] transition-all border-2 border-transparent hover:border-[#0a0a0a]">
                            About
                        </Link>
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden w-10 h-10 border-3 border-[#0a0a0a] flex items-center justify-center shadow-[2px_2px_0px_#0a0a0a] bg-[#fafaf7]"
                            aria-label="Open menu"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <button className="btn-primary text-sm py-2.5 px-5 hidden md:block">
                            Get Started
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile menu overlay */}
            <div
                className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`}
                onClick={closeMobileMenu}
            />

            {/* Mobile menu panel */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b-3 border-[#0a0a0a]">
                        <span className="text-xl font-extrabold uppercase">Menu</span>
                        <button
                            onClick={closeMobileMenu}
                            className="w-10 h-10 border-3 border-[#0a0a0a] flex items-center justify-center bg-[#fafaf7]"
                            aria-label="Close menu"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex flex-col gap-3 flex-1">
                        <Link
                            href="#how-it-works"
                            onClick={closeMobileMenu}
                            className="px-4 py-4 border-3 border-[#0a0a0a] font-bold uppercase shadow-[3px_3px_0px_#0a0a0a] hover:bg-[#fde047] transition-colors"
                        >
                            How it Works
                        </Link>
                        <Link
                            href="#about"
                            onClick={closeMobileMenu}
                            className="px-4 py-4 border-3 border-[#0a0a0a] font-bold uppercase shadow-[3px_3px_0px_#0a0a0a] hover:bg-[#fde047] transition-colors"
                        >
                            About
                        </Link>
                    </nav>

                    <button className="btn-primary w-full mt-6">
                        Get Started
                    </button>
                </div>
            </div>
        </>
    );
}
