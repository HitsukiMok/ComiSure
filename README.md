# 🎨 ComiSure

**Trustless USDC escrow for freelance digital art commissions on the Stellar Network.**

ComiSure replaces informal, trust-based payment channels with a decentralized Soroban smart contract. Protect yourself from chargeback scams and ghost artists using instant, on-chain settlements.

> **Note**: The deployed front-end is currently for prototype design purposes, utilizing the `StellarWalletsKit` to seamlessly support various wallets on the network. The Soroban smart contract API underneath is fully functional! Feel free to interact with it via the CLI or the local dashboard.

---

## 🏗️ Platform Architecture

ComiSure is built as a complete Web3 application:

- **Frontend (React + Vite + TailwindCSS 3.4)**: A highly-aesthetic, cyberpunk-themed web app featuring dynamic framer-motion animations. It uses `@creit-tech/stellar-wallets-kit` to connect user wallets seamlessly directly to the Stellar network.
- **Backend (Python FastAPI + SQLite)**: An off-chain data layer managing milestones, artist uploads, and caching dispute claims for the Admin dashboard.
- **Smart Contract (Soroban/Rust)**: The immutable escrow layer that natively locks and routes USDC upon approval or dispute resolution.

---

## 🎯 The Problem & Solution

Freelance digital artists and clients in the Philippines face rampant fraud on informal channels (PayPal chargebacks, disappearing GCash commissions).

**The ComiSure Escrow Flow:**
1. **Deposit**: The client deposits USDC into the Soroban contract. The funds are locked on-chain.
2. **Deliver**: The artist tracks milestones and delivers the finished artwork.
3. **Approve**: The client clicks `approve_release` on the UI. The smart contract instantly routes USDC to the artist.
4. **Dispute**: If the artist ghosts, the admin triggers `admin_refund`. If the client unfairly withholds approval, the admin triggers `admin_force_release`.

### Stellar Features Used
* **Soroban Smart Contracts**: Unbreakable escrow state machine.
* **Stellar USDC (SAC)**: Stable digital asset avoiding crypto price volatility.
* **Stellar Wallets Kit**: Universal wallet connection (Freighter, xBull, etc.)

---

## 🏆 For Certification Pre-Requisites

* **GitHub Repo**: [HitsukiMok/ComiSure](https://github.com/HitsukiMok/ComiSure)
* **Contract ID**: `CAWAKGBTHWFMTB6O74CDJ5WOVLLFZ5WMKTBKOP2FNB5BUMTQPZYQZN3J`
* **Stellar Expert**: [View Deployment Transaction on Testnet](https://stellar.expert/explorer/testnet/tx/50c59d6976fbae99ec5c0727669782b3c5fc5b2a43527b1684093dfde78f7e69)


<img width="1843" height="725" alt="image" src="https://github.com/user-attachments/assets/879ea1ec-4480-46d8-99cb-5b53678c8d01" />


---

## 🚀 Running the Web App Locally

Before running the application, ensure you have [Node.js](https://nodejs.org/) and [Python 3](https://python.org/) installed.

### 1. Fast API Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Use `source venv/bin/activate` on Mac/Linux
pip install fastapi uvicorn sqlmodel
uvicorn main:app --reload
```
*The API will run at http://127.0.0.1:8000.*

### 2. React Frontend
```bash
cd frontend
npm install
npm run dev
```
*The web app will run at http://localhost:5173. You must have the [Freighter browser extension](https://www.freighter.app/) installed to connect your wallet!*

---

## ⚙️ Smart Contract Development

> **📖 Note:** For a comprehensive breakdown of the smart contract's internal logic, data structures, and function signatures, please refer to the [Smart Contract API Documentation](SMART_CONTRACT_API.md).

### Prerequisites
* Rust toolchain target `wasm32v1-none`
* Stellar CLI `22.0.0+`

### Build & Test
```bash
# Compile the contract to an optimised Wasm binary
stellar contract build

# Run cargo tests
cargo test
```

### CLI Invocations
If you wish to interact with the contract manually via the CLI:
```bash
# Initialize
stellar contract invoke --id $CONTRACT_ID --source alice --network testnet -- initialize --client <CLIENT_PUB> --artist <ARTIST_PUB> --admin <ADMIN_PUB> --token <USDC_CONTRACT>

# Deposit 500 USDC (7 Decimals)
stellar contract invoke --id $CONTRACT_ID --source client --network testnet -- deposit_funds --caller <CLIENT_PUB> --amount 5000000000

# Approve Release
stellar contract invoke --id $CONTRACT_ID --source client --network testnet -- approve_release --caller <CLIENT_PUB>
```

---

## 📂 Project Structure

```text
ComiSure/
├── frontend/           # React + Vite application & Wallet SDK integration
├── backend/            # FastAPI off-chain dispute & milestone tracker
├── Cargo.toml          # Soroban package dependencies
└── src/
    ├── lib.rs          # Soroban Escrow Smart Contract code
    └── test.rs         # Local testings for happy path & unauthorized calls
```

---


## License

MIT License

Copyright (c) 2025 ComiSure Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions
