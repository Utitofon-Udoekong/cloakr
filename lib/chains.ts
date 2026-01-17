/**
 * Multi-chain transaction utilities
 * Supports: EVM chains (L1 & L2), Starknet, Bitcoin, Solana
 */

const ALCHEMY_API_KEY = '82hkNrfu6ZZ8Wms2vr1U331ml3FtS7AZ';

// Chain configurations
export interface ChainConfig {
  id: string;
  name: string;
  shortName: string;
  category: 'L1' | 'L2' | 'Non-EVM';
  color: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeSymbol: string;
  type: 'evm' | 'starknet' | 'bitcoin' | 'solana';
}

export const CHAINS: ChainConfig[] = [
  // L1 Chains
  {
    id: 'ethereum',
    name: 'Ethereum',
    shortName: 'ETH',
    category: 'L1',
    color: '#627EEA',
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: 'https://etherscan.io',
    nativeSymbol: 'ETH',
    type: 'evm',
  },
  {
    id: 'bnb',
    name: 'BNB Chain',
    shortName: 'BNB',
    category: 'L1',
    color: '#F3BA2F',
    rpcUrl: `https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: 'https://bscscan.com',
    nativeSymbol: 'BNB',
    type: 'evm',
  },
  {
    id: 'tron',
    name: 'Tron',
    shortName: 'TRX',
    category: 'L1',
    color: '#FF0013',
    rpcUrl: 'https://api.trongrid.io',
    explorerUrl: 'https://tronscan.org',
    nativeSymbol: 'TRX',
    type: 'evm', // Tron uses similar JSON-RPC
  },
  // L2 Chains
  {
    id: 'polygon',
    name: 'Polygon',
    shortName: 'MATIC',
    category: 'L2',
    color: '#8247E5',
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: 'https://polygonscan.com',
    nativeSymbol: 'MATIC',
    type: 'evm',
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    shortName: 'ARB',
    category: 'L2',
    color: '#28A0F0',
    rpcUrl: `https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: 'https://arbiscan.io',
    nativeSymbol: 'ETH',
    type: 'evm',
  },
  {
    id: 'optimism',
    name: 'Optimism',
    shortName: 'OP',
    category: 'L2',
    color: '#FF0420',
    rpcUrl: `https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: 'https://optimistic.etherscan.io',
    nativeSymbol: 'ETH',
    type: 'evm',
  },
  {
    id: 'base',
    name: 'Base',
    shortName: 'BASE',
    category: 'L2',
    color: '#0052FF',
    rpcUrl: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: 'https://basescan.org',
    nativeSymbol: 'ETH',
    type: 'evm',
  },
  {
    id: 'zksync',
    name: 'zkSync Era',
    shortName: 'ZK',
    category: 'L2',
    color: '#8C8DFC',
    rpcUrl: `https://zksync-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: 'https://explorer.zksync.io',
    nativeSymbol: 'ETH',
    type: 'evm',
  },
  {
    id: 'sonic',
    name: 'Sonic',
    shortName: 'S',
    category: 'L2',
    color: '#1DB954',
    rpcUrl: 'https://rpc.soniclabs.com',
    explorerUrl: 'https://sonicscan.org',
    nativeSymbol: 'S',
    type: 'evm',
  },
  {
    id: 'starknet',
    name: 'Starknet',
    shortName: 'STRK',
    category: 'L2',
    color: '#EC796B',
    rpcUrl: `https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_10/${ALCHEMY_API_KEY}`,
    explorerUrl: 'https://voyager.online',
    nativeSymbol: 'ETH',
    type: 'starknet',
  },
  // Non-EVM
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    shortName: 'BTC',
    category: 'Non-EVM',
    color: '#F7931A',
    rpcUrl: `https://bitcoin-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: 'https://blockstream.info',
    nativeSymbol: 'BTC',
    type: 'bitcoin',
  },
  {
    id: 'solana',
    name: 'Solana',
    shortName: 'SOL',
    category: 'Non-EVM',
    color: '#9945FF',
    rpcUrl: `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    explorerUrl: 'https://solscan.io',
    nativeSymbol: 'SOL',
    type: 'solana',
  },
];

// Group chains by category
export const CHAIN_CATEGORIES = {
  'L1': CHAINS.filter(c => c.category === 'L1'),
  'L2': CHAINS.filter(c => c.category === 'L2'),
  'Non-EVM': CHAINS.filter(c => c.category === 'Non-EVM'),
};

export function getChainById(id: string): ChainConfig | undefined {
  return CHAINS.find(c => c.id === id);
}

export interface TransactionData {
  chain: string;
  chainConfig: ChainConfig;
  txid: string;
  amount: string;
  from: string[];
  to: string[];
  timestamp?: number;
  status: 'confirmed' | 'pending';
  blockNumber?: number;
  fee?: string;
}

/**
 * Fetch transaction from EVM chain
 */
