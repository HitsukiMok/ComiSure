# ComiSure — Features Document

**Version:** 1.0  
**Date:** 2025-07-29  
**Status:** Active (Stellar Testnet)

---

## 1. Current Features

This section lists all features that are implemented and operational in the current build.

---

### 1.1 Smart Contract Escrow

| Feature | Description |
|---------|-------------|
| USDC locking | The client deposits USDC into a Soroban smart contract. The funds lock until approval or admin action. |
| Client-driven release | Only the client wallet can approve the release of funds to the artist. |
| Admin refund | The admin can return locked USDC to the client if the artist does not deliver. |
| Admin force-release | The admin can send locked USDC to the artist if the client withholds approval. |
| On-chain state machine | The contract tracks state: Pending, Funded, Released, Refunded. State transitions are enforced. |

---

### 1.2 Dynamic Contract Deployment

| Feature | Description |
|---------|-------------|
| Per-commission isolation | Each commission gets its own physically isolated Soroban smart contract. |
| On-the-fly deployment | The backend deploys a pre-compiled WASM binary to the Stellar network when a commission is created. |
| Automatic initialization | The backend initializes the contract with the client, artist, and admin addresses. |
| Deployer key versioning | The system supports multiple deployer key versions for rotation without downtime. |

---

### 1.3 Wallet-Based Authentication

| Feature | Description |
|---------|-------------|
| Challenge-response login | Users authenticate by signing a cryptographic challenge with their Stellar wallet. |
| Signature verification | The backend verifies signatures against the wallet public key using `stellar_sdk.Keypair.verify()`. |
| JWT token issuance | Successful authentication issues a 24-hour bearer token. |
| Role assignment | Admin wallets get the admin role automatically. Other users select client or artist. |
| Freighter integration | The frontend connects wallets through the Stellar Wallets Kit (Freighter, Albedo, xBull). |

---

### 1.4 Commission Management Dashboard

| Feature | Description |
|---------|-------------|
| Create commission | Clients fill a form with title, description, artist address, and USDC amount. |
| Commission list | Users see all commissions where they are a participant (as client or artist). |
| Escrow viewer | Users can open a commission to see live on-chain state and locked amount. |
| Deposit action | Clients can deposit USDC directly from the dashboard into the smart contract. |
| Approve release | Clients can approve artwork and release funds to the artist from the dashboard. |
| Stellar Expert links | Each contract links to its on-chain record on Stellar Expert explorer. |
| Real-time state refresh | Users can refresh on-chain state without reloading the page. |

---

### 1.5 Admin Portal

| Feature | Description |
|---------|-------------|
| Dispute visibility | Admin can view all active disputes across all commissions. |
| Refund action | Admin can issue on-chain refunds for specific commissions. |
| Force-release action | Admin can force-release funds to the artist on-chain. |
| Role-based access | Only wallets in the `ADMIN_WALLET_ADDRESSES` list can access admin functions. |

---

### 1.6 Dispute System

| Feature | Description |
|---------|-------------|
| Raise dispute | Clients or artists can raise a dispute on any commission they participate in. |
| Evidence attachment | Disputes support a proof URL field for evidence (screenshots, delivery links). |
| Dispute resolution | Admin resolves disputes with on-chain refund or force-release actions. |
| Status tracking | Disputes track status: Open, Resolved_Refunded, Resolved_Forced. |

---

### 1.7 Security

| Feature | Description |
|---------|-------------|
| AES-256-GCM encryption | The deployer private key is encrypted at rest and decrypted only during signing. |
| Memory zeroing | Decrypted keys are zeroed from memory after use. |
| Rate limiting | Global (60/min), auth (10/min), contract creation (5/min) limits per IP or user. |
| Input sanitization | Title, description, and reason fields are checked for XSS patterns. |
| Address validation | All Stellar address inputs are validated against the Keypair format. |
| Business logic checks | Client cannot equal artist. Amount must be positive. |

---

### 1.8 Frontend UI

