# Cloakr

> **Trustless, Privacy-Preserving Payment Verification on Starknet.**

**Cloakr** bridges public blockchains (Ethereum, Bitcoin, Solana) to **Starknet** to generate cryptographic proofs of payment **without revealing sensitive details** like the sender, recipient, or exact amount to the public.

Turn your public transaction hash into a private, verifiable proof using **Pedersen Commitments**.

---

## Key Features

-   **Zero-Knowledge Privacy**: Generate proofs where only the **Commitment Hash** is stored on-chain. Secrets (amount, recipient) never leave your device.
-   **Granular Disclosure**:
    -   **Private**: Prove a payment exists without revealing details.
    -   **Amount**: Prove payment > Threshold (e.g., Rent > 1 ETH) without revealing exact value.
    -   **Full**: Reveal all details to a specific verifier.
-   **My Proofs Dashboard**: Track all your generated proofs on-chain, indexed by your wallet address.
-   **Trustless Verification**: Recipients can verify proofs entirely client-side using the shared link. No server trust required.
-   **Multi-Chain Support**: Works with Ethereum, Bitcoin, Solana, Base, Polygon, and more.

---

## Architecture

Cloakr leverages **Starknet's** cheap computation and **Pedersen Hash** efficiency to create a privacy layer for public chains.

1.  **Frontend**: Next.js 14 (App Router) + Tailwind CSS.
2.  **Cryptography**: Client-side Pedersen Hashing using `@scure/starknet`.
3.  **Smart Contract**: Cairo contract (`PaymentProofVerifier`) deployed on Starknet Sepolia.
    -   **Address**: `0x0354273190dd264af5d545b7312716a0763c0bb9db1ddba2b3403d38e0087568`
4.  **Storage**: Proofs are stored as `Map<Commitment, Metadata>` on Starknet.

---

## Tech Stack

-   **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/)
-   **Blockchain**: [Starknet](https://www.starknet.io/) (Cairo v2.x)
-   **SDKs**: `starknet.js` v9, `@scure/starknet`
-   **Wallet**: [Ready Wallet](https://www.ready.co/ready-wallet) / [Braavos](https://braavos.app/)

---

## Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18+)
-   Starknet Wallet Extension (Ready Wallet or Braavos)
-   [Scarb](https://docs.swmansion.com/scarb/) (if modifying contracts)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Utitofon-Udoekong/cloakr.git
    cd cloakr
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
    Update the values:
    ```env
    NEXT_PUBLIC_VERIFIER_CONTRACT_ADDRESS=0x0354273190dd264af5d545b7312716a0763c0bb9db1ddba2b3403d38e0087568
    # Optional: Custom RPC URL
    # NEXT_PUBLIC_STARKNET_RPC_URL=...
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## How It Works (Privacy Mode)

1.  **Generate**: You input a transaction hash. Your browser generates a random `Secret` and `Nonce`.
2.  **Commit**: It computes `Hash(Secret, Amount, Recipient, Nonce)`.
3.  **Store**: You send ONLY the hash to Starknet.
4.  **Share**: You send a link to the verifier (e.g., landlord) containing the `Secret` in the URL fragment (`#secret=...`).
5.  **Verify**: The verifier's browser re-computes the hash and checks it against the Starknet contract.

---

## License

This project is licensed under the MIT License.
