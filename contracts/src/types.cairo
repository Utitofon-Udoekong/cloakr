/// Payment proof struct containing verified payment details
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
    pub creator: starknet::ContractAddress,
    /// Whether the proof is verified
    pub is_verified: bool,
}

/// Proof creation input
#[derive(Drop, Serde)]
pub struct ProofInput {
    pub source_txid: felt252,
    pub min_amount: u64,
    pub recipient_hash: felt252,
}
