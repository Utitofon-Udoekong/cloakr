# Cloakr

**Cloakr** is a privacy-preserving payment verification platform that allows you to generate zero-knowledge (ZK) proofs for blockchain transactions. Prove you've made a payment without ever revealing your wallet address.

## 🚀 Overview

In a world where blockchain transparency is a standard, privacy is often compromised. Cloakr bridges this gap by enabling users to verify their payments privately on Starknet. Our platform supports multiple chains, including Ethereum, Bitcoin, Solana, and various L2s.

### Key Features

- **Multi-Chain Support**: Generate proofs for transactions on ETH, BTC, SOL, Base, Polygon, and more.
- **Privacy-First**: Proofs are generated using zero-knowledge principles on Starknet.
- **Simple Sharing**: Share a unique link with anyone to prove your payment status without compromising your source wallet.

## 🛠️ Architecture

Cloakr consists of:
1. **Frontend**: A Next.js application built with Tailwind CSS.
2. **Contracts**: Cairo-based smart contracts deployed on Starknet Sepolia.
3. **Verification**: A robust verification system that pulls real-time transaction data across multiple networks.

## 💻 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Blockchain**: [Starknet](https://www.starknet.io/) (Cairo)
- **RPC**: [Alchemy](https://www.alchemy.com/)
- **State Management**: React Hooks & Context API

## 🚦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Argent X](https://www.argent.xyz/argent-x/) or [Braavos](https://braavos.app/) Wallet
- [Starknet Foundry](https://github.com/foundry-rs/starknet-foundry) (for contract development)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/cloakr.git
   cd cloakr
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file based on `.env.example`:
   ```bash
   NEXT_PUBLIC_STARKNET_RPC_URL=your_starknet_rpc_url
   NEXT_PUBLIC_VERIFIER_CONTRACT_ADDRESS=your_contract_address
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📄 License

This project is licensed under the MIT License.