| Feature | Description |
|---------|-------------|
| Dark/light theme | Users can toggle between dark and light mode. Theme persists in local storage. |
| Responsive layout | The interface adapts to desktop and mobile screen sizes. |
| Animated transitions | Page and component transitions use Framer Motion for smooth UX. |
| Transaction toasts | Success and error notifications show after on-chain actions with explorer links. |
| Wallet connection modal | Multi-wallet support through Stellar Wallets Kit modal. |

---

### 1.9 Infrastructure

| Feature | Description |
|---------|-------------|
| Vercel frontend hosting | Static React build deployed at the edge for fast global delivery. |
| Render backend hosting | Dockerized FastAPI with Stellar CLI inside the container. |
| PostgreSQL persistence | Commissions, disputes, and users stored in a managed PostgreSQL instance. |
| SQLite fallback | Local development can use SQLite instead of PostgreSQL. |
| Redis rate limiting | Optional Redis for distributed rate limit state. Falls back to in-memory. |
| CORS configuration | Backend allows cross-origin requests from the frontend domain. |

---

## 2. Proposed Future Features

This section lists features that can improve the platform. Items are grouped by priority.

---

### 2.1 High Priority

These features address gaps that directly affect user trust, safety, and usability.

#### 2.1.1 Deadline and Auto-Refund

| Aspect | Detail |
|--------|--------|
| Problem | There is no time limit on commissions. An artist can hold funds indefinitely without delivering. |
| Solution | Add a configurable deadline to each commission. If the artist does not deliver before the deadline, the contract automatically enables client self-refund without admin intervention. |
| Scope | Smart contract modification + backend + frontend form field. |

#### 2.1.2 Milestone-Based Payments

| Aspect | Detail |
|--------|--------|
| Problem | Commissions only support a single lump-sum payment. Large projects need partial releases. |
| Solution | Allow contracts with multiple milestones (e.g., sketch, lineart, color). Each milestone releases a percentage of the total USDC upon approval. |
| Scope | New contract design + backend milestone tracking + frontend milestone UI. |

#### 2.1.3 In-App Messaging / Delivery Channel

| Aspect | Detail |
|--------|--------|
| Problem | Artists deliver through external channels (Google Drive, email). There is no on-platform proof of delivery. |
| Solution | Add an in-app messaging system where artists upload deliverables. Store delivery timestamps on-chain or as hashes for proof. |
| Scope | New backend service + file storage (S3/IPFS) + frontend chat/upload component. |

#### 2.1.4 Email / Push Notifications

| Aspect | Detail |
|--------|--------|
| Problem | Users must manually check the dashboard for state changes. |
| Solution | Send notifications when: contract is funded, delivery is uploaded, dispute is raised, or funds are released. Support email and browser push notifications. |
| Scope | Notification service + email provider integration + frontend service worker. |

#### 2.1.5 Mainnet Deployment

| Aspect | Detail |
|--------|--------|
| Problem | The application runs on Stellar Testnet only. Real transactions are not possible. |
| Solution | Deploy the factory contract to Stellar Mainnet. Update RPC endpoints and USDC token address. Add mainnet/testnet environment toggle. |
| Scope | Contract redeployment + environment configuration + frontend network selector. |

---

### 2.2 Medium Priority

These features improve the platform experience and expand capability.

#### 2.2.1 Artist Portfolio and Discovery

| Aspect | Detail |
|--------|--------|
| Problem | Artists and clients must find each other off-platform. ComiSure is only an escrow tool. |
| Solution | Add artist profiles with portfolio galleries, commission rates, availability status, and a public discovery page. Clients can browse and commission artists directly. |
| Scope | New database models + file upload + public artist pages + search/filter UI. |

#### 2.2.2 Multi-Currency Support

| Aspect | Detail |
|--------|--------|
| Problem | Only USDC is supported. Some users prefer other stablecoins or assets. |
| Solution | Allow contracts to accept EURC, USDT (Stellar), or XLM. The token address becomes a parameter during contract initialization. |
| Scope | Smart contract modification + backend token registry + frontend asset selector. |

#### 2.2.3 Reputation and Rating System

| Aspect | Detail |
|--------|--------|
| Problem | There is no feedback mechanism. Users cannot assess reliability before starting a commission. |
| Solution | After a contract reaches a terminal state (Released or Refunded), both parties can leave a rating and review. Display aggregate scores on profiles. |
| Scope | New database models + review API endpoints + frontend review component + profile display. |

