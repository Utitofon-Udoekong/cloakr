'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AccountInterface, RpcProvider } from 'starknet';

interface StarknetContextType {
    account: AccountInterface | null;
    address: string | null;
    isConnecting: boolean;
    isConnected: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    provider: RpcProvider;
}

const StarknetContext = createContext<StarknetContextType | null>(null);

const RPC_URL = process.env.NEXT_PUBLIC_STARKNET_RPC_URL || 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_10/82hkNrfu6ZZ8Wms2vr1U331ml3FtS7AZ';

// Get the starknet window object
declare global {
    interface Window {
        starknet?: {
            id: string;
            name: string;
            version: string;
            isConnected: boolean;
            selectedAddress?: string;
            account?: AccountInterface;
            enable: (options?: { starknetVersion?: string }) => Promise<string[]>;
            request?: (call: { type: string }) => Promise<void>;
        };
        starknet_braavos?: typeof window.starknet;
        starknet_argentX?: typeof window.starknet;
    }
}

export function StarknetProvider({ children }: { children: ReactNode }) {
    const [account, setAccount] = useState<AccountInterface | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [provider] = useState(() => new RpcProvider({ nodeUrl: RPC_URL }));

    const connectWallet = useCallback(async () => {
        setIsConnecting(true);
        try {
            // Try to find available wallet
            const starknet = window.starknet_argentX || window.starknet_braavos || window.starknet;

            if (!starknet) {
                alert('Please install ArgentX or Braavos wallet extension');
                return;
            }

            // Request connection
            await starknet.enable({ starknetVersion: 'v5' });

            if (starknet.isConnected && starknet.account) {
                setAccount(starknet.account);
                setAddress(starknet.selectedAddress || null);
            }
        } catch (error) {
            console.error('Failed to connect wallet:', error);
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const disconnectWallet = useCallback(() => {
        setAccount(null);
        setAddress(null);
    }, []);

    // Check for existing connection on mount
    useEffect(() => {
        const checkConnection = async () => {
            try {
                const starknet = window.starknet_argentX || window.starknet_braavos || window.starknet;
                if (starknet?.isConnected && starknet.account) {
                    setAccount(starknet.account);
                    setAddress(starknet.selectedAddress || null);
                }
            } catch (error) {
                // Silently fail
            }
        };

        // Wait for window to be ready
        if (typeof window !== 'undefined') {
            setTimeout(checkConnection, 500);
        }
    }, []);

    return (
        <StarknetContext.Provider
            value={{
                account,
                address,
                isConnecting,
                isConnected: !!account,
                connectWallet,
                disconnectWallet,
                provider,
            }}
        >
            {children}
        </StarknetContext.Provider>
    );
}

export function useStarknet() {
    const context = useContext(StarknetContext);
    if (!context) {
        throw new Error('useStarknet must be used within a StarknetProvider');
    }
    return context;
}

// Truncate address for display
export function truncateStarknetAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
