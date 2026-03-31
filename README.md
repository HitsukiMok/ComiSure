# 🎨 ComiSure

**Trustless USDC escrow for freelance digital art commissions on the Stellar Network.**

ComiSure replaces informal, trust-based payment channels with a decentralized Soroban smart contract. Protect yourself from chargeback scams and ghost artists using instant, on-chain settlements.

* **GitHub Repo**: [HitsukiMok/ComiSure](https://github.com/HitsukiMok/ComiSure)
* **Contract Factory ID**: `CAWAKGBTHWFMTB6O74CDJ5WOVLLFZ5WMKTBKOP2FNB5BUMTQPZYQZN3J`
* **Stellar Expert Factory Log**: [View Deployment Transaction on Testnet](https://stellar.expert/explorer/testnet/tx/50c59d6976fbae99ec5c0727669782b3c5fc5b2a43527b1684093dfde78f7e69)

<img width="1843" height="725" alt="image" src="https://github.com/user-attachments/assets/879ea1ec-4480-46d8-99cb-5b53678c8d01" />

---

## 🚀 True Dynamic Pipeline Structure

Unlike traditional DApps that rely on a single, massive monolithic smart contract to track all users, ComiSure creates a **unique, physically isolated Smart Contract for every single commission.**

1. **Frontend Request:** The UI requests a new Escrow.
2. **Backend Engine:** The FastAPI server connects to the Stellar CLI natively.
3. **On-the-fly Compilation:** The backend drops a pre-compiled `comi_sure.wasm` bytecode payload directly onto the Stellar Network.
4. **Initialization:** The backend initializes the contract exclusively with the specific Client and Artist addresses, mapping itself as the irrevocable `admin`.

---

## 🛠 Tech Stack

- **Smart Contract Level:** Soroban SDK (Rust), `wasm32-unknown-unknown`
- **Backend API Layer:** Python 3, FastAPI, SQLModel, Uvicorn 
- **Frontend App:** Frontend React 18, Vite, Tailwind CSS, Framer Motion
- **Stellar SDK:** `@stellar/stellar-sdk`, `@creit-tech/stellar-wallets-kit`

---

## ☁️ Deployment Architecture (Vercel + Railway)

Because of the dynamic compilation pipeline, ComiSure requires a specialized deployment setup.

### 1. Frontend (Deploy to Vercel)
The React Frontend is extremely portable and optimized for **Vercel**. 
Ensure your Vercel Project points the *Root Directory* to `frontend/`.

**Required Vercel Environment Variables:**
- `VITE_SOROBAN_RPC`: `https://soroban-testnet.stellar.org`
- `VITE_API_URL`: `<YOUR_RAILWAY_URL>` (e.g., `https://comisure-backend.up.railway.app`)

### 2. Backend (Deploy to Railway)
The strict requirement for the **Stellar CLI** and persistent database connections makes **Railway** the best host for the Python layer. 

1. Create a new service on Railway.app.
2. Link this GitHub repo and set the **Root Directory** to `/backend`.
3. Railway will instantly detect our custom `Dockerfile` and install the Linux Stellar CLI implicitly!

**Required Railway Environment Variables:**
- `DATABASE_URL`: Let Railway auto-provision a PostgreSQL database, or leave blank to fall back to a volatile SQLite file.
- `DEPLOYER_SECRET_KEY`: `S...` The Secret Key that funds gas fees for dynamically spinning up Escrows. This will be automatically injected into the Railway environment on boot!

---

## 🏃 Local Development Quickstart

If you are running the system locally for development, run both services side-by-side:

### 1. Fast API Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Use `source venv/bin/activate` on Mac/Linux
pip install -r requirements.txt
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

> **📖 Note:** For a comprehensive breakdown of the smart contract's internal logic, data structures, and function signatures, please refer to the `SMART_CONTRACT_API.md`.

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

## 📂 Project Structure

```text
ComiSure/
├── frontend/           # React + Vite application & Wallet SDK integration
├── backend/            # Python FastAPI dynamic deployer & SQLite tracker
├── Cargo.toml          # Soroban package dependencies
└── src/
    ├── lib.rs          # Soroban Escrow Smart Contract code
    └── test.rs         # Local testings for happy path & unauthorized calls
```

---

## License

MIT License

Copyright (c) 2025 ComiSure Contributors
