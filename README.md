<img width="1722" height="850" alt="Main index" src="https://github.com/user-attachments/assets/763266e6-7c2d-4ba7-b424-42f31b96baf9" />


# 🎨 ComiSure

**Trustless USDC escrow for freelance digital art commissions on the Stellar Network.**

ComiSure replaces informal, trust-based payment channels with a decentralized Soroban smart contract. Protect yourself from chargeback scams and ghost artists using instant, on-chain settlements.

  * **GitHub Repo**: [HitsukiMok/ComiSure](https://github.com/HitsukiMok/ComiSure)
  * **Contract Factory ID**: `CAWAKGBTHWFMTB6O74CDJ5WOVLLFZ5WMKTBKOP2FNB5BUMTQPZYQZN3J`
  * **Stellar Expert Factory Log**: [View Deployment Transaction on Testnet](https://stellar.expert/explorer/testnet/tx/50c59d6976fbae99ec5c0727669782b3c5fc5b2a43527b1684093dfde78f7e69)

<img width="1849" height="721" alt="image" src="https://github.com/user-attachments/assets/2f2e542b-348c-45ad-890d-d98d030b5f09" />


-----

## 📖 Project Description

Freelance digital artists and their clients face rampant fraud. Artists suffer severe income loss from malicious PayPal chargebacks after delivering unwatermarked artwork, while clients risk sending upfront e-wallet payments (like Paypal) to "artists" who ghost them.

**ComiSure** is a decentralized web application that acts as a trustless escrow middleman. Clients initiate a commission by depositing USDC into a custom Soroban smart contract. The funds are securely locked on-chain, proving to the artist that the money is guaranteed. Once the artist delivers the final piece, the client approves the release, and the funds are instantly routed to the artist's wallet. By utilizing the Stellar network, ComiSure leverages 5-second settlement times and sub-cent transaction fees, making smart contract escrows economically viable even for small, everyday art commissions (₱500 - ₱5,000).

-----

## ✨ Core Features

  * **Trustless USDC Escrow:** Lock commission funds upfront in a stablecoin, protecting both parties from crypto volatility and payment fraud.
  * **Client-Driven Approval:** Funds are only released to the artist when the client reviews and approves the final delivered artwork.
  * **Admin Dispute Resolution:** A built-in fallback mechanism. If a client maliciously withholds approval after delivery, or if an artist fails to deliver, the platform Admin can step in to force-release or refund the USDC.
  * **Dynamic Contract Generation:** Every single commission gets its own physically isolated Soroban smart contract generated on the fly, preventing centralized contract bottlenecks.
  * **Micro-transaction Optimized:** Powered by Stellar, ensuring gas fees do not eat into the artist's hard-earned commission profits.

-----

## 🔗 Deployed Contract Details

  * **Network:** Stellar Testnet
  * **Smart Contract Environment:** Soroban
  * **Deployed Factory Contract ID:** `CAWAKGBTHWFMTB6O74CDJ5WOVLLFZ5WMKTBKOP2FNB5BUMTQPZYQZN3J`
  * **Supported Asset:** USDC (Stellar Asset Contract)

-----

## 🖥️ UI / Screenshots

### Home Interface
<img width="1722" height="850" alt="Main index" src="https://github.com/user-attachments/assets/763266e6-7c2d-4ba7-b424-42f31b96baf9" />


### Wallet Connect using Stellar Wallet Kit
<img width="618" height="597" alt="Wallet Connect" src="https://github.com/user-attachments/assets/2b936ef4-df84-4105-8066-ce1a67ca7ff3" />


### Client Dashboard (Contains contracts from artists)
<img width="1718" height="811" alt="Client Dashboard" src="https://github.com/user-attachments/assets/9f3dab71-b661-40e8-93f5-6dc4b70f3fe7" />


### Client Creating New Contract
<img width="1219" height="851" alt="New Contract" src="https://github.com/user-attachments/assets/d09a28c8-9377-4727-b969-98eca0e8ebfb" />


### Contract Preview
<img width="1016" height="688" alt="Contract Preview" src="https://github.com/user-attachments/assets/051cfea8-5417-4e02-b219-37625595466f" />

> The client has to confirm the deposit first for the set amount of USDC they specified and would be able to approve the release of funds if the artist delivered the commission.
> Just in case a dispute happened, the admin with the admin wallet would be able to interfere by refunding/releasing the funds depending on the case.


### Transactions Status Preview
<img width="1399" height="777" alt="Successful" src="https://github.com/user-attachments/assets/818081db-5f48-492f-a154-78da78844a5a" />


<img width="999" height="587" alt="Refunded" src="https://github.com/user-attachments/assets/133a78c8-8863-4b63-ab4d-a789ea807201" />

-----

## 🚀 True Dynamic Pipeline Structure

Unlike traditional DApps that rely on a single, massive monolithic smart contract to track all users, ComiSure creates a **unique, physically isolated Smart Contract for every single commission.**

1.  **Frontend Request:** The UI requests a new Escrow.
2.  **Backend Engine:** The FastAPI server connects to the Stellar CLI natively.
3.  **On-the-fly Compilation:** The backend drops a pre-compiled `comi_sure.wasm` bytecode payload directly onto the Stellar Network.
4.  **Initialization:** The backend initializes the contract exclusively with the specific Client and Artist addresses, mapping itself as the irrevocable `admin`.

-----

## 🛠 Tech Stack

  - **Smart Contract Level:** Soroban SDK (Rust), `wasm32-unknown-unknown`
  - **Backend API Layer:** Python 3, FastAPI, SQLModel, Uvicorn
  - **Frontend App:** Frontend React 18, Vite, Tailwind CSS, Framer Motion
  - **Stellar SDK:** `@stellar/stellar-sdk`, `@creit-tech/stellar-wallets-kit`

-----

## ☁️ Deployment Architecture (Vercel + Railway)

Because of the dynamic compilation pipeline, ComiSure requires a specialized deployment setup.

### 1\. Frontend (Deploy to Vercel)

The React Frontend is extremely portable and optimized for **Vercel**.
Ensure your Vercel Project points the *Root Directory* to `frontend/`.

**Required Vercel Environment Variables:**

  - `VITE_SOROBAN_RPC`: `https://soroban-testnet.stellar.org`
  - `VITE_API_URL`: `<YOUR_RAILWAY_URL>` (e.g., `https://comisure-backend.up.railway.app`)

### 2\. Backend (Deploy to Railway)

The strict requirement for the **Stellar CLI** and persistent database connections makes **Railway** the best host for the Python layer.

1.  Create a new service on Railway.app.
2.  Link this GitHub repo and set the **Root Directory** to `/backend`.
3.  Railway will instantly detect our custom `Dockerfile` and install the Linux Stellar CLI implicitly\!

**Required Railway Environment Variables:**

  - `DATABASE_URL`: Let Railway auto-provision a PostgreSQL database, or leave blank to fall back to a volatile SQLite file.
  - `DEPLOYER_SECRET_KEY`: `S...` The Secret Key that funds gas fees for dynamically spinning up Escrows. This will be automatically injected into the Railway environment on boot\!

-----

## 🏃 Local Development Quickstart

If you are running the system locally for development, run both services side-by-side:

### 1\. Fast API Backend

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Use `source venv/bin/activate` on Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload
```

*The API will run at [http://127.0.0.1:8000](http://127.0.0.1:8000).*

### 2\. React Frontend

```bash
cd frontend
npm install
npm run dev
```

*The web app will run at http://localhost:5173. You must have the [Freighter browser extension](https://www.freighter.app/) installed to connect your wallet\!*

-----

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

-----

## License

MIT License

Copyright (c) 2026 ComiSure Contributors