#### 2.2.4 Commission Templates

| Aspect | Detail |
|--------|--------|
| Problem | Artists offer standard packages (bust, half-body, full-body) but must negotiate each time. |
| Solution | Artists create reusable commission templates with fixed pricing. Clients can select a template and instantly create an escrow with pre-filled data. |
| Scope | Template model + artist template management UI + client template browser. |

#### 2.2.5 Mobile Application

| Aspect | Detail |
|--------|--------|
| Problem | The web application is not optimized for mobile wallet interactions. |
| Solution | Build a React Native or PWA mobile application. Integrate with mobile Stellar wallets (Lobstr, Solar). |
| Scope | New mobile project or PWA conversion + mobile wallet SDK integration. |

---

### 2.3 Low Priority

These features add polish and long-term scalability.

#### 2.3.1 Platform Fee System

| Aspect | Detail |
|--------|--------|
| Problem | The platform has no revenue model. |
| Solution | Add an optional platform fee (1-3%) deducted from the release amount. The fee routes to a platform treasury address. Make the fee configurable per contract or globally. |
| Scope | Smart contract modification + backend fee calculation + frontend fee display. |

#### 2.3.2 Multi-Language Support (i18n)

| Aspect | Detail |
|--------|--------|
| Problem | The interface is English-only. Many target users (Filipino artists) prefer their native language. |
| Solution | Add internationalization with react-i18next. Start with English and Filipino (Tagalog). Allow community translations. |
| Scope | i18n library setup + translation files + UI language selector. |

#### 2.3.3 Analytics Dashboard

| Aspect | Detail |
|--------|--------|
| Problem | There is no visibility into platform usage, volume, or trends. |
| Solution | Add an admin analytics page that shows: total commissions created, total USDC volume, dispute rate, average completion time, and active users. |
| Scope | Backend aggregation queries + frontend chart components (Recharts or Chart.js). |

#### 2.3.4 Batch Commission Management

| Aspect | Detail |
|--------|--------|
| Problem | Clients who commission multiple artists must create contracts one at a time. |
| Solution | Allow batch creation of commissions from a CSV or multi-form interface. Deploy multiple contracts in parallel. |
| Scope | Backend batch endpoint + frontend bulk creation UI + progress tracking. |

#### 2.3.5 On-Chain Dispute Evidence (IPFS)

| Aspect | Detail |
|--------|--------|
| Problem | Dispute evidence (screenshots, files) is stored as external URLs. These can be deleted or modified. |
| Solution | Upload evidence to IPFS. Store the IPFS CID on-chain or in the contract metadata. This creates tamper-proof evidence records. |
| Scope | IPFS integration (Pinata/web3.storage) + backend upload endpoint + frontend upload component. |

#### 2.3.6 Webhook Integrations

| Aspect | Detail |
|--------|--------|
| Problem | External tools (Discord, Telegram, project management) cannot react to escrow events. |
| Solution | Add webhook subscriptions. Users configure URLs to receive POST notifications on state changes (funded, released, disputed). |
| Scope | Webhook model + async dispatch service + management UI. |

#### 2.3.7 Two-Party Approval (Artist Confirmation)

| Aspect | Detail |
|--------|--------|
| Problem | Currently, only the client initiates and funds. The artist has no on-chain acceptance step. |
| Solution | Add an artist acceptance step before funding. The artist reviews terms and signs on-chain to confirm participation. This prevents unwanted contracts being created against an artist address. |
| Scope | Smart contract state addition + backend flow update + frontend artist confirmation UI. |

---

## 3. Feature Roadmap Summary

| Phase | Focus | Target Features |
|-------|-------|-----------------|
| Phase 1 | Safety and trust | Deadline/auto-refund, milestone payments, in-app delivery |
| Phase 2 | Growth | Notifications, mainnet deploy, artist discovery, ratings |
| Phase 3 | Monetization | Platform fees, templates, multi-currency |
| Phase 4 | Scale | Mobile app, analytics, webhooks, i18n, IPFS evidence |
