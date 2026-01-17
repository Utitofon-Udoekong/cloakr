'use client';

import { useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getChainById } from '@/lib/chains';

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

// Wrap in Suspense for useSearchParams
export default function ProofPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fafaf7] flex items-center justify-center"><p>Loading...</p></div>}>
            <ProofPageContent />
        </Suspense>
    );
}

function ProofPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();

    const proofId = params.id as string;
    const chainId = searchParams.get('chain');
    const amount = searchParams.get('amount');
    const sourceTxid = searchParams.get('txid');

    const [copied, setCopied] = useState(false);

    // Get chain config
    const chainConfig = chainId ? getChainById(chainId) : null;

    // Starknet explorer URL
    const starknetExplorerUrl = `https://sepolia.starkscan.co/tx/${proofId}`;

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
                            <h1 className="font-serif text-3xl">Payment Verified</h1>
                            <p className="text-[#6b6b6b] text-sm">This proof has been stored on Starknet</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {/* What was proved */}
                        {amount && (
                            <div className="p-4 bg-green-100 border-2 border-green-500">
                                <span className="text-xs font-semibold uppercase text-green-700">Amount Proved</span>
                                <p className="font-bold text-2xl mt-1 text-green-800">{decodeURIComponent(amount)}</p>
                            </div>
                        )}

                        {/* Source chain info */}
                        {chainConfig && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                    <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Source Chain</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div
                                            className="w-4 h-4 rounded-full border-2 border-[#0a0a0a]"
                                            style={{ backgroundColor: chainConfig.color }}
                                        />
                                        <p className="font-bold">{chainConfig.name}</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                    <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Status</span>
                                    <p className="font-bold text-lg mt-1 text-green-600">Verified ✓</p>
                                </div>
                            </div>
                        )}

                        {/* Source transaction */}
                        {sourceTxid && (
                            <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Source Transaction</span>
                                    {chainConfig?.explorerUrl && (
                                        <a
                                            href={`${chainConfig.explorerUrl}/tx/${decodeURIComponent(sourceTxid)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-[#f97316] hover:underline flex items-center gap-1"
                                        >
                                            View <ExternalLinkIcon />
                                        </a>
                                    )}
                                </div>
                                <p className="font-mono text-xs mt-1 break-all">{truncateHash(decodeURIComponent(sourceTxid))}</p>
                            </div>
                        )}

                        {/* Starknet proof transaction */}
                        <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Starknet Proof Transaction</span>
                                <a
                                    href={starknetExplorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#f97316] hover:underline flex items-center gap-1"
                                >
                                    View <ExternalLinkIcon />
                                </a>
                            </div>
                            <p className="font-mono text-xs mt-1 break-all">{truncateHash(proofId)}</p>
                        </div>

                        <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                            <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Proof Network</span>
                            <p className="font-bold mt-1">Starknet Sepolia</p>
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
                        href={starknetExplorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline flex items-center justify-center gap-2 px-6"
                    >
                        <ExternalLinkIcon />
                        View on Starkscan
                    </a>
                </div>

                {/* Info box */}
                <div className="p-6 border-2 border-dashed border-[#0a0a0a] bg-[#fef9c3]">
                    <h3 className="font-bold uppercase text-sm mb-2">What is this?</h3>
                    <p className="text-sm text-[#6b6b6b]">
                        This is a cryptographic proof of a blockchain payment. It verifies that a specific
                        payment was made without revealing the sender&apos;s wallet address. The proof is
                        permanently stored on Starknet.
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
