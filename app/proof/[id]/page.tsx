'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Icons
const ArrowLeftIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const ShareIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
);

const CopyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

interface MockProof {
    id: string;
    btcTxid: string;
    amount: string;
    recipient: string;
    createdAt: string;
    isVerified: boolean;
}

export default function ProofPage() {
    const params = useParams();
    const proofId = params.id as string;
    const [proof, setProof] = useState<MockProof | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Mock proof data - in real app, fetch from Starknet
        setProof({
            id: proofId,
            btcTxid: '3a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef',
            amount: '0.01500000',
            recipient: 'bc1q...xyz789',
            createdAt: new Date().toISOString(),
            isVerified: true,
        });
    }, [proofId]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!proof) {
        return (
            <div className="min-h-screen bg-[#fafaf7] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[#6b6b6b]">Loading proof...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafaf7] py-12">
            <div className="max-w-2xl mx-auto px-6">
                {/* Back link */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase mb-8 hover:text-[#f97316] transition-colors">
                    <ArrowLeftIcon />
                    Back to Home
                </Link>

                {/* Verification Badge */}
                <div className="neo-card p-8 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="icon-box w-16 h-16 flex items-center justify-center bg-green-400">
                            <CheckIcon />
                        </div>
                        <div>
                            <h1 className="font-serif text-3xl">Payment Verified</h1>
                            <p className="text-[#6b6b6b] text-sm">This proof has been verified on Starknet</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                            <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Proof ID</span>
                            <p className="font-mono text-sm mt-1">{proof.id}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Amount</span>
                                <p className="font-bold text-lg mt-1">{proof.amount} BTC</p>
                            </div>
                            <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Status</span>
                                <p className="font-bold text-lg mt-1 text-green-600">Verified ✓</p>
                            </div>
                        </div>

                        <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                            <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Bitcoin Transaction</span>
                            <p className="font-mono text-xs mt-1 break-all">{proof.btcTxid}</p>
                        </div>

                        <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                            <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Created</span>
                            <p className="text-sm mt-1">{new Date(proof.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Share buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={handleCopyLink}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        <CopyIcon />
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button className="btn-outline flex items-center justify-center gap-2 px-6">
                        <ShareIcon />
                        Share
                    </button>
                </div>

                {/* Info box */}
                <div className="mt-8 p-6 border-2 border-dashed border-[#0a0a0a] bg-[#fef9c3]">
                    <h3 className="font-bold uppercase text-sm mb-2">What is this?</h3>
                    <p className="text-sm text-[#6b6b6b]">
                        This is a zero-knowledge proof of a Bitcoin payment. It proves that a specific payment
                        was made without revealing the sender&apos;s wallet address. The proof is verified on Starknet.
                    </p>
                </div>
            </div>
        </div>
    );
}
