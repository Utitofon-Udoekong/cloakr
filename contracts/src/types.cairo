use starknet::ContractAddress;

// ============================================
// LEGACY TYPES (kept for backward compatibility)
// ============================================

/// Legacy payment proof struct (non-private)
#[derive(Drop, Serde, Copy, starknet::Store)]
pub struct PaymentProof {
    /// Unique proof ID
    pub id: felt252,
    /// Source chain transaction ID (truncated to felt252)
    pub source_txid: felt252,
    /// Minimum amount claimed (in smallest unit)
    pub min_amount: u64,
    /// Recipient address hash
    pub recipient_hash: felt252,
    /// Timestamp when proof was created
    pub created_at: u64,
    /// Address that created this proof
    pub creator: ContractAddress,
    /// Whether the proof is verified
    pub is_verified: bool,
}

/// Legacy proof creation input
#[derive(Drop, Serde)]
pub struct ProofInput {
    pub source_txid: felt252,
    pub min_amount: u64,
    pub recipient_hash: felt252,
}

// ============================================
// PRIVACY-PRESERVING TYPES (ZK)
// ============================================

/// Disclosure levels for privacy control
/// 0 = Private: Only proof existence shown
/// 1 = Amount: Threshold amount disclosed  
/// 2 = Full: All details disclosed (user choice)
pub mod DisclosureLevel {
    pub const PRIVATE: u8 = 0;
    pub const AMOUNT: u8 = 1;
    pub const FULL: u8 = 2;
}

/// Privacy-preserving proof with Pedersen commitment
/// The commitment hides: secret, amount, recipient, nonce
/// Only the commitment hash is stored on-chain
#[derive(Drop, Serde, Copy, starknet::Store)]
pub struct PrivatePaymentProof {
    /// Unique proof ID
    pub id: felt252,
    /// Pedersen commitment: H(secret || amount || recipient || nonce)
    /// This cryptographically hides all transaction details
    pub commitment: felt252,
    /// Optional: publicly disclosed minimum amount threshold
    /// Users can prove "I paid at least X" without revealing exact amount
    pub min_amount_threshold: u64,
    /// Disclosure level (0=private, 1=amount, 2=full)
    pub disclosure_level: u8,
    /// Timestamp when proof was created
    pub created_at: u64,
    /// Creator address (proving party)
    pub creator: ContractAddress,
    /// Whether the commitment has been verified
    pub is_verified: bool,
}

/// Input for creating a private proof
/// The commitment is computed OFF-CHAIN by the client
/// The secret and nonce NEVER leave the user's device
#[derive(Drop, Serde)]
pub struct PrivateProofInput {
    /// The Pedersen commitment (computed off-chain)
    pub commitment: felt252,
    /// Optional disclosed minimum amount threshold
    pub min_amount_threshold: u64,
    /// Disclosure level (0=private, 1=amount, 2=full)
    pub disclosure_level: u8,
}

/// Input for verifying knowledge of commitment preimage
/// Used when a user wants to prove they created a specific proof
/// WITHOUT revealing the actual values to anyone else
#[derive(Drop, Serde)]
pub struct VerificationInput {
    /// The proof ID to verify against
    pub proof_id: felt252,
    /// Secret used in commitment (known only to prover)
    pub secret: felt252,
    /// Actual transaction amount
    pub amount: u64,
    /// Recipient address hash
    pub recipient_hash: felt252,
    /// Random nonce (blinding factor for unlinkability)
    pub nonce: felt252,
}

/// Public verification result (privacy-respecting)
/// Returns only what the disclosure level permits
#[derive(Drop, Serde)]
pub struct VerificationResult {
    /// Whether the proof is valid
    pub is_valid: bool,
    /// Whether amount meets threshold (if disclosed)
    pub meets_threshold: bool,
    /// The disclosure level of this proof
    pub disclosure_level: u8,
}
