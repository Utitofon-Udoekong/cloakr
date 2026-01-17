'use client';

import { useStarknet } from './starknet';
import { Contract, cairo } from 'starknet';

// Contract ABI for PaymentProofVerifier
const VERIFIER_ABI = [
  {
    "type": "function",
    "name": "create_proof",
    "inputs": [
      {
        "name": "input",
        "type": "cloakr_contracts::types::ProofInput"
      }
    ],
    "outputs": [
      {
        "type": "core::felt252"
      }
    ],
    "state_mutability": "external"
  },
  {
    "type": "function",
    "name": "verify_proof",
    "inputs": [
      {
        "name": "proof_id",
        "type": "core::felt252"
      }
    ],
    "outputs": [
      {
        "type": "core::bool"
      }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_proof",
    "inputs": [
      {
        "name": "proof_id",
        "type": "core::felt252"
      }
    ],
    "outputs": [
      {
        "type": "cloakr_contracts::types::PaymentProof"
      }
    ],
    "state_mutability": "view"
  },
  {
    "type": "function",
    "name": "get_proof_count",
    "inputs": [],
    "outputs": [
      {
        "type": "core::integer::u256"
      }
    ],
    "state_mutability": "view"
  }
] as const;

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERIFIER_CONTRACT_ADDRESS || '';

export interface ProofInput {
  btcTxid: string;
  minAmount: number;
  recipientHash: string;
}

export interface PaymentProof {
  id: string;
  btcTxid: string;
  minAmount: number;
  recipientHash: string;
  createdAt: number;
  creator: string;
  isVerified: boolean;
}

export function useVerifierContract() {
  const { account, provider, isConnected } = useStarknet();

  // Get read-only contract
  const getReadContract = () => {
    if (!CONTRACT_ADDRESS) {
      console.warn('Contract address not configured');
      return null;
    }
    return new Contract(VERIFIER_ABI, CONTRACT_ADDRESS, provider);
  };

  // Get write contract (requires connected wallet)
  const getWriteContract = () => {
    if (!CONTRACT_ADDRESS || !account) {
      return null;
    }
    return new Contract(VERIFIER_ABI, CONTRACT_ADDRESS, account);
  };

  // Create a proof on-chain
  const createProof = async (input: ProofInput): Promise<string | null> => {
    const contract = getWriteContract();
    if (!contract) {
      throw new Error('Wallet not connected or contract not configured');
    }

    try {
      // Convert string to felt252 (simplified - in production use proper encoding)
      const btcTxidFelt = cairo.felt(input.btcTxid.slice(0, 31)); // Truncate to fit felt252
      const recipientFelt = cairo.felt(input.recipientHash.slice(0, 31));

      const result = await contract.create_proof({
        btc_txid: btcTxidFelt,
        min_amount: input.minAmount,
        recipient_hash: recipientFelt,
      });

      // Wait for transaction
      await provider.waitForTransaction(result.transaction_hash);

      // Return proof ID from events or transaction
      return result.transaction_hash;
    } catch (error) {
      console.error('Failed to create proof:', error);
      throw error;
    }
  };

  // Verify a proof exists and is valid
  const verifyProof = async (proofId: string): Promise<boolean> => {
    const contract = getReadContract();
    if (!contract) {
      return false;
    }

    try {
      const result = await contract.verify_proof(cairo.felt(proofId));
      return result;
    } catch (error) {
      console.error('Failed to verify proof:', error);
      return false;
    }
  };

  // Get proof details
  const getProof = async (proofId: string): Promise<PaymentProof | null> => {
    const contract = getReadContract();
    if (!contract) {
      return null;
    }

    try {
      const result = await contract.get_proof(cairo.felt(proofId));
      return {
        id: result.id.toString(),
        btcTxid: result.btc_txid.toString(),
        minAmount: Number(result.min_amount),
        recipientHash: result.recipient_hash.toString(),
        createdAt: Number(result.created_at),
        creator: result.creator.toString(),
        isVerified: result.is_verified,
      };
    } catch (error) {
      console.error('Failed to get proof:', error);
      return null;
    }
  };

  // Get total proof count
  const getProofCount = async (): Promise<number> => {
    const contract = getReadContract();
    if (!contract) {
      return 0;
    }

    try {
      const result = await contract.get_proof_count();
      return Number(result);
    } catch (error) {
      console.error('Failed to get proof count:', error);
      return 0;
    }
  };

  return {
    createProof,
    verifyProof,
    getProof,
    getProofCount,
    isReady: isConnected && !!CONTRACT_ADDRESS,
    contractAddress: CONTRACT_ADDRESS,
  };
}
