use cloakr_contracts::types::{PaymentProof, ProofInput};

#[starknet::interface]
pub trait IPaymentProofVerifier<TContractState> {
    /// Create a new payment proof
    fn create_proof(ref self: TContractState, input: ProofInput) -> felt252;
    
    /// Verify if a proof exists and is valid
    fn verify_proof(self: @TContractState, proof_id: felt252) -> bool;
    
    /// Get proof details by ID
    fn get_proof(self: @TContractState, proof_id: felt252) -> PaymentProof;
    
    /// Get total number of proofs created
    fn get_proof_count(self: @TContractState) -> u256;
}

#[starknet::contract]
pub mod PaymentProofVerifier {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess, Map, StoragePathEntry};
    use cloakr_contracts::types::{PaymentProof, ProofInput};

    #[storage]
    struct Storage {
        /// Mapping from proof ID to PaymentProof
        proofs: Map<felt252, PaymentProof>,
        /// Total number of proofs created
        proof_count: u256,
        /// Contract owner
        owner: ContractAddress,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        ProofCreated: ProofCreated,
    }

    #[derive(Drop, starknet::Event)]
    pub struct ProofCreated {
        #[key]
        pub proof_id: felt252,
        pub creator: ContractAddress,
        pub btc_txid: felt252,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
        self.proof_count.write(0);
    }

    #[abi(embed_v0)]
    impl PaymentProofVerifierImpl of super::IPaymentProofVerifier<ContractState> {
        /// Create a new payment proof
        fn create_proof(ref self: ContractState, input: ProofInput) -> felt252 {
            let caller = get_caller_address();
            let timestamp = get_block_timestamp();
            
            // Generate proof ID from count
            let count = self.proof_count.read();
            let proof_id: felt252 = (count + 1).try_into().unwrap();
            
            // Create proof
            let proof = PaymentProof {
                id: proof_id,
                btc_txid: input.btc_txid,
                min_amount: input.min_amount,
                recipient_hash: input.recipient_hash,
                created_at: timestamp,
                creator: caller,
                is_verified: true,
            };
            
            // Store proof
            self.proofs.entry(proof_id).write(proof);
            self.proof_count.write(count + 1);
            
            // Emit event
            self.emit(ProofCreated {
                proof_id,
                creator: caller,
                btc_txid: input.btc_txid,
            });
            
            proof_id
        }

        /// Verify if a proof exists and is valid
        fn verify_proof(self: @ContractState, proof_id: felt252) -> bool {
            let proof = self.proofs.entry(proof_id).read();
            proof.is_verified
        }

        /// Get proof details by ID
        fn get_proof(self: @ContractState, proof_id: felt252) -> PaymentProof {
            self.proofs.entry(proof_id).read()
        }

        /// Get total number of proofs created
        fn get_proof_count(self: @ContractState) -> u256 {
            self.proof_count.read()
        }
    }
}
