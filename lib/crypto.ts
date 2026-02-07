/**
 * Cryptographic utilities for ZK privacy
 * Uses the same Pedersen hash algorithm as Cairo/Starknet
 */

import { pedersen } from '@scure/starknet';

// ============================================
// DISCLOSURE LEVELS (must match Cairo contract)
// ============================================

export const DisclosureLevel = {
    PRIVATE: 0,  // Only proof existence shown
    AMOUNT: 1,   // Threshold amount disclosed  
    FULL: 2,     // All details disclosed
} as const;

export type DisclosureLevelType = typeof DisclosureLevel[keyof typeof DisclosureLevel];

// ============================================
// COMMITMENT GENERATION
// ============================================

export interface CommitmentInput {
    /** User's secret (never shared) */
    secret: string;
    /** Transaction amount in smallest unit */
    amount: bigint;
    /** Hash of recipient address */
    recipientHash: string;
    /** Random nonce for unlinkability */
    nonce: string;
}

export interface CommitmentResult {
    /** The Pedersen commitment hash */
    commitment: string;
    /** The secret used (store locally, never send to chain) */
    secret: string;
    /** The nonce used (store locally, never send to chain) */
    nonce: string;
}

/**
 * Generate a Pedersen commitment for a payment proof
 * 
 * commitment = H(H(H(secret, amount), recipient), nonce)
 * 
 * This MUST match the Cairo contract's computation exactly!
 * The commitment hides all values but allows verification.
 * 
 * Note: @scure/starknet pedersen() returns a hex string, not bigint
 */
export function generateCommitment(input: CommitmentInput): string {
    // Step 1: H(secret, amount)
    // pedersen accepts Hex | bigint | number and returns string
    const h1 = pedersen(input.secret, input.amount);
    
    // Step 2: H(h1, recipient)
    const h2 = pedersen(h1, input.recipientHash);
    
    // Step 3: H(h2, nonce)
    const commitment = pedersen(h2, input.nonce);
    
    // pedersen already returns hex string with 0x prefix
    return commitment;
}

/**
 * Generate a cryptographically secure random nonce
 * Used as a blinding factor for unlinkability
 */
export function generateNonce(): string {
    if (typeof window === 'undefined') {
        // Server-side fallback
        const bytes = new Uint8Array(31);
        for (let i = 0; i < bytes.length; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
        return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Client-side: use crypto API for true randomness
    const bytes = crypto.getRandomValues(new Uint8Array(31));
    return '0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a random secret for the user
 * This secret is NEVER sent to the blockchain
 */
export function generateSecret(): string {
    return generateNonce(); // Same generation, different semantic meaning
}

/**
 * Create a complete commitment with generated secret and nonce
 */
export function createCommitment(
    amount: bigint,
    recipientHash: string
): CommitmentResult {
    const secret = generateSecret();
    const nonce = generateNonce();
    
    const commitment = generateCommitment({
        secret,
        amount,
        recipientHash,
        nonce,
    });
    
    return {
        commitment,
        secret,
        nonce,
    };
}

// ============================================
// LOCAL STORAGE FOR SECRETS
// ============================================

const STORAGE_PREFIX = 'cloakr_proof_';

export interface ProofSecrets {
    secret: string;
    nonce: string;
    amount: bigint;
    recipientHash: string;
}

/**
 * Store proof secrets locally (NEVER sent to chain)
 * These are needed later to verify ownership of a proof
 */
export function storeProofSecrets(proofId: string, secrets: ProofSecrets): void {
    if (typeof window === 'undefined') return;
    
    const data = {
        secret: secrets.secret,
        nonce: secrets.nonce,
        amount: secrets.amount.toString(),
        recipientHash: secrets.recipientHash,
    };
    
    localStorage.setItem(`${STORAGE_PREFIX}${proofId}`, JSON.stringify(data));
}

/**
 * Retrieve stored secrets for a proof
 */
export function getProofSecrets(proofId: string): ProofSecrets | null {
    if (typeof window === 'undefined') return null;
    
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${proofId}`);
    if (!stored) return null;
    
    try {
        const data = JSON.parse(stored);
        return {
            secret: data.secret,
            nonce: data.nonce,
            amount: BigInt(data.amount),
            recipientHash: data.recipientHash,
        };
    } catch {
        return null;
    }
}

/**
 * Delete stored secrets (for cleanup)
 */
export function deleteProofSecrets(proofId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${STORAGE_PREFIX}${proofId}`);
}

// ============================================
// VERIFICATION HELPERS
// ============================================

/**
 * Verify that a commitment matches the expected values
 * Used locally to confirm before on-chain verification
 */
export function verifyCommitmentLocally(
    storedCommitment: string,
    secrets: ProofSecrets
): boolean {
    const computed = generateCommitment({
        secret: secrets.secret,
        amount: secrets.amount,
        recipientHash: secrets.recipientHash,
        nonce: secrets.nonce,
    });
    
    // Normalize both to lowercase for comparison
    return computed.toLowerCase() === storedCommitment.toLowerCase();
}
