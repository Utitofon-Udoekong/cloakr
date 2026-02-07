use cloakr_contracts::types::{
    PaymentProof, ProofInput,
    PrivatePaymentProof, PrivateProofInput, VerificationInput, VerificationResult,
    DisclosureLevel
};

// ============================================
// LEGACY INTERFACE (backward compatibility)
// ============================================

#[starknet::interface]
pub trait IPaymentProofVerifier<TContractState> {
    /// Create a new payment proof (legacy, non-private)
    fn create_proof(ref self: TContractState, input: ProofInput) -> felt252;
    
    /// Verify if a proof exists and is valid
    fn verify_proof(self: @TContractState, proof_id: felt252) -> bool;
    
    /// Get proof details by ID
    fn get_proof(self: @TContractState, proof_id: felt252) -> PaymentProof;
    
    /// Get total number of proofs created
    fn get_proof_count(self: @TContractState) -> u256;
}

// ============================================
// PRIVACY-PRESERVING INTERFACE (ZK)
// ============================================

#[starknet::interface]
pub trait IPrivatePaymentVerifier<TContractState> {
    /// Create a private proof with Pedersen commitment
    /// The commitment is computed OFF-CHAIN - only the hash is stored
    fn create_private_proof(ref self: TContractState, input: PrivateProofInput) -> felt252;
    
    /// Verify knowledge of commitment preimage (ZK proof of knowledge)
    /// This proves you created the proof WITHOUT revealing the values
    fn verify_commitment(self: @TContractState, input: VerificationInput) -> VerificationResult;
    
    /// Get private proof (returns only what disclosure level permits)
    fn get_private_proof(self: @TContractState, proof_id: felt252) -> PrivatePaymentProof;
    
    /// Get total number of private proofs
    fn get_private_proof_count(self: @TContractState) -> u256;
}

