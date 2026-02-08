'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useVerifierContract, PrivatePaymentProof } from '@/lib/contract';
import { useStarknet } from '@/lib/starknet';

export default function DashboardPage() {
    const { isConnected, account } = useStarknet();
    const { getUserProofs } = useVerifierContract();

    const [proofs, setProofs] = useState<PrivatePaymentProof[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProofs = async () => {
            if (isConnected && account && getUserProofs) {
                setLoading(true);
                try {
                    const userProofs = await getUserProofs(account.address);
                    setProofs(userProofs);
                } catch (err) {
                    console.error('Failed to fetch user proofs:', err);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchProofs();
    }, [isConnected, account, getUserProofs]);

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-[#fafaf7] flex flex-col items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <h1 className="font-serif text-3xl mb-4">Connect Wallet</h1>
                    <p className="text-[#6b6b6b] mb-8">
                        Please connect your Starknet wallet to view your proof history.
                    </p>
                    {/* Wallet connection is handled by Header usually, or we can add button here if needed */}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafaf7] py-12">
            <div className="max-w-4xl mx-auto px-6">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="font-serif text-3xl">My Proofs</h1>
                    <Link
                        href="/generate"
                        className="bg-[#0a0a0a] text-[#fafaf7] px-6 py-2 font-semibold uppercase text-sm hover:bg-[#2a2a2a] transition-colors"
                    >
                        Create New +
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin text-4xl mb-4">↻</div>
                        <p className="text-[#6b6b6b]">Loading your history...</p>
                    </div>
                ) : proofs.length === 0 ? (
                    <div className="text-center py-12 neo-card p-8 bg-white/50">
                        <p className="text-[#6b6b6b] mb-4">You haven't created any proofs yet.</p>
                        <Link
                            href="/generate"
                            className="text-[#f97316] font-semibold hover:underline"
                        >
                            Generate your first proof →
                        </Link>
                    </div>
                ) : (
                    <div className="neo-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#f0f0ed] border-b-2 border-[#0a0a0a]">
                                    <tr>
                                        <th className="p-4 font-semibold uppercase text-xs text-[#6b6b6b]">Proof ID</th>
                                        <th className="p-4 font-semibold uppercase text-xs text-[#6b6b6b]">Date</th>
                                        <th className="p-4 font-semibold uppercase text-xs text-[#6b6b6b]">Status</th>
                                        <th className="p-4 font-semibold uppercase text-xs text-[#6b6b6b]">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e5e5e5]">
                                    {proofs.map((proof) => (
                                        <tr key={proof.id} className="hover:bg-[#f5f5f2] transition-colors">
                                            <td className="p-4 font-mono text-sm">
                                                {proof.id.slice(0, 10)}...{proof.id.slice(-8)}
                                            </td>
                                            <td className="p-4 text-sm">
                                                {new Date(proof.createdAt * 1000).toLocaleDateString()}
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold uppercase
                                                    ${proof.isVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                                                `}>
                                                    {proof.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Link
                                                    href={`/proof/${proof.id}`}
                                                    className="text-[#f97316] hover:underline text-sm font-semibold uppercase"
                                                >
                                                    View Details →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
