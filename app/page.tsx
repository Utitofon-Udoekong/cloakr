'use client';

import { useEffect, useState } from 'react';

// SVG Icons
const LockIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

export default function Home() {
  const [txInput, setTxInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleVerify = () => {
    if (txInput.trim()) {
      setIsValidating(true);
      setTimeout(() => {
        setIsValidating(false);
        alert(`Transaction verified: ${txInput}`);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="animate-on-scroll">
              <h1 className="font-serif text-5xl md:text-6xl leading-[1.1] tracking-tight mb-6">
                Prove payments.<br />
                Not your wallet.
              </h1>

              <p className="text-[#6b6b6b] text-lg mb-8 max-w-md">
                Generate zero-knowledge proofs for Bitcoin transactions. Verify payments without exposing your wallet address.
              </p>

              {/* Input Field */}
              <div className="neo-card p-5 max-w-lg">
                <label className="block text-sm font-bold uppercase mb-3 tracking-wide">
                  Enter Bitcoin Transaction ID
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={txInput}
                    onChange={(e) => setTxInput(e.target.value)}
                    placeholder="e.g., 3a1b2c3d4e5f..."
                    className="neo-input flex-1"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={isValidating}
                    className="btn-primary whitespace-nowrap disabled:opacity-50"
                  >
                    {isValidating ? '...' : 'Verify'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right side - Simple dot pattern */}
            <div className="hidden lg:block animate-on-scroll animate-delay-2">
              <div className="dot-pattern w-full h-72 border-3 border-[#0a0a0a]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 border-t-[3px] border-[#0a0a0a]" id="how-it-works">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-serif text-3xl md:text-4xl mb-4">
              How it works
            </h2>
            <p className="text-[#6b6b6b] max-w-lg mx-auto">
              Three simple steps to prove any Bitcoin payment privately
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center animate-on-scroll animate-delay-1">
              <div className="icon-box w-20 h-20 mx-auto flex items-center justify-center mb-6">
                <span className="text-2xl font-black">1</span>
              </div>
              <h3 className="font-bold uppercase mb-2">Enter Transaction</h3>
              <p className="text-sm text-[#6b6b6b]">Paste your Bitcoin transaction ID</p>
            </div>

            <div className="text-center animate-on-scroll animate-delay-2">
              <div className="icon-box-secondary w-20 h-20 mx-auto flex items-center justify-center mb-6">
                <span className="text-2xl font-black">2</span>
              </div>
              <h3 className="font-bold uppercase mb-2">Generate Proof</h3>
              <p className="text-sm text-[#6b6b6b]">We create a ZK proof on Starknet</p>
            </div>

            <div className="text-center animate-on-scroll animate-delay-3">
              <div className="icon-box w-20 h-20 mx-auto flex items-center justify-center mb-6">
                <span className="text-2xl font-black">3</span>
              </div>
              <h3 className="font-bold uppercase mb-2">Share Link</h3>
              <p className="text-sm text-[#6b6b6b]">Anyone can verify without seeing your wallet</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - No animation, always visible */}
      <section className="py-20 border-t-[3px] border-[#0a0a0a]" id="about">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - dot pattern */}
            <div className="dot-pattern h-64 border-3 border-[#0a0a0a] hidden lg:flex items-center justify-center">
              <div className="icon-box w-24 h-24 flex items-center justify-center">
                <LockIcon className="w-12 h-12" />
              </div>
            </div>

            {/* Right - content */}
            <div>
              <h2 className="font-serif text-3xl md:text-4xl mb-4">
                Start proving privately.
              </h2>
              <p className="text-[#6b6b6b] mb-8">
                Generate your first zero-knowledge payment proof today.
                Built for the Bitcoin x Privacy Hackathon on Starknet.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn-primary">
                  Get Started
                </button>
                <button className="btn-outline">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