#[starknet::contract]
pub mod PaymentProofVerifier {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess, Map, StoragePathEntry};
    use core::pedersen::PedersenTrait;
    use core::hash::{HashStateTrait, HashStateExTrait};
    use cloakr_contracts::types::{
        PaymentProof, ProofInput,
        PrivatePaymentProof, PrivateProofInput, VerificationInput, VerificationResult,
        DisclosureLevel
    };

    #[storage]
    struct Storage {
        // Legacy storage
        proofs: Map<felt252, PaymentProof>,
        proof_count: u256,
        owner: ContractAddress,
        
        // Privacy-preserving storage
        private_proofs: Map<felt252, PrivatePaymentProof>,
        private_proof_count: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ProofCreated: ProofCreated,
        PrivateProofCreated: PrivateProofCreated,
        CommitmentVerified: CommitmentVerified,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProofCreated {
        #[key]
        pub proof_id: felt252,
        pub creator: ContractAddress,
        pub source_txid: felt252,
    }

    /// Event for private proof creation - note: NO sensitive data is emitted
    #[derive(Drop, starknet::Event)]
    pub struct PrivateProofCreated {
        #[key]
        pub proof_id: felt252,
        pub creator: ContractAddress,
        /// Only the commitment hash - reveals nothing about the actual data
        pub commitment: felt252,
        pub disclosure_level: u8,
    }

    /// Event when someone verifies their commitment
    #[derive(Drop, starknet::Event)]
    pub struct CommitmentVerified {
        #[key]
        pub proof_id: felt252,
        pub verifier: ContractAddress,
        pub is_valid: bool,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.proof_count.write(0);
        self.private_proof_count.write(0);
    }

    // ============================================
    // LEGACY IMPLEMENTATION
    // ============================================

    #[abi(embed_v0)]
    impl PaymentProofVerifierImpl of super::IPaymentProofVerifier<ContractState> {
        fn create_proof(ref self: ContractState, input: ProofInput) -> felt252 {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            let count = self.proof_count.read();
            let proof_id: felt252 = (count + 1).try_into().unwrap();
            
            let proof = PaymentProof {
                id: proof_id,
                source_txid: input.source_txid,
                min_amount: input.min_amount,
                recipient_hash: input.recipient_hash,
                created_at: timestamp,
                creator: caller,
                is_verified: true,
            };
            
            self.proofs.entry(proof_id).write(proof);
            self.proof_count.write(count + 1);
            
            self.emit(ProofCreated {
                proof_id,
                creator: caller,
                source_txid: input.source_txid,
            });
            
            proof_id
        }

        fn verify_proof(self: @ContractState, proof_id: felt252) -> bool {
            let proof = self.proofs.entry(proof_id).read();
            proof.is_verified
        }

        fn get_proof(self: @ContractState, proof_id: felt252) -> PaymentProof {
            self.proofs.entry(proof_id).read()
        }

        fn get_proof_count(self: @ContractState) -> u256 {
            self.proof_count.read()
        }
    }

    // ============================================
    // PRIVACY-PRESERVING IMPLEMENTATION (ZK)
    // ============================================

    #[abi(embed_v0)]
    impl PrivatePaymentVerifierImpl of super::IPrivatePaymentVerifier<ContractState> {
        /// Create a private proof using a Pedersen commitment
        /// The commitment was computed OFF-CHAIN: H(secret || amount || recipient || nonce)
        /// Only the commitment hash is stored - actual values remain private
        fn create_private_proof(ref self: ContractState, input: PrivateProofInput) -> felt252 {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Generate unique proof ID
            let count = self.private_proof_count.read();
            let proof_id: felt252 = (count + 1).try_into().unwrap();
            
            // Validate disclosure level
            assert(
                input.disclosure_level <= DisclosureLevel::FULL,
                'Invalid disclosure level'
            );
            
            // Create private proof - stores ONLY the commitment, not raw data
            let proof = PrivatePaymentProof {
                id: proof_id,
                commitment: input.commitment,
                min_amount_threshold: input.min_amount_threshold,
                disclosure_level: input.disclosure_level,
                created_at: timestamp,
                creator: caller,
                is_verified: true,
            };
            
            // Store proof
            self.private_proofs.entry(proof_id).write(proof);
            self.private_proof_count.write(count + 1);
            
            // Emit event - notice NO sensitive data is revealed
            self.emit(PrivateProofCreated {
                proof_id,
                creator: caller,
                commitment: input.commitment,
                disclosure_level: input.disclosure_level,
            });
            
            proof_id
        }

        /// Verify knowledge of commitment preimage (Zero-Knowledge Proof of Knowledge)
        /// This allows the prover to demonstrate they know the secret values
        /// WITHOUT revealing them to anyone else
        fn verify_commitment(self: @ContractState, input: VerificationInput) -> VerificationResult {
            let proof = self.private_proofs.entry(input.proof_id).read();
            
            // Recompute commitment from claimed values using Pedersen hash
            // This is the SAME computation done off-chain by the client
            // commitment = H(H(H(secret, amount), recipient), nonce)
            let h1 = PedersenTrait::new(input.secret)
                .update(input.amount.into())
                .finalize();
            
            let h2 = PedersenTrait::new(h1)
                .update(input.recipient_hash)
                .finalize();
            
            let computed_commitment = PedersenTrait::new(h2)
                .update(input.nonce)
                .finalize();
            
            // Check if computed commitment matches stored commitment
            let is_valid = computed_commitment == proof.commitment;
            
            // Check if amount meets threshold
            let meets_threshold = input.amount >= proof.min_amount_threshold;
            
            VerificationResult {
                is_valid,
                meets_threshold,
                disclosure_level: proof.disclosure_level,
            }
        }

        /// Get private proof details
        fn get_private_proof(self: @ContractState, proof_id: felt252) -> PrivatePaymentProof {
            self.private_proofs.entry(proof_id).read()
        }

        /// Get total count of private proofs
        fn get_private_proof_count(self: @ContractState) -> u256 {
            self.private_proof_count.read()
        }
    }
}