async function fetchEvmTransaction(txHash: string, chain: ChainConfig): Promise<TransactionData | null> {
  try {
    const response = await fetch(chain.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1,
      }),
    });

    const data = await response.json();
    if (!data.result) return null;

    const tx = data.result;
    const value = parseInt(tx.value, 16) / 1e18;

    return {
      chain: chain.id,
      chainConfig: chain,
      txid: txHash,
      amount: `${value.toFixed(6)} ${chain.nativeSymbol}`,
      from: [tx.from],
      to: [tx.to || 'Contract Creation'],
      status: tx.blockNumber ? 'confirmed' : 'pending',
      blockNumber: tx.blockNumber ? parseInt(tx.blockNumber, 16) : undefined,
    };
  } catch (error) {
    console.error(`${chain.name} fetch error:`, error);
    return null;
  }
}

/**
 * Fetch transaction from Starknet
 */
async function fetchStarknetTransaction(txHash: string, chain: ChainConfig): Promise<TransactionData | null> {
  try {
    const response = await fetch(chain.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'starknet_getTransactionReceipt',
        params: [txHash],
        id: 1,
      }),
    });

    const data = await response.json();
    if (data.error || !data.result) return null;

    const receipt = data.result;
    const fee = receipt.actual_fee?.amount 
      ? (parseInt(receipt.actual_fee.amount, 16) / 1e18).toFixed(6)
      : '0';

    return {
      chain: chain.id,
      chainConfig: chain,
      txid: txHash,
      amount: `${fee} ETH (fee)`,
      from: [receipt.contract_address || 'Unknown'],
      to: [receipt.contract_address || 'Unknown'],
      status: receipt.finality_status === 'ACCEPTED_ON_L2' ? 'confirmed' : 'pending',
      blockNumber: receipt.block_number,
      fee: `${fee} ETH`,
    };
  } catch (error) {
    console.error('Starknet fetch error:', error);
    return null;
  }
}

/**
 * Fetch transaction from Bitcoin
 */
async function fetchBitcoinTransaction(txHash: string, chain: ChainConfig): Promise<TransactionData | null> {
  try {
    const response = await fetch(`${chain.rpcUrl}/tx/${txHash}`);
    if (!response.ok) return null;

    const tx = await response.json();

    const totalValue = tx.vout.reduce((sum: number, out: { value: number }) => sum + out.value, 0);
    const senders = tx.vin
      .map((input: { prevout?: { scriptpubkey_address: string } }) => input.prevout?.scriptpubkey_address)
      .filter(Boolean);
    const recipients = tx.vout
      .map((out: { scriptpubkey_address: string }) => out.scriptpubkey_address)
      .filter(Boolean);

    return {
      chain: chain.id,
      chainConfig: chain,
      txid: txHash,
      amount: `${(totalValue / 100_000_000).toFixed(8)} BTC`,
      from: senders,
      to: recipients,
      status: tx.status?.confirmed ? 'confirmed' : 'pending',
      timestamp: tx.status?.block_time,
      blockNumber: tx.status?.block_height,
    };
  } catch (error) {
    console.error('Bitcoin fetch error:', error);
    return null;
  }
}

/**
 * Fetch transaction from Solana
 */
async function fetchSolanaTransaction(signature: string, chain: ChainConfig): Promise<TransactionData | null> {
  try {
    const response = await fetch(chain.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'getTransaction',
        params: [signature, { encoding: 'json', maxSupportedTransactionVersion: 0 }],
        id: 1,
      }),
    });

    const data = await response.json();
    if (!data.result) return null;

    const tx = data.result;
    const preBalances = tx.meta?.preBalances || [];
    const postBalances = tx.meta?.postBalances || [];
    const accounts = tx.transaction?.message?.accountKeys || [];

    // Calculate transfer amount (simplified)
    let amount = 0;
    if (preBalances.length > 0 && postBalances.length > 0) {
      amount = Math.abs(preBalances[0] - postBalances[0]) / 1e9;
    }

    return {
      chain: chain.id,
      chainConfig: chain,
      txid: signature,
      amount: `${amount.toFixed(6)} SOL`,
      from: accounts.slice(0, 1).map((a: { pubkey?: string } | string) => typeof a === 'string' ? a : a.pubkey || 'Unknown'),
      to: accounts.slice(1, 2).map((a: { pubkey?: string } | string) => typeof a === 'string' ? a : a.pubkey || 'Unknown'),
      status: tx.meta?.err === null ? 'confirmed' : 'pending',
      blockNumber: tx.slot,
      fee: `${(tx.meta?.fee || 0) / 1e9} SOL`,
    };
  } catch (error) {
    console.error('Solana fetch error:', error);
    return null;
  }
}

/**
 * Fetch transaction from any supported chain
 */
export async function fetchTransaction(txHash: string, chainId: string): Promise<TransactionData | null> {
  const chain = getChainById(chainId);
  if (!chain) return null;

  switch (chain.type) {
    case 'evm':
      return fetchEvmTransaction(txHash, chain);
    case 'starknet':
      return fetchStarknetTransaction(txHash, chain);
    case 'bitcoin':
      return fetchBitcoinTransaction(txHash, chain);
    case 'solana':
      return fetchSolanaTransaction(txHash, chain);
    default:
      return null;
  }
}
