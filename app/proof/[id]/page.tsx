'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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

const CopyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
);

// Truncate hash for display
const truncateHash = (hash: string): string => {
    if (!hash || hash.length <= 20) return hash || '';
    return `${hash.slice(0, 12)}...${hash.slice(-10)}`;
};

export default function ProofPage() {
    const params = useParams();
    const proofId = params.id as string;
    const [copied, setCopied] = useState(false);

    // Determine if this is a Starknet transaction hash (starts with 0x)
    const isStarknetTx = proofId?.startsWith('0x');
    const explorerUrl = isStarknetTx
        ? `https://sepolia.starkscan.co/tx/${proofId}`
        : `https://etherscan.io/tx/${proofId}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                            <h1 className="font-serif text-3xl">Proof Submitted</h1>
                            <p className="text-[#6b6b6b] text-sm">Your proof has been submitted to Starknet Sepolia</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                            <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Transaction Hash</span>
                            <p className="font-mono text-sm mt-1 break-all">{proofId}</p>
                        </div>

                        <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                            <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Status</span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <p className="font-bold text-green-600">Submitted - Pending Confirmation</p>
                            </div>
                        </div>

                        <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                            <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Network</span>
                            <p className="font-bold mt-1">Starknet Sepolia</p>
                        </div>

                        <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                            <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Created</span>
                            <p className="text-sm mt-1">{new Date().toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 mb-8">
                    <button
                        onClick={handleCopyLink}
                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                        <CopyIcon />
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline flex items-center justify-center gap-2 px-6"
                    >
                        <ExternalLinkIcon />
                        View on Explorer
                    </a>
                </div>

                {/* Info box */}
                <div className="p-6 border-2 border-dashed border-[#0a0a0a] bg-[#fef9c3]">
                    <h3 className="font-bold uppercase text-sm mb-2">What&apos;s Next?</h3>
                    <p className="text-sm text-[#6b6b6b]">
                        Your payment proof has been submitted to the Starknet network. Once confirmed,
                        you can share this link with anyone to prove your payment was made without
                        revealing your wallet address.
                    </p>
                </div>

                {/* Generate another */}
                <div className="mt-8 text-center">
                    <Link
                        href="/generate"
                        className="text-sm font-semibold uppercase text-[#6b6b6b] hover:text-[#f97316] transition-colors"
                    >
                        Generate Another Proof →
                    </Link>
                </div>
            </div>
        </div>
    );
}
