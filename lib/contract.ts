'use client';

import { useStarknet } from './starknet';
import { Contract } from 'starknet';
import { DisclosureLevel, createCommitment, storeProofSecrets, getProofSecrets } from './crypto';

// ============================================
// LEGACY ABI (backward compatibility)
// ============================================
const LEGACY_ABI = [
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
  }
];

// ============================================
// PRIVACY-PRESERVING ABI (ZK)
// ============================================
const PRIVATE_ABI = [
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
      }
    ]
  }
];

// Combined ABI for the contract
const VERIFIER_ABI = [
  ...LEGACY_ABI,
  ...PRIVATE_ABI,
  {
    "type": "constructor",
    "name": "constructor",
    "inputs": [{ "name": "owner", "type": "core::starknet::contract_address::ContractAddress" }]
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

  const getReadContract = () => {
    if (!CONTRACT_ADDRESS) {
      console.warn('Contract address not configured');
      return null;
    }
    return new Contract(VERIFIER_ABI, CONTRACT_ADDRESS, provider);
  };

  const getWriteContract = () => {
    if (!CONTRACT_ADDRESS || !account) {
      return null;
    }
    return new Contract(VERIFIER_ABI, CONTRACT_ADDRESS, account);
  };

  // ============================================
  // LEGACY FUNCTIONS
  // ============================================

  const createProof = async (input: ProofInput): Promise<string | null> => {
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
  };

  const verifyProof = async (proofId: string): Promise<boolean> => {
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
  };

  const getProof = async (proofId: string): Promise<PaymentProof | null> => {
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
  };

  const getProofCount = async (): Promise<number> => {
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
  };

  // ============================================
  // PRIVACY-PRESERVING FUNCTIONS (ZK)
  // ============================================

  /**
   * Create a private proof using Pedersen commitment
   * The commitment is generated CLIENT-SIDE - secrets never leave your device
   */
  const createPrivateProof = async (
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

      const myCall = contract.populate('create_private_proof', {
        input: {
          commitment: commitment,
          min_amount_threshold: Number(amount),
          disclosure_level: disclosureLevel,
        }
      });

      const result = await account!.execute(myCall);
      const txHash = result.transaction_hash;
      
      // Use tx hash as proof ID for now (actual proof ID comes from contract)
      const proofId = txHash;
      
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
  };

  /**
   * Verify commitment on-chain (ZK proof of knowledge)
   */
  const verifyCommitment = async (proofId: string): Promise<VerificationResult | null> => {
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
  };

  /**
   * Get private proof details
   */
  const getPrivateProof = async (proofId: string): Promise<PrivatePaymentProof | null> => {
    const contract = getReadContract();
    if (!contract) return null;

    try {
      const result = await contract.get_private_proof(proofId);
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
  };

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
    // Utilities
    isReady: isConnected && !!CONTRACT_ADDRESS,
    contractAddress: CONTRACT_ADDRESS,
  };
}

// Re-export DisclosureLevel for convenience
export { DisclosureLevel };
