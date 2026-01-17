/**
 * Bitcoin transaction utilities using Blockstream Esplora API
 */

const ESPLORA_API = 'https://blockstream.info/api';

export interface BitcoinTransaction {
  txid: string;
  status: {
    confirmed: boolean;
    block_height?: number;
    block_time?: number;
  };
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey_address: string;
      value: number;
    };
  }>;
  vout: Array<{
    scriptpubkey_address: string;
    value: number;
  }>;
}

export async function fetchTransaction(txid: string): Promise<BitcoinTransaction | null> {
  try {
    const response = await fetch(`${ESPLORA_API}/tx/${txid}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Failed to fetch transaction:', error);
    return null;
  }
}

export function getTransactionAmount(tx: BitcoinTransaction, recipientAddress: string): number {
  const output = tx.vout.find(out => out.scriptpubkey_address === recipientAddress);
  return output?.value || 0;
}

export function getSenderAddresses(tx: BitcoinTransaction): string[] {
  return tx.vin.map(input => input.prevout.scriptpubkey_address).filter(Boolean);
}
