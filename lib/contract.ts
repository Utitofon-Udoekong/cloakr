'use client';

import { useCallback } from 'react';
import { useStarknet } from './starknet';
import { Contract } from 'starknet';
import { DisclosureLevel, createCommitment, storeProofSecrets, getProofSecrets } from './crypto';

// Full ABI from compiled contract - matches exactly what's deployed
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
    "type": "impl",
    "name": "PrivatePaymentVerifierImpl",
    "interface_name": "cloakr_contracts::verifier::IPrivatePaymentVerifier"
  },
  {
    "type": "struct",
    "name": "cloakr_contracts::types::PrivateProofInput",
    "members": [
      { "name": "commitment", "type": "core::felt252" },
      { "name": "min_amount_threshold", "type": "core::integer::u64" },
      { "name": "disclosure_level", "type": "core::integer::u8" }
    ]
  },
  {
    "type": "struct",
    "name": "cloakr_contracts::types::VerificationInput",
    "members": [
      { "name": "proof_id", "type": "core::felt252" },
      { "name": "secret", "type": "core::felt252" },
      { "name": "amount", "type": "core::integer::u64" },
      { "name": "recipient_hash", "type": "core::felt252" },
      { "name": "nonce", "type": "core::felt252" }
    ]
  },
  {
    "type": "struct",
    "name": "cloakr_contracts::types::VerificationResult",
    "members": [
      { "name": "is_valid", "type": "core::bool" },
      { "name": "meets_threshold", "type": "core::bool" },
      { "name": "disclosure_level", "type": "core::integer::u8" }
    ]
  },
  {
    "type": "struct",
    "name": "cloakr_contracts::types::PrivatePaymentProof",
    "members": [
      { "name": "id", "type": "core::felt252" },
      { "name": "commitment", "type": "core::felt252" },
      { "name": "min_amount_threshold", "type": "core::integer::u64" },
      { "name": "disclosure_level", "type": "core::integer::u8" },
      { "name": "created_at", "type": "core::integer::u64" },
      { "name": "creator", "type": "core::starknet::contract_address::ContractAddress" },
      { "name": "is_verified", "type": "core::bool" }
    ]
  },
  {
    "type": "interface",
    "name": "cloakr_contracts::verifier::IPrivatePaymentVerifier",
    "items": [
      {
        "type": "function",
        "name": "create_private_proof",
        "inputs": [{ "name": "input", "type": "cloakr_contracts::types::PrivateProofInput" }],
        "outputs": [{ "type": "core::felt252" }],
        "state_mutability": "external"
      },
      {
        "type": "function",
        "name": "verify_commitment",
        "inputs": [{ "name": "input", "type": "cloakr_contracts::types::VerificationInput" }],
        "outputs": [{ "type": "cloakr_contracts::types::VerificationResult" }],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_private_proof",
        "inputs": [{ "name": "proof_id", "type": "core::felt252" }],
        "outputs": [{ "type": "cloakr_contracts::types::PrivatePaymentProof" }],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_private_proof_count",
        "inputs": [],
        "outputs": [{ "type": "core::integer::u256" }],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_user_proof_count",
        "inputs": [{ "name": "user", "type": "core::starknet::contract_address::ContractAddress" }],
        "outputs": [{ "type": "core::integer::u64" }],
        "state_mutability": "view"
      },
      {
        "type": "function",
        "name": "get_user_proof_at",
        "inputs": [
          { "name": "user", "type": "core::starknet::contract_address::ContractAddress" },
          { "name": "index", "type": "core::integer::u64" }
        ],
        "outputs": [{ "type": "core::felt252" }],
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
    "name": "cloakr_contracts::verifier::PaymentProofVerifier::PrivateProofCreated",
    "kind": "struct",
    "members": [
      { "name": "proof_id", "type": "core::felt252", "kind": "key" },
      { "name": "creator", "type": "core::starknet::contract_address::ContractAddress", "kind": "data" },
      { "name": "commitment", "type": "core::felt252", "kind": "data" },
      { "name": "disclosure_level", "type": "core::integer::u8", "kind": "data" }
    ]
  },
  {
    "type": "event",
    "name": "cloakr_contracts::verifier::PaymentProofVerifier::CommitmentVerified",
    "kind": "struct",
    "members": [
      { "name": "proof_id", "type": "core::felt252", "kind": "key" },
      { "name": "verifier", "type": "core::starknet::contract_address::ContractAddress", "kind": "data" },
      { "name": "is_valid", "type": "core::bool", "kind": "data" }
    ]
  },
  {
    "type": "event",
    "name": "cloakr_contracts::verifier::PaymentProofVerifier::Event",
    "kind": "enum",
    "variants": [
      { "name": "ProofCreated", "type": "cloakr_contracts::verifier::PaymentProofVerifier::ProofCreated", "kind": "nested" },
      { "name": "PrivateProofCreated", "type": "cloakr_contracts::verifier::PaymentProofVerifier::PrivateProofCreated", "kind": "nested" },
      { "name": "CommitmentVerified", "type": "cloakr_contracts::verifier::PaymentProofVerifier::CommitmentVerified", "kind": "nested" }
    ]
  }
];

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VERIFIER_CONTRACT_ADDRESS || '';

// ============================================
// LEGACY TYPES (backward compatibility)
// ============================================

export interface ProofInput {
  sourceTxid: string;
  minAmount: number;
  recipientHash: string;
}

export interface PaymentProof {
  id: string;
  sourceTxid: string;
  minAmount: number;
  recipientHash: string;
  createdAt: number;
  creator: string;
  isVerified: boolean;
}

// ============================================
// PRIVACY-PRESERVING TYPES (ZK)
// ============================================

export interface PrivateProofInput {
  /** Pedersen commitment (computed client-side) */
  commitment: string;
  /** Amount threshold to disclose */
  minAmountThreshold: number;
  /** Disclosure level (0=private, 1=amount, 2=full) */
  disclosureLevel: number;
}

export interface PrivatePaymentProof {
  id: string;
  commitment: string;
  minAmountThreshold: number;
  disclosureLevel: number;
  createdAt: number;
  creator: string;
  isVerified: boolean;
}

export interface VerificationResult {
  isValid: boolean;
  meetsThreshold: boolean;
  disclosureLevel: number;
}

// Helper to convert string to felt-compatible hex (max 252 bits)
function stringToFelt(str: string): string {
  if (str.startsWith('0x')) {
    const hex = str.slice(2).slice(0, 62);
    return '0x' + hex;
  }
  const truncated = str.slice(0, 31);
  let hex = '0x';
  for (let i = 0; i < truncated.length; i++) {
    hex += truncated.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

export function useVerifierContract() {
  const { account, provider, isConnected } = useStarknet();

  const getReadContract = useCallback(() => {
    if (!CONTRACT_ADDRESS) {
      console.warn('Contract address not configured');
      return null;
    }
    return new Contract({ abi: VERIFIER_ABI, address: CONTRACT_ADDRESS, providerOrAccount: provider });
  }, [provider]);

  const getWriteContract = useCallback(() => {
    if (!CONTRACT_ADDRESS || !account) {
      return null;
    }
    return new Contract({ abi: VERIFIER_ABI, address: CONTRACT_ADDRESS, providerOrAccount: account });
  }, [account]);

  // ============================================
  // LEGACY FUNCTIONS
  // ============================================

  const createProof = useCallback(async (input: ProofInput): Promise<string | null> => {
    const contract = getWriteContract();
    if (!contract) {
      throw new Error('Wallet not connected or contract not configured');
    }

    try {
      const sourceTxidFelt = stringToFelt(input.sourceTxid);
      const recipientFelt = stringToFelt(input.recipientHash);

      const myCall = contract.populate('create_proof', {
        input: {
          source_txid: sourceTxidFelt,
          min_amount: input.minAmount,
          recipient_hash: recipientFelt,
        }
      });

      const result = await account!.execute(myCall);
      console.log('Transaction submitted:', result.transaction_hash);
      return result.transaction_hash;
    } catch (error) {
      console.error('Failed to create proof:', error);
      throw error;
    }
  }, [account, getWriteContract]);

  const verifyProof = useCallback(async (proofId: string): Promise<boolean> => {
    const contract = getReadContract();
    if (!contract) return false;

    try {
      const result = await contract.verify_proof(proofId);
      return result === true || 
             (typeof result === 'bigint' && result === BigInt(1)) || 
             result?.variant?.True !== undefined;
    } catch (error) {
      console.error('Failed to verify proof:', error);
      return false;
    }
  }, [getReadContract]);

  const getProof = useCallback(async (proofId: string): Promise<PaymentProof | null> => {
    const contract = getReadContract();
    if (!contract) return null;

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
  }, [getReadContract]);

  const getProofCount = useCallback(async (): Promise<number> => {
    const contract = getReadContract();
    if (!contract) return 0;

    try {
      const result = await contract.get_proof_count();
      if (typeof result === 'object' && result.low !== undefined) {
        return Number(result.low);
      }
      return Number(result);
    } catch (error) {
      console.error('Failed to get proof count:', error);
      return 0;
    }
  }, [getReadContract]);

  // ============================================
  // PRIVACY-PRESERVING FUNCTIONS (ZK)
  // ============================================

  /**
   * Create a private proof using Pedersen commitment
   * The commitment is generated CLIENT-SIDE - secrets never leave your device
   */
  const createPrivateProof = useCallback(async (
    amount: bigint,
    recipientHash: string,
    disclosureLevel: number = DisclosureLevel.PRIVATE
  ): Promise<{ txHash: string; proofId: string } | null> => {
    const contract = getWriteContract();
    if (!contract) {
      throw new Error('Wallet not connected or contract not configured');
    }

    try {
      // Generate commitment client-side
      const { commitment, secret, nonce } = createCommitment(amount, recipientHash);
      
      console.log('Generated commitment:', commitment);
      console.log('Secret stored locally (never sent to chain)');
      console.log('Calling contract.invoke...');

      // Use contract.invoke instead of account.execute
      // This should properly trigger the wallet popup
      const result = await contract.invoke('create_private_proof', [{
        commitment: commitment,
        min_amount_threshold: Number(amount),
        disclosure_level: disclosureLevel,
      }]);
      
      const txHash = result.transaction_hash;
      console.log('Transaction hash:', txHash);
      
      // Use commitment as proof ID (consistent with contract)
      const proofId = commitment;
      
      // Store secrets locally (NEVER sent to chain!)
      storeProofSecrets(proofId, {
        secret,
        nonce,
        amount,
        recipientHash,
      });

      console.log('Private proof transaction submitted:', txHash);
      return { txHash, proofId };
    } catch (error) {
      console.error('Failed to create private proof:', error);
      throw error;
    }
  }, [getWriteContract]);

  /**
   * Verify commitment on-chain (ZK proof of knowledge)
   */
  const verifyCommitment = useCallback(async (proofId: string): Promise<VerificationResult | null> => {
    const contract = getReadContract();
    if (!contract) return null;

    // Get stored secrets
    const secrets = getProofSecrets(proofId);
    if (!secrets) {
      console.error('No secrets found for this proof. You can only verify proofs you created.');
      return null;
    }

    try {
      const result = await contract.verify_commitment({
        proof_id: proofId,
        secret: secrets.secret,
        amount: Number(secrets.amount),
        recipient_hash: secrets.recipientHash,
        nonce: secrets.nonce,
      });

      return {
        isValid: result.is_valid === true || result.is_valid?.variant?.True !== undefined,
        meetsThreshold: result.meets_threshold === true || result.meets_threshold?.variant?.True !== undefined,
        disclosureLevel: Number(result.disclosure_level),
      };
    } catch (error) {
      console.error('Failed to verify commitment:', error);
      return null;
    }
  }, [getReadContract]);

  /**
   * Get private proof details
   */
  const getPrivateProof = useCallback(async (proofId: string): Promise<PrivatePaymentProof | null> => {
    const contract = getReadContract();
    if (!contract) return null;

    try {
      const result = await contract.get_private_proof(proofId);
      
      // Check for zero commitment (proof not found)
      if (result.commitment === undefined || result.commitment.toString() === '0') {
        return null;
      }

      return {
        id: result.id.toString(),
        commitment: result.commitment.toString(),
        minAmountThreshold: Number(result.min_amount_threshold),
        disclosureLevel: Number(result.disclosure_level),
        createdAt: Number(result.created_at),
        creator: result.creator.toString(),
        isVerified: result.is_verified === true || result.is_verified?.variant?.True !== undefined,
      };
    } catch (error) {
      console.error('Failed to get private proof:', error);
      return null;
    }
  }, [getReadContract]);

  /**
   * Get all proofs for a specific user
   */
  const getUserProofs = useCallback(async (userAddress: string): Promise<PrivatePaymentProof[]> => {
    const contract = getReadContract();
    if (!contract) return [];

    try {
      // Get count
      const countResult = await contract.get_user_proof_count(userAddress);
      
      // Handle potential Starknet.js return types for u64
      let count = 0;
      if (typeof countResult === 'bigint') {
        count = Number(countResult); 
      } else if (typeof countResult === 'object' && countResult !== null) {
         // handle undefined props safely
         count = Number((countResult as any).toString());
      } else {
        count = Number(countResult);
      }

      // Only log if count changes or maybe just debug log
      // console.log(`Found ${count} proofs for user ${userAddress}`);

      if (count === 0) return [];

      // Fetch all proofs in parallel
      const proofPromises = [];
      for (let i = 0; i < count; i++) {
        proofPromises.push((async () => {
             try {
                 const proofId = await contract.get_user_proof_at(userAddress, i);
                 const idStr = proofId.toString();
                 return await getPrivateProof(idStr);
             } catch (e) {
                 console.error(`Failed to fetch proof at index ${i}`, e);
                 return null;
             }
        })());
      }
      
      const proofs = await Promise.all(proofPromises);
      // Sort by date desc
      return proofs
        .filter((p): p is PrivatePaymentProof => p !== null)
        .sort((a, b) => b.createdAt - a.createdAt);
        
    } catch (error) {
      console.error('Failed to get user proofs:', error);
      return [];
    }
  }, [getReadContract, getPrivateProof]);

  return {
    // Legacy
    createProof,
    verifyProof,
    getProof,
    getProofCount,
    // Privacy-preserving (ZK)
    createPrivateProof,
    verifyCommitment,
    getPrivateProof,
    getUserProofs,
    // Utilities
    isReady: isConnected && !!CONTRACT_ADDRESS,
    contractAddress: CONTRACT_ADDRESS,
  };
}

// Re-export DisclosureLevel for convenience
export { DisclosureLevel };
