'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchTransaction, TransactionData, CHAINS, CHAIN_CATEGORIES, getChainById } from '@/lib/chains';
import { useVerifierContract } from '@/lib/contract';
import { useStarknet } from '@/lib/starknet';
import Link from 'next/link';

// Icons
const ArrowLeftIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

const LoadingIcon = () => (
    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

type Step = 'input' | 'confirm' | 'generating' | 'complete';

// Wrap in Suspense for useSearchParams
export default function GenerateProofPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#fafaf7] flex items-center justify-center"><LoadingIcon /></div>}>
            <GenerateProofContent />
        </Suspense>
    );
}

function GenerateProofContent() {
    const searchParams = useSearchParams();
    const { isConnected, connectWallet } = useStarknet();
    const { createProof, isReady, getProofCount } = useVerifierContract();

    const [step, setStep] = useState<Step>('input');
    const [txid, setTxid] = useState('');
    const [selectedChain, setSelectedChain] = useState<string>('ethereum');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [transaction, setTransaction] = useState<TransactionData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [proofId, setProofId] = useState<string | null>(null);
    const [generationError, setGenerationError] = useState('');

    const selectedChainConfig = getChainById(selectedChain);

    // Pre-fill txid from URL params
    useEffect(() => {
        const urlTxid = searchParams.get('txid');
        if (urlTxid) {
            setTxid(urlTxid);
        }
    }, [searchParams]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = () => setDropdownOpen(false);
        if (dropdownOpen) {
            document.addEventListener('click', handleClick);
            return () => document.removeEventListener('click', handleClick);
        }
    }, [dropdownOpen]);

    // Fetch transaction details
    const handleFetchTransaction = async () => {
        if (!txid.trim()) {
            setError('Please enter a transaction hash');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const tx = await fetchTransaction(txid.trim(), selectedChain);

            if (!tx) {
                setError(`Transaction not found on ${selectedChainConfig?.name}. Please check the hash and try again.`);
                setIsLoading(false);
                return;
            }
            setTransaction(tx);
            setStep('confirm');
        } catch (err) {
            setError('Failed to fetch transaction. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Generate the proof - now uses real contract!
    const handleGenerateProof = async () => {
        if (!transaction) return;

        setStep('generating');
        setGenerationError('');

        try {
            // Check if wallet connected and contract ready
            if (!isConnected) {
                setGenerationError('Please connect your wallet first');
                setStep('confirm');
                return;
            }

            if (!isReady) {
                setGenerationError('Contract not ready. Please try again.');
                setStep('confirm');
                return;
            }

            // Parse amount from transaction (remove currency suffix)
            const amountStr = transaction.amount.split(' ')[0];
            const amount = Math.floor(parseFloat(amountStr) * 1e8); // Convert to satoshis/wei

            // Create proof on-chain
            const txHash = await createProof({
                btcTxid: transaction.txid,
                minAmount: amount,
                recipientHash: transaction.to[0] || '0x0',
            });

            if (!txHash) {
                throw new Error('Failed to create proof');
            }

            // Get the proof count to determine proof ID
            const count = await getProofCount();
            const proofIdNum = count.toString();

            setProofId(proofIdNum);
            setStep('complete');
        } catch (err: unknown) {
            console.error('Proof generation error:', err);
            setGenerationError(err instanceof Error ? err.message : 'Failed to generate proof');
            setStep('confirm');
        }
    };

    // Truncate hash for display
    const truncateHash = (hash: string) => {
        if (hash.length <= 20) return hash;
        return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
    };

    return (
        <div className="min-h-screen bg-[#fafaf7] py-12">
            <div className="max-w-2xl mx-auto px-6">
                {/* Back link */}
                <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase mb-8 hover:text-[#f97316] transition-colors">
                    <ArrowLeftIcon />
                    Back to Home
                </Link>

                <h1 className="font-serif text-4xl md:text-5xl mb-4">Generate Proof</h1>
                <p className="text-[#6b6b6b] mb-8">Create a zero-knowledge proof for any blockchain transaction.</p>

                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-2">
                    {['Input', 'Confirm', 'Generate', 'Complete'].map((label, i) => {
                        const stepIndex = ['input', 'confirm', 'generating', 'complete'].indexOf(step);
                        const isActive = i === stepIndex;
                        const isComplete = i < stepIndex;

                        return (
                            <div key={label} className="flex items-center gap-2 shrink-0">
                                <div className={`w-8 h-8 border-3 border-[#0a0a0a] flex items-center justify-center font-bold text-sm
                  ${isComplete ? 'bg-green-400' : isActive ? 'bg-[#f97316]' : 'bg-white'}`}
                                >
                                    {isComplete ? <CheckIcon /> : i + 1}
                                </div>
                                <span className={`text-xs font-semibold uppercase ${isActive ? 'text-[#0a0a0a]' : 'text-[#6b6b6b]'}`}>
                                    {label}
                                </span>
                                {i < 3 && <div className="w-6 h-[2px] bg-[#0a0a0a]" />}
                            </div>
                        );
                    })}
                </div>

                {/* Step: Input */}
                {step === 'input' && (
                    <div className="neo-card p-6 md:p-8">
                        <h2 className="font-bold uppercase text-sm mb-6">Enter Transaction Hash</h2>

                        {/* Chain Dropdown */}
                        <div className="mb-4">
                            <label className="block text-xs font-semibold uppercase text-[#6b6b6b] mb-2">
                                Select Chain
                            </label>
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setDropdownOpen(!dropdownOpen); }}
                                    className="w-full flex items-center justify-between px-4 py-3 border-3 border-[#0a0a0a] bg-white shadow-[2px_2px_0px_#0a0a0a] text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-6 h-6 rounded-full border-2 border-[#0a0a0a]"
                                            style={{ backgroundColor: selectedChainConfig?.color }}
                                        />
                                        <span className="font-bold">{selectedChainConfig?.name}</span>
                                        <span className="text-xs text-[#6b6b6b]">{selectedChainConfig?.category}</span>
                                    </div>
                                    <ChevronDownIcon />
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border-3 border-[#0a0a0a] shadow-[4px_4px_0px_#0a0a0a] max-h-80 overflow-y-auto">
                                        {Object.entries(CHAIN_CATEGORIES).map(([category, chains]) => (
                                            <div key={category}>
                                                <div className="px-4 py-2 bg-[#fafaf7] text-xs font-bold uppercase text-[#6b6b6b] border-b-2 border-[#0a0a0a]">
                                                    {category}
                                                </div>
                                                {chains.map((chain) => (
                                                    <button
                                                        key={chain.id}
                                                        onClick={() => { setSelectedChain(chain.id); setDropdownOpen(false); }}
                                                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fde047] transition-colors border-b border-[#e5e5e5] ${selectedChain === chain.id ? 'bg-[#fde047]' : ''}`}
                                                    >
                                                        <div
                                                            className="w-5 h-5 rounded-full border-2 border-[#0a0a0a]"
                                                            style={{ backgroundColor: chain.color }}
                                                        />
                                                        <span className="font-semibold">{chain.name}</span>
                                                        <span className="text-xs text-[#6b6b6b] ml-auto">{chain.shortName}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <input
                            type="text"
                            value={txid}
                            onChange={(e) => setTxid(e.target.value)}
                            placeholder={selectedChainConfig?.type === 'bitcoin' ? 'Enter transaction ID...' : '0x...'}
                            className="neo-input mb-4"
                        />

                        {error && (
                            <p className="text-red-600 text-sm font-medium mb-4">{error}</p>
                        )}

                        <button
                            onClick={handleFetchTransaction}
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <LoadingIcon />
                                    Fetching...
                                </>
                            ) : (
                                'Fetch Transaction'
                            )}
                        </button>

                        <p className="text-xs text-[#6b6b6b] mt-4 text-center">
                            Supports {CHAINS.length} chains across L1, L2, and non-EVM networks
                        </p>
                    </div>
                )}

                {/* Step: Confirm */}
                {step === 'confirm' && transaction && (
                    <div className="neo-card p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold uppercase text-sm">Confirm Transaction</h2>
                            <span
                                className="px-3 py-1 text-xs font-bold uppercase border-2 border-[#0a0a0a] text-white"
                                style={{ backgroundColor: transaction.chainConfig.color }}
                            >
                                {transaction.chainConfig.name}
                            </span>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Transaction Hash</span>
                                <p className="font-mono text-sm mt-1 break-all">{transaction.txid}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                    <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Amount</span>
                                    <p className="font-bold text-lg mt-1">{transaction.amount}</p>
                                </div>
                                <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                    <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Status</span>
                                    <p className={`font-bold text-lg mt-1 ${transaction.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {transaction.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                <span className="text-xs font-semibold uppercase text-[#6b6b6b]">From</span>
                                <div className="mt-1 space-y-1">
                                    {transaction.from.slice(0, 3).map((addr, i) => (
                                        <p key={i} className="font-mono text-sm">{truncateHash(addr)}</p>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                <span className="text-xs font-semibold uppercase text-[#6b6b6b]">To</span>
                                <div className="mt-1 space-y-1">
                                    {transaction.to.slice(0, 3).map((addr, i) => (
                                        <p key={i} className="font-mono text-sm">{truncateHash(addr)}</p>
                                    ))}
                                </div>
                            </div>

                            {transaction.fee && (
                                <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a]">
                                    <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Fee</span>
                                    <p className="font-mono text-sm mt-1">{transaction.fee}</p>
                                </div>
                            )}
                        </div>

                        {/* Error message */}
                        {generationError && (
                            <div className="p-4 bg-red-100 border-2 border-red-500 mb-4">
                                <p className="text-red-600 text-sm font-medium">{generationError}</p>
                            </div>
                        )}

                        {/* Wallet connection prompt */}
                        {!isConnected && (
                            <div className="p-4 bg-yellow-100 border-2 border-[#0a0a0a] mb-4">
                                <p className="text-sm font-medium mb-2">Connect your wallet to generate a proof on Starknet</p>
                                <button
                                    onClick={connectWallet}
                                    className="btn-primary py-2 px-4 text-sm"
                                >
                                    Connect Wallet
                                </button>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('input')}
                                className="btn-outline flex-1"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleGenerateProof}
                                disabled={!isConnected}
                                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isConnected ? 'Generate Proof' : 'Connect Wallet First'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step: Generating */}
                {step === 'generating' && (
                    <div className="neo-card p-8 text-center">
                        <div className="icon-box w-20 h-20 mx-auto flex items-center justify-center mb-6">
                            <LoadingIcon />
                        </div>
                        <h2 className="font-bold uppercase text-sm mb-2">Generating Proof</h2>
                        <p className="text-[#6b6b6b] text-sm">
                            Creating your zero-knowledge proof on Starknet...
                        </p>
                    </div>
                )}

                {/* Step: Complete */}
                {step === 'complete' && (
                    <div className="neo-card p-8 text-center">
                        <div className="icon-box w-20 h-20 mx-auto flex items-center justify-center mb-6 bg-green-400">
                            <CheckIcon />
                        </div>
                        <h2 className="font-bold uppercase text-lg mb-2">Proof Generated!</h2>
                        <p className="text-[#6b6b6b] mb-6">
                            Your payment proof has been created and stored on Starknet.
                        </p>

                        <div className="p-4 bg-[#fafaf7] border-2 border-[#0a0a0a] mb-6">
                            <span className="text-xs font-semibold uppercase text-[#6b6b6b]">Proof ID</span>
                            <p className="font-mono text-lg mt-1">{proofId}</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/proof/${proofId}`)}
                                className="btn-primary"
                            >
                                Copy Shareable Link
                            </button>
                            <Link href={`/proof/${proofId}`} className="btn-outline text-center">
                                View Proof
                            </Link>
                            <Link href="/" className="text-sm font-semibold uppercase text-[#6b6b6b] hover:text-[#0a0a0a]">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
