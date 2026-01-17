use starknet::ContractAddress;
use starknet::contract_address_const;

use snforge_std::{declare, ContractClassTrait, DeclareResultTrait};

use cloakr_contracts::verifier::IPaymentProofVerifierDispatcher;
use cloakr_contracts::verifier::IPaymentProofVerifierDispatcherTrait;
use cloakr_contracts::types::ProofInput;

fn deploy_verifier() -> ContractAddress {
    let contract = declare("PaymentProofVerifier").unwrap().contract_class();
    let owner: ContractAddress = contract_address_const::<0x123>();
    let mut calldata = ArrayTrait::new();
    calldata.append(owner.into());
    let (contract_address, _) = contract.deploy(@calldata).unwrap();
    contract_address
}

#[test]
fn test_create_proof() {
    let contract_address = deploy_verifier();
    let dispatcher = IPaymentProofVerifierDispatcher { contract_address };
    
    // Create a proof
    let input = ProofInput {
        btc_txid: 'test_txid_12345',
        min_amount: 100000, // 0.001 BTC in satoshis
        recipient_hash: 'recipient_abc',
    };
    
    let proof_id = dispatcher.create_proof(input);
    
    // Should return proof ID 1 for first proof
    assert(proof_id == 1, 'Wrong proof ID');
    
    // Proof count should be 1
    let count = dispatcher.get_proof_count();
    assert(count == 1, 'Wrong proof count');
}

#[test]
fn test_verify_proof() {
    let contract_address = deploy_verifier();
    let dispatcher = IPaymentProofVerifierDispatcher { contract_address };
    
    // Create a proof first
    let input = ProofInput {
        btc_txid: 'verify_test_tx',
        min_amount: 50000,
        recipient_hash: 'recipient_xyz',
    };
    
    let proof_id = dispatcher.create_proof(input);
    
    // Verify the proof exists
    let is_verified = dispatcher.verify_proof(proof_id);
    assert(is_verified == true, 'Proof should be verified');
    
    // Non-existent proof should not be verified
    let fake_verified = dispatcher.verify_proof(999);
    assert(fake_verified == false, 'Fake proof should not verify');
}

#[test]
fn test_get_proof() {
    let contract_address = deploy_verifier();
    let dispatcher = IPaymentProofVerifierDispatcher { contract_address };
    
    // Create a proof
    let input = ProofInput {
        btc_txid: 'get_proof_tx',
        min_amount: 200000,
        recipient_hash: 'recipient_get',
    };
    
    let proof_id = dispatcher.create_proof(input);
    
    // Get the proof
    let proof = dispatcher.get_proof(proof_id);
    
    // Verify proof details
    assert(proof.id == proof_id, 'Wrong proof ID');
    assert(proof.btc_txid == 'get_proof_tx', 'Wrong txid');
    assert(proof.min_amount == 200000, 'Wrong amount');
    assert(proof.recipient_hash == 'recipient_get', 'Wrong recipient');
    assert(proof.is_verified == true, 'Should be verified');
}

#[test]
fn test_multiple_proofs() {
    let contract_address = deploy_verifier();
    let dispatcher = IPaymentProofVerifierDispatcher { contract_address };
    
    // Create multiple proofs
    let input1 = ProofInput {
        btc_txid: 'multi_tx_1',
        min_amount: 100000,
        recipient_hash: 'recipient_1',
    };
    
    let input2 = ProofInput {
        btc_txid: 'multi_tx_2',
        min_amount: 200000,
        recipient_hash: 'recipient_2',
    };
    
    let input3 = ProofInput {
        btc_txid: 'multi_tx_3',
        min_amount: 300000,
        recipient_hash: 'recipient_3',
    };
    
    let id1 = dispatcher.create_proof(input1);
    let id2 = dispatcher.create_proof(input2);
    let id3 = dispatcher.create_proof(input3);
    
    // Check IDs are sequential
    assert(id1 == 1, 'First ID should be 1');
    assert(id2 == 2, 'Second ID should be 2');
    assert(id3 == 3, 'Third ID should be 3');
    
    // Check count
    let count = dispatcher.get_proof_count();
    assert(count == 3, 'Should have 3 proofs');
    
    // Verify each proof has correct data
    let proof1 = dispatcher.get_proof(id1);
    let proof2 = dispatcher.get_proof(id2);
    let proof3 = dispatcher.get_proof(id3);
    
    assert(proof1.min_amount == 100000, 'Wrong amount for proof 1');
    assert(proof2.min_amount == 200000, 'Wrong amount for proof 2');
    assert(proof3.min_amount == 300000, 'Wrong amount for proof 3');
}
