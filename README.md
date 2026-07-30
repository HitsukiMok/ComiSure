<img width="1836" height="860" alt="image" src="https://github.com/user-attachments/assets/6dd90681-8b01-4ae9-b313-4f96618d81ad" />


# ComiSure

**Trustless USDC escrow for freelance digital art commissions on the Stellar Network.**

ComiSure replaces informal, trust-based payment channels with a decentralized Soroban smart contract. It protects clients and artists from chargeback scams and ghost deliveries through instant, on-chain settlements.

* **GitHub Repo**: [HitsukiMok/ComiSure](https://github.com/HitsukiMok/ComiSure)
* **Contract Factory ID**: `CAWAKGBTHWFMTB6O74CDJ5WOVLLFZ5WMKTBKOP2FNB5BUMTQPZYQZN3J`
* **Stellar Expert Factory Log**: [View Deployment Transaction on Testnet](https://stellar.expert/explorer/testnet/tx/50c59d6976fbae99ec5c0727669782b3c5fc5b2a43527b1684093dfde78f7e69)

<img width="1849" height="721" alt="image" src="https://github.com/user-attachments/assets/2f2e542b-348c-45ad-890d-d98d030b5f09" />

---

## Navigation
* [Project Demo Video](#project-demo-video)
* [Project Description](#project-description)
* [Core Features](#core-features)
* [Deployed Contract Details](#deployed-contract-details)
* [UI / Screenshots](#ui--screenshots)
* [True Dynamic Pipeline Structure](#true-dynamic-pipeline-structure)
* [Tech Stack](#tech-stack)
* [Deployment Architecture (Vercel + Render)](#deployment-architecture-vercel--render)
* [Local Development Quickstart](#local-development-quickstart)
* [Deadline and Auto-Refund](#deadline-and-auto-refund)
* [Smart Contract Development](#smart-contract-development)
* [Project Structure](#project-structure)
* [Users Feedback](#users-feedback)

---

## Project Demo Video

[![ComiSure Project Demo](https://img.shields.io/badge/YouTube-Demo%20Video-red?style=for-the-badge&logo=youtube)](https://youtu.be/cd4Rz2XygKg)

Click the badge above or navigate to the following link to view the live system walkthrough and features demonstration:
**[Watch the ComiSure Demo Video on YouTube](https://youtu.be/cd4Rz2XygKg)**

---

## Project Description

Freelance digital artists and their clients face rampant fraud. Artists suffer severe income loss from malicious PayPal chargebacks after they deliver unwatermarked artwork. Clients risk sending upfront e-wallet payments to artists who disappear without delivering.

ComiSure is a decentralized web application that acts as a trustless escrow middleman. Clients initiate a commission by depositing USDC into a custom Soroban smart contract. The funds lock on-chain. This proves to the artist that the money is guaranteed. Once the artist delivers the final piece, the client approves the release. The funds then route instantly to the artist wallet. The Stellar network provides 5-second settlement times and sub-cent transaction fees. This makes smart contract escrows economically viable even for small, everyday art commissions.

-----

## Core Features

* **Trustless USDC Escrow:** Lock commission funds upfront in a stablecoin. This protects both parties from crypto volatility and payment fraud.
* **Client-Driven Approval:** Funds release to the artist only when the client reviews and approves the final delivered artwork.
* **Deadline and Auto-Refund:** Each commission has a configurable deadline (1 to 90 days). If the artist does not deliver before the deadline, the client can self-refund directly from the smart contract without admin intervention.
* **Admin Dispute Resolution:** A built-in fallback mechanism. If a client maliciously withholds approval after delivery, or if an artist fails to deliver, the platform admin can force-release or refund the USDC.
* **Dynamic Contract Generation:** Every commission gets its own physically isolated Soroban smart contract. The backend generates each contract on the fly. This prevents centralized contract bottlenecks.
* **Micro-transaction Optimized:** Stellar ensures gas fees do not eat into the artist commission profits.

-----

## Deployed Contract Details

* **Network:** Stellar Testnet
* **Smart Contract Environment:** Soroban
* **Deployed Factory Contract ID:** `CAWAKGBTHWFMTB6O74CDJ5WOVLLFZ5WMKTBKOP2FNB5BUMTQPZYQZN3J`
* **Supported Asset:** USDC (Stellar Asset Contract)

-----

## UI / Screenshots

### Home Interface
<img width="1836" height="860" alt="Landing Page" src="https://github.com/user-attachments/assets/6fbbba0d-7689-4ce3-9b5e-7d5b40965340" />



### Wallet Connect using Stellar Wallet Kit
<img width="1846" height="874" alt="Stellar Wallet Kit" src="https://github.com/user-attachments/assets/3b619773-ad49-48dd-9269-29b295957f4b" />



### Client Dashboard (Contains contracts from artists)
<img width="1844" height="869" alt="Dashboard" src="https://github.com/user-attachments/assets/f0d17e7f-afca-48a1-88b0-414bb1fdad03" />


### Client Creating New Contract
<img width="1825" height="875" alt="New Contract" src="https://github.com/user-attachments/assets/e70ec72d-7699-40b6-9497-6f2d051629df" />



### Contract Preview
<img width="1845" height="876" alt="Contract" src="https://github.com/user-attachments/assets/91d6609a-a424-48dd-9118-3c02f24bc13b" />


> The client confirms the deposit first for the set amount of USDC. The client can then approve the release of funds after the artist delivers the commission. If a dispute happens, the admin with the admin wallet can interfere by refunding or releasing the funds depending on the case.


### Transactions Status Preview
<img width="1837" height="800" alt="Successful" src="https://github.com/user-attachments/assets/250f3ac6-90c9-4b5e-be20-dee2b9df02dd" />


-----

## True Dynamic Pipeline Structure

Unlike traditional DApps that rely on a single monolithic smart contract to track all users, ComiSure creates a unique, physically isolated smart contract for every commission.

1. **Frontend Request:** The UI requests a new escrow.
2. **Backend Engine:** The FastAPI server connects to the Stellar CLI natively.
3. **On-the-fly Deployment:** The backend deploys a pre-compiled `comi_sure.wasm` bytecode payload directly onto the Stellar Network.
4. **Initialization:** The backend initializes the contract exclusively with the specific client and artist addresses, the deadline timestamp, and maps itself as the irrevocable admin.

-----

## Tech Stack

* **Smart Contract Level:** Soroban SDK (Rust), `wasm32v1-none`
* **Backend API Layer:** Python 3, FastAPI, SQLModel, Uvicorn, PostgreSQL
* **Frontend App:** React 19, Vite, Tailwind CSS, Framer Motion
* **Stellar SDK:** `@stellar/stellar-sdk`, `@creit-tech/stellar-wallets-kit`
* **Analytics:** Vercel Analytics


---

## Deployment Architecture (Vercel + Render)

ComiSure requires a specialized cloud infrastructure split between edge hosting and persistent container engines because of the dynamic compilation pipeline and state persistence.

### 1. Frontend (Deployed to Vercel)

The React frontend is lightweight, portable, and optimized for static hosting environments like Vercel. Set the Vercel project root directory to `frontend/`.

**Required Vercel Environment Variables:**
* `VITE_SOROBAN_RPC`: `https://soroban-testnet.stellar.org`
* `VITE_API_URL`: `<YOUR_RENDER_WEB_SERVICE_URL>` (e.g., `https://comisure-backend.onrender.com`)

### 2. Backend and Database (Deployed to Render)

The Stellar CLI requirement, background system processes, and persistent data storage are handled via Render.

#### A. Database Layer (PostgreSQL via Supabase or Render)
1. Create a PostgreSQL instance on Supabase (free tier) or Render.
2. Copy the connection string (use the pooler URL for Supabase if connecting from Render).

#### B. API Layer (Render Web Service)
1. Create a new web service on Render and link this GitHub repository.
2. Set the root directory to `backend/`.
3. Configure the environment to use the custom `Dockerfile`. Render builds the container from it and installs the Linux Stellar CLI automatically.

**Required Render Environment Variables:**
* `DATABASE_URL`: Your PostgreSQL connection string.
* `DEPLOYER_SECRET_KEY`: Your deployer identity for signing contract deployments. This can be a raw Stellar secret seed (`S...`) or a 24-word Stellar seed phrase.

---

## Local Development Quickstart

Run both services side-by-side for local development.

### 1. FastAPI Backend

1. Navigate to the backend directory and set up a virtual environment:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Use `source venv/bin/activate` on Mac/Linux
pip install -r requirements.txt
```

2. Run a local Redis server for rate limiting (optional; if not running, the backend falls back to in-memory tracking):
   - **Docker:** `docker run --name comisure-redis -p 6379:6379 -d redis`
   - **macOS (Homebrew):** `brew install redis && brew services start redis`
   - **Ubuntu/Debian:** `sudo apt update && sudo apt install redis-server && sudo service redis-server start`

3. Encrypt your Stellar deployer secret key for the environment:
```bash
python scripts/encrypt_secret.py
```
Copy the output base64 string to your `.env` as `DEPLOYER_SECRET_KEY_ENCRYPTED_v1` and set `DEPLOYER_DECRYPTION_PASSPHRASE`.

4. Start the backend:
```bash
uvicorn main:app --reload
```
The API runs at http://127.0.0.1:8000.

### 2. React Frontend

```bash
cd frontend
npm install
npm run dev
```
The web app runs at http://localhost:5173. You must have the [Freighter browser extension](https://www.freighter.app/) installed to connect your wallet.

---

## Deadline and Auto-Refund

Each commission includes a configurable deadline. The client sets the deadline (1 to 90 days) when they create a commission. The smart contract stores the deadline as a Unix timestamp.

### How It Works

1. The client creates a commission and sets the deadline (default: 14 days).
2. The backend computes the deadline as a Unix timestamp and passes it to the smart contract during initialization.
3. The smart contract stores the deadline immutably.
4. If the artist does not deliver before the deadline, the client calls `client_refund_expired` directly on-chain.
5. The contract verifies that the current ledger timestamp exceeds the stored deadline.
6. If expired, the contract returns the full locked USDC to the client.

### Key Properties

* The deadline does not block `approve_release`. The client can still release funds after the deadline passes if the artist delivers late.
* Admin actions (`admin_refund`, `admin_force_release`) are not gated by the deadline. The admin can act at any time.
* The deadline is immutable after contract initialization. Neither party can change it.
* The frontend displays a circular countdown timer (Orbit Timer) that visually depletes as time passes.

---

## Smart Contract Development

> For a comprehensive breakdown of the smart contract internal logic, data structures, and function signatures, refer to the [smart contract documentation](contract/SMART_CONTRACT_API.md).

### Prerequisites

- Rust toolchain with target `wasm32v1-none`
- Stellar CLI 22.0.0 or later

### Build and Test

```bash
# Compile the contract to an optimized Wasm binary
stellar contract build

# Run cargo tests (7 tests: 3 core + 4 deadline)
cargo test
```

---

## Project Structure

```text
ComiSure/
├── frontend/            # React + Vite application and Wallet SDK integration
├── backend/             # Python FastAPI dynamic deployer and PostgreSQL tracker
├── Cargo.toml           # Soroban package dependencies
└── contract/
    ├── lib.rs           # Soroban Escrow Smart Contract code
    └── test.rs          # Tests for happy path, unauthorized calls, and deadline
```

---

## Users Feedback

We collected feedback from real users who tested the platform. Below are screenshots of user responses.

<img width="1861" height="802" alt="image" src="https://github.com/user-attachments/assets/1f37de52-e362-469e-9517-dc404144fa0a" />

[Submit your feedback via our Google Form](https://forms.gle/4f5tieNnnre5tjmR8)

### User Feedback as of July 30, 2026:

ComiSure received positive user feedback across all metrics. The platform scores above 4.0 in 6 of 7 categories. Visual design and ease of use are the strongest areas (4.7 and 4.6 respectively). The core value proposition — trustless escrow for art commissions — resonates clearly with users, reflected in the 4.5 trust score.


The primary gap is **process clarity** (3.9/5). Users understand the concept but struggle with the step-by-step execution. This is solvable through better onboarding copy, in-app tooltips, and a guided first-commission flow.


For a testnet MVP, these results demonstrate strong product-market fit with the target audience (Filipino freelance artists and their clients). The platform is technically sound, visually polished, and functionally complete. The recommended next steps are: improve onboarding clarity, differentiate the artist dashboard, and fix the timezone offset in the deadline timer.
