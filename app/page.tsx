export default function Home() {
  return (
    <div className="min-h-screen bg-[#fafaf7]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left side - Text content */}
            <div className="pt-8">
              <h1 className="font-serif text-5xl md:text-6xl leading-[1.1] tracking-tight mb-6">
                Prove payments.<br />
                Not your wallet.
              </h1>

              <p className="text-black/60 text-lg mb-8 max-w-md">
                Generate zero-knowledge proofs for Bitcoin transactions. Verify payments without exposing your wallet address.
              </p>

              {/* Input bar like reference */}
              <div className="bg-white rounded-xl border border-black/10 p-4 shadow-sm max-w-lg">
                <div className="flex items-center gap-2 text-sm text-black/40 mb-3">
                  <span>Try a Bitcoin transaction ID...</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-[#fafaf7] rounded-lg text-sm border border-black/5 flex items-center gap-2">
                    <span className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">₿</span>
                    Verify Payment
                  </span>
                  <span className="px-3 py-1.5 bg-[#fafaf7] rounded-lg text-sm border border-black/5 flex items-center gap-2">
                    <span className="w-4 h-4 bg-green-500 rounded-full"></span>
                    Generate Proof
                  </span>
                  <span className="px-3 py-1.5 bg-[#fafaf7] rounded-lg text-sm border border-black/5 flex items-center gap-2">
                    <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                    Share Link
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Dot pattern block */}
            <div className="relative hidden lg:block">
              <div className="dot-pattern w-full h-80 rounded-sm"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section - Like "What Siri + AI should be" */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <div>
              <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-6">
                Privacy-first<br />
                payment proofs.
              </h2>

              <p className="text-black/60 mb-8 max-w-md">
                Stop exposing your entire transaction history just to prove a single payment. Cloakr uses zero-knowledge proofs on Starknet.
              </p>

              <button className="btn-primary">
                See how it works
              </button>
            </div>

            {/* Right - Cascading cards */}
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                {/* Row 1 */}
                <div className="col-start-2 bg-white rounded-xl p-4 border border-black/10 shadow-sm">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-orange-600 text-sm">₿</span>
                  </div>
                  <span className="text-xs text-black/60">Bitcoin TX</span>
                </div>
                <div className="bg-white rounded-xl p-4 border border-black/10 shadow-sm">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-purple-600 text-sm">◇</span>
                  </div>
                  <span className="text-xs text-black/60">Starknet</span>
                </div>

                {/* Row 2 */}
                <div className="bg-white rounded-xl p-4 border border-black/10 shadow-sm">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-red-600 text-sm">🔒</span>
                  </div>
                  <span className="text-xs text-black/60">ZK Proof</span>
                </div>
                <div className="bg-white rounded-xl p-4 border border-black/10 shadow-sm">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-xs text-black/60">Verified</span>
                </div>
                <div className="bg-white rounded-xl p-4 border border-black/10 shadow-sm">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-blue-600 text-sm">🔗</span>
                  </div>
                  <span className="text-xs text-black/60">Shareable</span>
                </div>

                {/* Row 3 */}
                <div className="col-start-1 bg-white rounded-xl p-4 border border-black/10 shadow-sm">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-yellow-600 text-sm">👁</span>
                  </div>
                  <span className="text-xs text-black/60">Private</span>
                </div>
                <div className="bg-white rounded-xl p-4 border border-black/10 shadow-sm">
                  <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-pink-600 text-sm">📄</span>
                  </div>
                  <span className="text-xs text-black/60">Receipt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Icons Row - Like bottom of reference */}
      <section className="py-16 border-t border-black/5">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-4">
            The proof that protects.
          </h2>
          <p className="text-center text-black/50 mb-12">
            Zero-knowledge verification for Bitcoin payments on Starknet
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "🔐", label: "Zero-Knowledge" },
              { icon: "🔗", label: "On-Chain Verified" },
              { icon: "👁️", label: "Privacy First" },
              { icon: "⚡", label: "Instant Proofs" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-xl border border-black/10 flex items-center justify-center text-2xl mb-3 bg-white">
                  {item.icon}
                </div>
                <span className="text-sm text-black/70">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with dot pattern */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Left - dot pattern */}
              <div className="dot-pattern h-64 rounded-sm hidden lg:block"></div>

              {/* Right - CTA content */}
              <div className="text-center lg:text-left">
                <h2 className="font-serif text-3xl md:text-4xl mb-4">
                  Start proving privately.
                </h2>
                <p className="text-black/50 mb-8">
                  Generate your first zero-knowledge payment proof today.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
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
        </div>
      </section>
    </div>
  );
}
