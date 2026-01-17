'use client';

import { useStarknet } from './starknet';
import { Contract } from 'starknet';

// Full ABI from compiled contract - updated for multi-chain support
const VERIFIER_ABI = [
  {
    "type": "impl",
    "name": "PaymentProofVerifierImpl",
    "interface_name": "cloakr_contracts::verifier::IPaymentProofVerifier"
  },
  {
    "type": "struct",
    "name": "cloakr_contracts::types::ProofInput",
    "members": [
      { "name": "source_txid", "type": "core::felt252" },
      { "name": "min_amount", "type": "core::integer::u64" },
      { "name": "recipient_hash", "type": "core::felt252" }
    ]
  },
  {
    "type": "enum",
    "name": "core::bool",
    "variants": [
      { "name": "False", "type": "()" },
      { "name": "True", "type": "()" }
    ]
  },
  {
    "type": "struct",
    "name": "cloakr_contracts::types::PaymentProof",
    "members": [
      { "name": "id", "type": "core::felt252" },
      { "name": "source_txid", "type": "core::felt252" },
      { "name": "min_amount", "type": "core::integer::u64" },
      { "name": "recipient_hash", "type": "core::felt252" },
      { "name": "created_at", "type": "core::integer::u64" },
      { "name": "creator", "type": "core::starknet::contract_address::ContractAddress" },
      { "name": "is_verified", "type": "core::bool" }
    ]
  },
  {
    "type": "struct",
    "name": "core::integer::u256",
    "members": [
      { "name": "low", "type": "core::integer::u128" },
      { "name": "high", "type": "core::integer::u128" }
    ]
  },
  {
    "type": "interface",
    "name": "cloakr_contracts::verifier::IPaymentProofVerifier",
    "items": [
      {
        "type": "function",
        "name": "create_proof",
        "inputs": [{ "name": "input", "type": "cloakr_contracts::types::ProofInput" }],
        "outputs": [{ "type": "core::felt252" }],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "verify_proof",
        "inputs": [{ "name": "proof_id", "type": "core::felt252" }],
        "outputs": [{ "type": "core::bool" }],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_proof",
        "inputs": [{ "name": "proof_id", "type": "core::felt252" }],
        "outputs": [{ "type": "cloakr_contracts::types::PaymentProof" }],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_proof_count",
        "inputs": [],
        "outputs": [{ "type": "core::integer::u256" }],
        "state_mutability": "view"
      }
    ]
  },
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [{ "name": "owner", "type": "core::starknet::contract_address::ContractAddress" }]
  },
  {
    "type": "event",
    "name": "cloakr_contracts::verifier::PaymentProofVerifier::ProofCreated",
    "kind": "struct",
    "members": [
      { "name": "proof_id", "type": "core::felt252", "kind": "key" },
      { "name": "creator", "type": "core::starknet::contract_address::ContractAddress", "kind": "data" },
      { "name": "source_txid", "type": "core::felt252", "kind": "data" }
    ]
  },
  {
    "type": "event",
    "name": "cloakr_contracts::verifier::PaymentProofVerifier::Event",
    "kind": "enum",
    "variants": [
      { "name": "ProofCreated", "type": "cloakr_contracts::verifier::PaymentProofVerifier::ProofCreated", "kind": "nested" }
    ]
  }
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERIFIER_CONTRACT_ADDRESS || '';

export interface ProofInput {
  sourceTxid: string;  // Transaction ID from any chain
  minAmount: number;
  recipientHash: string;
}

export interface PaymentProof {
  id: string;
  sourceTxid: string;  // Transaction ID from source chain
  minAmount: number;
  recipientHash: string;
  createdAt: number;
  creator: string;
  isVerified: boolean;
}

// Helper to convert string to felt-compatible hex (max 252 bits)
function stringToFelt(str: string): string {
  // If already hex, truncate to fit felt252 (max 62 hex chars = 248 bits, safe for felt252)
  if (str.startsWith('0x')) {
    // Remove 0x, take first 62 chars, add 0x back
    const hex = str.slice(2).slice(0, 62);
    return '0x' + hex;
  }
  // Convert string to hex (first 31 chars to fit felt252)
  const truncated = str.slice(0, 31);
  let hex = '0x';
  for (let i = 0; i < truncated.length; i++) {
    hex += truncated.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
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
      // Convert inputs to felt252 format
      const sourceTxidFelt = stringToFelt(input.sourceTxid);
      const recipientFelt = stringToFelt(input.recipientHash);

      // Call with struct as an object with the exact field names from ABI
      const myCall = contract.populate('create_proof', {
        input: {
          source_txid: sourceTxidFelt,
          min_amount: input.minAmount,
          recipient_hash: recipientFelt,
        }
      });

      const result = await account!.execute(myCall);

      // Return transaction hash immediately (don't wait for confirmation to avoid timeout)
      console.log('Transaction submitted:', result.transaction_hash);
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
      const result = await contract.verify_proof(proofId);
      // Handle different return formats - avoid BigInt literal for ES compatibility
      return result === true || 
             (typeof result === 'bigint' && result === BigInt(1)) || 
             result?.variant?.True !== undefined;
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
      const result = await contract.get_proof(proofId);
      return {
        id: result.id.toString(),
        sourceTxid: result.source_txid.toString(),
        minAmount: Number(result.min_amount),
        recipientHash: result.recipient_hash.toString(),
        createdAt: Number(result.created_at),
        creator: result.creator.toString(),
        isVerified: result.is_verified === true || result.is_verified?.variant?.True !== undefined,
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
      // u256 returns as object with low/high
      if (typeof result === 'object' && result.low !== undefined) {
        return Number(result.low);
      }
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
