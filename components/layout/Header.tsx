'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStarknet, truncateStarknetAddress } from '@/lib/starknet';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { address, isConnected, isConnecting, connectWallet, disconnectWallet } = useStarknet();

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
                        <div className="w-9 h-9 border-3 border-[#0a0a0a] overflow-hidden flex items-center justify-center shadow-[2px_2px_0px_#0a0a0a]">
                            <img
                                src="/logo.png"
                                alt="Cloakr Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-lg font-extrabold uppercase tracking-tight">Cloakr</span>
                    </Link>

                    {/* Center Navigation */}
                    <div className="hidden md:flex items-center gap-1 text-sm font-semibold uppercase tracking-wide">
                        <Link href="#how-it-works" className="px-4 py-2 hover:bg-[#fde047] transition-all border-2 border-transparent hover:border-[#0a0a0a]">
                            How it Works
                        </Link>
                        <Link href="#about" className="px-4 py-2 hover:bg-[#fde047] transition-all border-2 border-transparent hover:border-[#0a0a0a]">
                            About
                        </Link>
                    </div>

                    {/* Right side - Single wallet button */}
                    <div className="flex items-center gap-3">
                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden w-10 h-10 border-3 border-[#0a0a0a] flex items-center justify-center shadow-[2px_2px_0px_#0a0a0a] bg-[#fafaf7]"
                            aria-label="Open menu"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Single CTA button */}
                        {isConnected ? (
                            <button
                                onClick={disconnectWallet}
                                className="hidden md:flex items-center gap-2 px-4 py-2 border-3 border-[#0a0a0a] bg-green-400 shadow-[2px_2px_0px_#0a0a0a] text-sm font-bold uppercase hover:bg-green-300 transition-colors"
                                title="Click to disconnect"
                            >
                                {truncateStarknetAddress(address!)}
                            </button>
                        ) : (
                            <button
                                onClick={connectWallet}
                                disabled={isConnecting}
                                className="hidden md:flex items-center gap-2 px-4 py-2 border-3 border-[#0a0a0a] bg-[#f97316] shadow-[2px_2px_0px_#0a0a0a] text-sm font-bold uppercase hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#0a0a0a] transition-all disabled:opacity-50"
                            >
                                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                            </button>
                        )}
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
                            className="px-4 py-3 border-3 border-[#0a0a0a] font-bold uppercase shadow-[3px_3px_0px_#0a0a0a] hover:bg-[#fde047] transition-colors"
                        >
                            How it Works
                        </Link>
                        <Link
                            href="#about"
                            onClick={closeMobileMenu}
                            className="px-4 py-3 border-3 border-[#0a0a0a] font-bold uppercase shadow-[3px_3px_0px_#0a0a0a] hover:bg-[#fde047] transition-colors"
                        >
                            About
                        </Link>
                    </nav>

                    {/* Mobile wallet button */}
                    {isConnected ? (
                        <button
                            onClick={() => { disconnectWallet(); closeMobileMenu(); }}
                            className="w-full py-3 border-3 border-[#0a0a0a] bg-green-400 font-bold uppercase shadow-[3px_3px_0px_#0a0a0a]"
                        >
                            {truncateStarknetAddress(address!)} (Disconnect)
                        </button>
                    ) : (
                        <button
                            onClick={() => { connectWallet(); closeMobileMenu(); }}
                            disabled={isConnecting}
                            className="btn-primary w-full py-3"
                        >
                            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}
