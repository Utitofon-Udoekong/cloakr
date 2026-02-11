'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getChainById } from '@/lib/chains';
import { useStarknet } from '@/lib/starknet';

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

// Import crypto utils
import { generateCommitment } from '@/lib/crypto';
import { useVerifierContract } from '@/lib/contract';

function ProofPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { getPrivateProof, contractAddress } = useVerifierContract();

    const proofId = params.id as string;
    const chainId = searchParams.get('chain');
    const amountParam = searchParams.get('amount');
    const sourceTxid = searchParams.get('txid');
    const starknetTx = searchParams.get('starknetTx');

    // Secrets for verification
    const secret = searchParams.get('secret');
    const nonce = searchParams.get('nonce');
    const recipientHash = searchParams.get('recipient');

    const [copied, setCopied] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'loading' | 'verified' | 'failed' | 'stored' | 'not_found' | 'indexing'>('loading');
    const [onChainProof, setOnChainProof] = useState<any>(null);
    const [retryCount, setRetryCount] = useState(0);
    const { provider } = useStarknet();

    // Get chain config
    const chainConfig = chainId ? getChainById(chainId) : null;

    // Starknet explorer URL (Voyager)
    const starknetExplorerUrl = starknetTx
        ? `https://sepolia.voyager.online/tx/${starknetTx}`
        : contractAddress
            ? `https://sepolia.voyager.online/contract/${contractAddress}`
            : '#';

    // Perform verification
    useEffect(() => {
        const verify = async () => {
            try {
                // 1. Fetch proof from chain
                setVerificationStatus('loading');
                const proof = await getPrivateProof(proofId);

                if (!proof) {
                    // Check if transaction exists but proof not indexed yet
                    if (provider) {
                        try {
                            const receipt = await provider.getTransactionReceipt(proofId);
                            // Cast to any to handle union type properties safely
                            const r = receipt as any;
                            if (r && (r.execution_status === 'SUCCEEDED' || r.finality_status === 'ACCEPTED_ON_L2')) {
                                setVerificationStatus('indexing');
                                return;
                            }
                        } catch (e) {
                            // Receipt not found
                        }
                    }

                    setVerificationStatus('not_found'); // Proof not found on chain yet
                    return;
                }
                setOnChainProof(proof);

                // 2. If secrets are provided, verify cryptography
                if (secret && nonce && recipientHash && amountParam) {
                    // Re-calculate commitment
                    // Parse amount: remove currency " ETH" or similar if present
                    const amountVal = amountParam.split(' ')[0];
                    const amountBigInt = BigInt(Math.floor(parseFloat(amountVal) * 1e8));

                    const computedCommitment = generateCommitment({
                        secret: secret,
                        amount: amountBigInt,
                        recipientHash: recipientHash,
                        nonce: nonce
                    });

                    // Compare with on-chain commitment
                    // Handle potential decimal vs hex format from Starknet.js
                    let onChainHex = proof.commitment;
                    if (!onChainHex.startsWith('0x')) {
                        try {
                            // Assume decimal string, convert to hex
                            onChainHex = '0x' + BigInt(onChainHex).toString(16);
                        } catch (e) {
                            console.error('Failed to parse on-chain commitment:', e);
                        }
                    }

                    // Normalize to lowercase 0x-prefixed hex
                    const onChainNorm = onChainHex.toLowerCase();
                    const computedNorm = computedCommitment.toLowerCase();

                    if (onChainNorm === computedNorm) {
                        setVerificationStatus('verified');
                    } else {
                        console.error('Commitment mismatch:', { onChain: onChainNorm, computed: computedNorm });
                        setVerificationStatus('failed');
                    }
                } else {
                    // No secrets provided - just show stored status
                    setVerificationStatus('stored');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setVerificationStatus('failed');
            }
        };

        verify();
    }, [proofId, secret, nonce, recipientHash, amountParam, getPrivateProof, retryCount, provider]);

    const handleRefresh = () => {
        setRetryCount(prev => prev + 1);
    };

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
                        <div className={`icon-box w-16 h-16 flex items-center justify-center ${verificationStatus === 'verified' ? 'bg-green-400' :
                            verificationStatus === 'failed' ? 'bg-red-400' :
                                verificationStatus === 'stored' ? 'bg-blue-400' :
                                    verificationStatus === 'not_found' ? 'bg-yellow-400' : 'bg-gray-200'
                            }`}>
                            {verificationStatus === 'verified' && <CheckIcon />}
                            {verificationStatus === 'failed' && <div className="text-2xl">❌</div>}
                            {verificationStatus === 'stored' && <div className="text-2xl">📦</div>}
                            {verificationStatus === 'not_found' && <div className="text-2xl">⏳</div>}
                            {verificationStatus === 'loading' && <div className="animate-spin text-2xl">↻</div>}
                        </div>
                        <div>
                            <h1 className="font-serif text-3xl">
                                {verificationStatus === 'verified' && 'Payment Verified'}
                                {verificationStatus === 'failed' && 'Verification Failed'}
                                {verificationStatus === 'stored' && 'Proof Stored'}
                                {verificationStatus === 'not_found' && 'Proof Pending'}
                                {verificationStatus === 'indexing' && 'Indexing Proof'}
                                {verificationStatus === 'loading' && 'Verifying...'}
                            </h1>
                            <p className="text-[#6b6b6b] text-sm">
                                {verificationStatus === 'verified' && 'Cryptographic proof confirmed on Starknet'}
                                {verificationStatus === 'failed' && 'The proof data does not match the blockchain record'}
                                {verificationStatus === 'stored' && 'Proof exists on Starknet (Secrets not provided)'}
                                {verificationStatus === 'not_found' && 'Waiting for transaction to trigger...'}
                                {verificationStatus === 'indexing' && 'Transaction accepted on L2! Syncing data to this node...'}
                                {verificationStatus === 'loading' && 'Checking blockchain state...'}
                            </p>
                            {(verificationStatus === 'not_found' || verificationStatus === 'indexing') && (
                                <button
                                    onClick={handleRefresh}
                                    className="mt-2 text-xs font-semibold uppercase text-[#f97316] hover:underline"
                                >
                                    ↻ Refresh Status
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {/* What was proved */}
                        {(amountParam || (onChainProof && onChainProof.disclosureLevel >= 1)) && (
                            <div className={`p-4 border-2 ${verificationStatus === 'verified' ? 'bg-green-100 border-green-500' : 'bg-[#fafaf7] border-[#0a0a0a]'}`}>
                                <span className={`text-xs font-semibold uppercase ${verificationStatus === 'verified' ? 'text-green-700' : 'text-[#6b6b6b]'}`}>Amount Proved</span>
                                <p className={`font-bold text-2xl mt-1 ${verificationStatus === 'verified' ? 'text-green-800' : ''}`}>
                                    {amountParam ? decodeURIComponent(amountParam) :
                                        (onChainProof && onChainProof.minAmountThreshold > 0) ?
                                            `${Number(onChainProof.minAmountThreshold) / 1e8} ETH` : 'Unknown'}
                                </p>
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
                                    <p className={`font-bold text-lg mt-1 ${verificationStatus === 'verified' ? 'text-green-600' :
                                        verificationStatus === 'failed' ? 'text-red-600' :
                                            (verificationStatus === 'not_found' || verificationStatus === 'indexing') ? 'text-orange-500' : 'text-blue-600'
                                        }`}>
                                        {verificationStatus === 'verified' ? 'Verified ✓' :
                                            verificationStatus === 'failed' ? 'Invalid ✗' :
                                                verificationStatus === 'stored' ? 'Stored 📦' :
                                                    verificationStatus === 'indexing' ? 'Indexing ⚡' :
                                                        verificationStatus === 'not_found' ? 'Pending ⏳' : 'Checking...'}
                                    </p>
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
                                <span className="text-xs font-semibold uppercase text-[#6b6b6b]">
                                    {starknetTx ? 'Starknet Proof Transaction' : 'Proof Commitment Identifier'}
                                </span>
                                <a
                                    href={starknetExplorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#f97316] hover:underline flex items-center gap-1"
                                >
                                    View <ExternalLinkIcon />
                                </a>
                            </div>
                            <p className="font-mono text-xs mt-1 break-all">
                                {starknetTx ? truncateHash(starknetTx) : truncateHash(proofId)}
                            </p>
                            {onChainProof && (
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                    <span className="text-[10px] text-[#6b6b6b] uppercase">Commitment Hash</span>
                                    <p className="font-mono text-[10px] truncate" title={onChainProof.commitment}>
                                        {onChainProof.commitment}
                                    </p>
                                </div>
                            )}
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
                        View on Voyager
                    </a>
                </div>

                {/* Info box */}
                <div className="p-6 border-2 border-dashed border-[#0a0a0a] bg-[#fef9c3]">
                    <h3 className="font-bold uppercase text-sm mb-2">What is this?</h3>
                    <p className="text-sm text-[#6b6b6b]">
                        This is a cryptographic proof of a blockchain payment. It verifies that a specific
                        payment was made without revealing the sender&apos;s wallet address to the public.
                        The proof is permanently stored on Starknet.
                    </p>
                    {verificationStatus === 'stored' && (
                        <p className="text-sm text-[#6b6b6b] mt-2 font-semibold">
                            Note: Verification requires the secret key (included in the full link).
                            Without it, we can only confirm the proof exists.
                        </p>
                    )}
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
