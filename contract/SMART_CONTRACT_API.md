# ComiSure Smart Contract API Documentation

**Version:** 0.1.0  
**Network:** Stellar Testnet (Soroban)  
**Token:** USDC (7-decimal precision)  
**Language:** Rust (Soroban SDK v22.0.0)

---

## Table of Contents

1. [Overview](#overview)
2. [Data Structures](#data-structures)
3. [State Machine](#state-machine)
4. [Core Functions](#core-functions)
5. [View Functions](#view-functions)
6. [Authorization Model](#authorization-model)
7. [State Transitions](#state-transitions)
8. [Error Handling](#error-handling)
9. [Process Flows](#process-flows)
10. [Integration Notes](#integration-notes)

---

## Overview

ComiSure is a **trustless escrow contract** for digital art commissions on Stellar. It locks USDC funds from a client, manages dispute resolution through an admin, and releases payment to an artist upon approval or admin intervention.

**Key Principles:**
- No platform fee or cut — 100% of deposited funds go to artist or client
- Transparent on-chain state — all participants can verify escrow status anytime
- Stellar's 5-second settlement — artist receives USDC within one ledger close
- Admin governance — dispute resolution via on-chain audit trail

---

## Data Structures

### EscrowState Enum

Represents the lifecycle state of a single commission escrow.

```
Pending   → Initial state after contract initialization
Funded    → Client has deposited USDC; awaiting client approval or admin action
Released  → USDC transferred to artist; escrow lifecycle complete
Refunded  → USDC returned to client; escrow lifecycle complete
```

**Valid state transitions:**
```
Pending  → Funded    (via deposit_funds)
Funded   → Released  (via approve_release OR admin_force_release)
Funded   → Refunded  (via admin_refund)
```

**Invalid transitions:** All others will panic (e.g., Pending → Released, Released → Pending).

### DataKey Enum

Storage keys for contract instance state:

```
DataKey::Client   → Address of the commissioner (payer)
DataKey::Artist   → Address of the freelancer (recipient)
DataKey::Admin    → Address of the dispute-resolution wallet
DataKey::Token    → USDC token contract address (Circle's SAC on Stellar)
DataKey::Amount   → i128 amount locked in escrow (7-decimal USDC)
DataKey::State    → Current EscrowState
```

---

## State Machine

```
┌─────────┐
│ Pending │
└────┬────┘
     │
     │ deposit_funds(caller=client, amount > 0)
     │
     ▼
┌─────────┐
│ Funded  │◄──────────────────────────────────────────┐
└────┬────┴────────────────────┬────────────────────┐ │
     │                         │                    │ │
     │ approve_release(caller) │ admin_force_       │ │
     │ (caller=client)         │ release(caller)    │ │
     │                         │ (caller=admin)     │ │
     ▼                         ▼                    │ │
┌──────────┐           ┌──────────────┐            │ │
│Released  │           │Released      │◄───────────┤ │
└──────────┘           └──────────────┘            │ │
                                                   │ │
                       ┌──────────────┐            │ │
                       │ admin_refund │            │ │
                       │ (caller=admin)           │ │
                       └──────┬───────┘            │ │
                              │                    │ │
                              ▼                    │ │
                          ┌─────────┐              │ │
                          │ Refunded│◄─────────────┘ │
                          └─────────┘                │
                                                     │
                       (No re-entry to Funded)   ───┘
```

---

## Core Functions

### 1. initialize()

**Purpose:** One-time setup immediately after contract deployment.

**Signature:**
```rust
pub fn initialize(
    env: Env,
    client: Address,
    artist: Address,
    admin: Address,
    token: Address,
)
```

**Parameters:**
| Name   | Type    | Description |
|--------|---------|-------------|
| `env`  | Env     | Soroban environment (injected) |
| `client` | Address | Commissioner's wallet (payer) |
| `artist` | Address | Artist's wallet (recipient); must have USDC trustline |
| `admin` | Address | ComiSure dispute-resolution wallet |
| `token` | Address | USDC token contract address |

**Preconditions:**
- Contract must NOT have been initialized before (if DataKey::State exists, panics)
- All addresses must be valid Stellar addresses

**State Transition:**
- Sets all participant addresses in storage
- Initializes state to `Pending`
- Initializes amount to `0`

**Return Value:** None (void)

**Error Cases:**
- Panics if called a second time: `"ComiSure: contract already initialized"`

**Gas Cost:** Low (~1,000–2,000 ops)

**Example Usage (Pseudo-code):**
```javascript
// Frontend calls this immediately after deploying the contract
const txn = await invokeContractFunction(contractId, 'initialize', {
  client: 'GXXXXXX...',  // Commissioner wallet
  artist: 'GYYYYYY...',  // Artist wallet
  admin: 'GZZZZZZ...',   // ComiSure admin
  token: 'CUSDC_CONTRACT_ID'
});
await txn.sign(adminKey).submit();
```

---

### 2. deposit_funds()

**Purpose:** Client locks USDC into the escrow contract.

**Signature:**
```rust
pub fn deposit_funds(
    env: Env,
    caller: Address,
    amount: i128,
)
```

**Parameters:**
| Name     | Type    | Description |
|----------|---------|-------------|
| `env`    | Env     | Soroban environment (injected) |
| `caller` | Address | Wallet making the deposit (must be the registered client) |
| `amount` | i128    | USDC amount in 7-decimal format (e.g., 500_0000000 = 500 USDC) |

**Preconditions:**
- `caller` must equal the registered client address (or panics)
- `amount` must be > 0 (or panics)
- Current state must be `Pending` (or panics)
- Client wallet must have USDC balance ≥ `amount` (token contract will reject)
- Client must have an active USDC trustline (token contract will reject)

**State Transition:**
- `Pending` → `Funded`
- Stores `amount` in contract storage
- Transfers `amount` USDC from client wallet → contract address

**Return Value:** None (void)

**Error Cases:**
- `"ComiSure: unauthorized — only the registered client can deposit funds"` if caller ≠ client
- `"ComiSure: deposit amount must be greater than zero"` if amount ≤ 0
- `"ComiSure: deposit only allowed in Pending state"` if state ≠ Pending
- Token contract errors: insufficient balance, missing trustline

**Gas Cost:** Medium (~3,000–5,000 ops; includes token transfer)

**Example Usage (Pseudo-code):**
```javascript
// Client deposits 500 USDC for a commission
const amount = 500_0000000;  // 500 USDC in 7-decimal format
const txn = await invokeContractFunction(contractId, 'deposit_funds', {
  caller: clientAddress,
  amount: amount
});
await txn.sign(clientKey).submit();
```

**Frontend Validation:**
- Warn user if amount is suspiciously high/low
- Verify client has sufficient USDC balance before signing
- Poll `get_state()` to confirm state transitioned to Funded

---

### 3. approve_release()

**Purpose:** Client approves release of funds after artwork delivery.

**Signature:**
```rust
pub fn approve_release(
    env: Env,
    caller: Address,
)
```

**Parameters:**
| Name     | Type    | Description |
|----------|---------|-------------|
| `env`    | Env     | Soroban environment (injected) |
| `caller` | Address | Must be the registered client wallet |

**Preconditions:**
- `caller` must equal the registered client (or panics)
- Current state must be `Funded` (or panics)

**State Transition:**
- `Funded` → `Released`
- Transfers locked USDC amount from contract → artist wallet
- Amount is not modified (preserved in storage for audit)

**Return Value:** None (void)

**Error Cases:**
- `"ComiSure: unauthorized — only the client can approve the release"` if caller ≠ client
- `"ComiSure: release only allowed from Funded state"` if state ≠ Funded

**Gas Cost:** Medium (~3,000–5,000 ops; includes token transfer)

**Example Usage (Pseudo-code):**
```javascript
// Client approves release after confirming artwork delivery
const txn = await invokeContractFunction(contractId, 'approve_release', {
  caller: clientAddress
});
await txn.sign(clientKey).submit();

// Poll for confirmation
const state = await invokeContractFunction(contractId, 'get_state');
console.log('Escrow state:', state);  // Should print "Released"
```

**Frontend UX:**
- Show explicit confirmation dialog: "This will immediately pay the artist. Confirm?"
- Disable button unless state is Funded
- After success, show: "Payment released! Artist has received [amount] USDC."

---

### 4. admin_refund()

**Purpose:** Admin returns funds to client (e.g., artist ghosting after receiving approval).

**Signature:**
```rust
pub fn admin_refund(
    env: Env,
    caller: Address,
)
```

**Parameters:**
| Name     | Type    | Description |
|----------|---------|-------------|
| `env`    | Env     | Soroban environment (injected) |
| `caller` | Address | Must be the registered admin wallet |

**Preconditions:**
- `caller` must equal the registered admin address (or panics)
- Current state must be `Funded` (or panics)

**State Transition:**
- `Funded` → `Refunded`
- Transfers locked USDC amount from contract → client wallet

**Return Value:** None (void)

**Error Cases:**
- `"ComiSure: unauthorized — only the admin can issue a refund"` if caller ≠ admin
- `"ComiSure: refund only allowed from Funded state"` if state ≠ Funded

**Gas Cost:** Medium (~3,000–5,000 ops; includes token transfer)

**Example Usage (Pseudo-code):**
```javascript
// Admin initiates refund after verifying artist ghosted (off-chain review)
const txn = await invokeContractFunction(contractId, 'admin_refund', {
  caller: adminAddress
});
await txn.sign(adminKey).submit();

// Poll for confirmation
const state = await invokeContractFunction(contractId, 'get_state');
console.log('Escrow state:', state);  // Should print "Refunded"
```

**Admin UX (backend only):**
- Require admin to enter reason/proof hash before calling
- Log the transaction ID for audit trail
- Notify both client and artist of refund via API/email

---

### 5. admin_force_release()

**Purpose:** Admin forces payment to artist when client withholds approval maliciously.

**Signature:**
```rust
pub fn admin_force_release(
    env: Env,
    caller: Address,
)
```

**Parameters:**
| Name     | Type    | Description |
|----------|---------|-------------|
| `env`    | Env     | Soroban environment (injected) |
| `caller` | Address | Must be the registered admin wallet |

**Preconditions:**
- `caller` must equal the registered admin address (or panics)
- Current state must be `Funded` (or panics)

**State Transition:**
- `Funded` → `Released`
- Transfers locked USDC amount from contract → artist wallet
- Amount is not modified (preserved in storage for audit)

**Return Value:** None (void)

**Error Cases:**
- `"ComiSure: unauthorized — only the admin can force a release"` if caller ≠ admin
- `"ComiSure: force release only allowed from Funded state"` if state ≠ Funded

**Gas Cost:** Medium (~3,000–5,000 ops; includes token transfer)

**Example Usage (Pseudo-code):**
```javascript
// Admin forces release after verifying artwork delivery (off-chain review)
const txn = await invokeContractFunction(contractId, 'admin_force_release', {
  caller: adminAddress
});
await txn.sign(adminKey).submit();

// Poll for confirmation
const state = await invokeContractFunction(contractId, 'get_state');
console.log('Escrow state:', state);  // Should print "Released"
```

**Admin UX (backend only):**
- Require admin to provide delivery proof hash/IPFS link
- Log the transaction ID and proof for audit trail
- Notify both client and artist of forced release via API/email

---

## View Functions

### 6. get_state()

**Purpose:** Read-only query of the current escrow state.

**Signature:**
```rust
pub fn get_state(env: Env) -> EscrowState
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `env` | Env  | Soroban environment (injected) |

**Return Value:**
| Type         | Description |
|--------------|-------------|
| `EscrowState` | One of: Pending, Funded, Released, Refunded |

**Preconditions:** None (read-only, no auth required)

**Gas Cost:** Very low (~500 ops)

**Example Usage (Pseudo-code):**
```javascript
// Poll state without modifying anything
const state = await invokeContractFunction(contractId, 'get_state');
switch (state) {
  case 'Pending':
    console.log('Awaiting client deposit...');
    break;
  case 'Funded':
    console.log('Funds locked. Awaiting approval.');
    break;
  case 'Released':
    console.log('Payment released to artist!');
    break;
  case 'Refunded':
    console.log('Refund issued to client.');
    break;
}
```

---

### 7. get_amount()

**Purpose:** Read-only query of the locked USDC amount.

**Signature:**
```rust
pub fn get_amount(env: Env) -> i128
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| `env` | Env  | Soroban environment (injected) |

**Return Value:**
| Type  | Description |
|-------|-------------|
| `i128` | USDC amount in 7-decimal format (e.g., 500_0000000 = 500 USDC) |

**Preconditions:** None (read-only, no auth required)

**Storage Behavior:**
- Amount is set at `deposit_funds()` time
- Amount remains in storage even after state transitions to Released/Refunded
- This preserves the audit trail: frontend can display "Commission value: [amount] USDC"

**Gas Cost:** Very low (~500 ops)

**Example Usage (Pseudo-code):**
```javascript
// Display the locked amount in human-readable format
const amountRaw = await invokeContractFunction(contractId, 'get_amount');
const amountUSDC = amountRaw / 10_000_000;  // Convert from 7-decimal
console.log(`Commission value: ${amountUSDC} USDC`);
```

---

## Authorization Model

### Authentication vs. Authorization

The contract uses a two-layer authorization model:

1. **Authentication** — `caller.require_auth()`
   - Ensures the transaction was cryptographically signed by `caller`
   - Enforced at the Soroban protocol level

2. **Authorization** — `if caller != expected_address { panic!(...) }`
   - Explicit address comparison ensures only the registered participant can act
   - Provides defense-in-depth even if auth mocking is enabled in tests

### Per-Function Authorization

| Function | Must be Caller | Why |
|----------|---|---|
| `initialize()` | (Any address initially) | Called by deployer; re-initialization blocked by state check |
| `deposit_funds()` | `client` | Only client can lock their own USDC |
| `approve_release()` | `client` | Only client can trigger payment after delivery confirmation |
| `admin_refund()` | `admin` | Only admin can reverse (dispute resolution) |
| `admin_force_release()` | `admin` | Only admin can override client (dispute resolution) |
| `get_state()` | (Anyone) | Read-only, no auth required |
| `get_amount()` | (Anyone) | Read-only, no auth required |

---

## State Transitions

### Valid Transition: Pending → Funded

**Trigger:** `deposit_funds(caller=client, amount > 0)`

**Preconditions:**
- Current state is Pending
- Caller is the registered client
- Amount > 0
- Client has sufficient USDC balance
- Client has USDC trustline

**Side Effects:**
- USDC transferred: client wallet → contract
- Amount stored in contract storage
- State flips to Funded

**Postconditions:**
- `get_state()` returns Funded
- `get_amount()` returns the deposit amount
- Contract's USDC balance equals the deposit

---

### Valid Transition: Funded → Released (Approval Path)

**Trigger:** `approve_release(caller=client)`

**Preconditions:**
- Current state is Funded
- Caller is the registered client

**Side Effects:**
- USDC transferred: contract → artist wallet
- State flips to Released
- Amount remains in storage (audit trail)

**Postconditions:**
- `get_state()` returns Released
- `get_amount()` still returns the original deposit amount
- Contract's USDC balance is 0
- Artist's USDC balance increased by the deposit amount

---

### Valid Transition: Funded → Released (Admin Force Path)

**Trigger:** `admin_force_release(caller=admin)`

**Preconditions:**
- Current state is Funded
- Caller is the registered admin

**Side Effects:**
- USDC transferred: contract → artist wallet
- State flips to Released
- Amount remains in storage (audit trail)

**Postconditions:**
- Same as Approval Path (final state is identical)
- Artist receives payment; client withheld approval

---

### Valid Transition: Funded → Refunded

**Trigger:** `admin_refund(caller=admin)`

**Preconditions:**
- Current state is Funded
- Caller is the registered admin

**Side Effects:**
- USDC transferred: contract → client wallet
- State flips to Refunded
- Amount remains in storage (audit trail)

**Postconditions:**
- `get_state()` returns Refunded
- `get_amount()` still returns the original deposit amount
- Contract's USDC balance is 0
- Client's USDC balance increased by the deposit amount

---

## Error Handling

### Panic Messages

All error states result in transaction failure (revert). The contract returns no partial state; Soroban's atomicity ensures either the entire operation succeeds or all storage changes are rolled back.

**Error Messages by Function:**

| Message | Function(s) | Condition |
|---------|---|---|
| `"ComiSure: contract already initialized"` | `initialize()` | Called a second time |
| `"ComiSure: unauthorized — only the registered client can deposit funds"` | `deposit_funds()` | caller ≠ client |
| `"ComiSure: deposit amount must be greater than zero"` | `deposit_funds()` | amount ≤ 0 |
| `"ComiSure: deposit only allowed in Pending state"` | `deposit_funds()` | state ≠ Pending |
| `"ComiSure: unauthorized — only the client can approve the release"` | `approve_release()` | caller ≠ client |
| `"ComiSure: release only allowed from Funded state"` | `approve_release()` | state ≠ Funded |
| `"ComiSure: unauthorized — only the admin can issue a refund"` | `admin_refund()` | caller ≠ admin |
| `"ComiSure: refund only allowed from Funded state"` | `admin_refund()` | state ≠ Funded |
| `"ComiSure: unauthorized — only the admin can force a release"` | `admin_force_release()` | caller ≠ admin |
| `"ComiSure: force release only allowed from Funded state"` | `admin_force_release()` | state ≠ Funded |

### Token-Level Errors

The token contract may also revert with errors such as:
- `"Stellar asset contract: insufficient balance"` — client doesn't have enough USDC
- `"Stellar asset contract: not authorized"` — client lacks USDC trustline
- `"Stellar asset contract: unauthorized operation"` — token operation constraints

**Frontend Strategy:**
- Wrap all contract calls in try-catch
- Parse the error message to determine whether it's a contract guard or a token operation failure
- Display user-friendly error messages in the UI

---

## Process Flows

### Flow 1: Happy Path (Client Approves)

```
┌─────────────────────────────────────────────────────────────┐
│ COMMISSIONING HAPPY PATH                                    │
└─────────────────────────────────────────────────────────────┘

1. Admin deploys contract
   └─→ initialize(client, artist, admin, token)
       State: Pending

2. Client views commission details (UI shows state=Pending)
   └─→ Clicks "Fund Escrow" button
       deposit_funds(caller=client, amount=500_0000000)
       State: Pending → Funded
       ✓ 500 USDC locked in contract

3. Artist starts work (UI shows state=Funded)
   └─→ Artist delivers artwork via Dropbox/Google Drive/etc.

4. Client reviews artwork
   └─→ Clicks "Approve & Pay Artist" button
       approve_release(caller=client)
       State: Funded → Released
       ✓ Artist receives 500 USDC within 5 seconds
       ✓ Commission marked complete on-chain

5. Both parties confirm completion
   └─→ get_state() returns Released
       get_amount() returns 500_0000000
```

---

### Flow 2: Admin Refund (Artist Ghosts)

```
┌─────────────────────────────────────────────────────────────┐
│ DISPUTE: ARTIST GHOSTING                                    │
└─────────────────────────────────────────────────────────────┘

1. Client deposits funds
   └─→ deposit_funds(...)
       State: Pending → Funded

2. Artist accepts commission but never delivers (ghosting)
   └─→ After X days, client contacts ComiSure admin

3. Admin reviews evidence off-chain
   └─→ Confirms artist ghosted (checked Twitter, Discord, etc.)

4. Admin issues refund on-chain
   └─→ admin_refund(caller=admin)
       State: Funded → Refunded
       ✓ Client receives 500 USDC back at original wallet

5. Escrow is settled
   └─→ get_state() returns Refunded
       Both parties can see the refund on block explorer
```

---

### Flow 3: Admin Force Release (Client Withholds Approval)

```
┌─────────────────────────────────────────────────────────────┐
│ DISPUTE: CLIENT WITHHOLDING APPROVAL                        │
└─────────────────────────────────────────────────────────────┘

1. Client deposits funds
   └─→ deposit_funds(...)
       State: Pending → Funded

2. Artist delivers artwork (proof: IPFS hash, photo, etc.)
   └─→ Client receives artwork but refuses to call approve_release
       (malicious withholding or unclear delivery standards)

3. Artist contacts ComiSure admin
   └─→ Provides delivery proof (screenshots, IPFS link, etc.)

4. Admin reviews evidence off-chain
   └─→ Confirms artwork meets commission specs

5. Admin forces payment via on-chain call
   └─→ admin_force_release(caller=admin)
       State: Funded → Released
       ✓ Artist receives 500 USDC despite client's refusal

6. Escrow is settled
   └─→ get_state() returns Released
       Audit trail preserved on-chain
```

---

## Integration Notes

### Frontend Considerations

1. **Polling & Event Listeners**
   - No smart contract events emitted (to keep contract minimal)
   - Frontend must poll `get_state()` at regular intervals (e.g., every 5 seconds)
   - Alternatively, listen to Stellar ledger updates and check contract state synchronously

2. **Amount Conversion**
   - Contract stores amounts as `i128` in 7-decimal format
   - Always divide by `10_000_000` for display: `amount_usdc = amount_raw / 10_000_000`
   - When accepting user input, multiply by `10_000_000` before passing to contract

3. **Address Formats**
   - Stellar addresses are 56 characters starting with 'G' (public key accounts) or 'C' (contracts)
   - Validate addresses before passing to contract functions
   - Example: `GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

4. **Gas Budgeting**
   - Soroban charges fees in stroops (1 stroops = 10^-7 XLM)
   - Typical transaction costs: 1,000–10,000 stroops (~$0.0001–$0.001 at current XLM price)
   - Contract operations are cheap; main cost is Stellar network fee (~100 stroops baseline)

5. **State Caching**
   - Cache `get_state()` and `get_amount()` locally; they don't change during user interaction
   - Refresh state after calling any state-modifying function (deposit, approve, etc.)
   - Display is stale between transactions; OK for UX (users expect blockchain latency)

6. **Error Handling Strategy**
   - Catch all transaction failures and check the error message
   - If error contains "unauthorized", display: "You are not authorized for this action."
   - If error contains "state", display: "Escrow is not in the correct state for this action."
   - If error is a token error, display: "USDC wallet issue: [error details]"

7. **Testnet Setup**
   - Deploy to Stellar Testnet with test USDC (minted for testnet, not mainnet)
   - Use stellar.expert block explorer to verify transactions
   - Use Soroban's testnet faucet to fund test wallets with XLM

### Backend/Admin Dashboard

1. **Dispute Management**
   - Build an off-chain system to receive and review refund/force-release requests
   - Require proof submission (e.g., IPFS hash, screenshot, etc.)
   - Log all admin actions to a database (for audit trail)
   - Never sign transactions with admin key without explicit manual approval

2. **Monitoring**
   - Monitor contract invocations via Stellar Horizon API
   - Alert on unusual patterns (e.g., many refunds in short time)
   - Track dispute resolution time (SLA: aim for < 24 hours)

3. **Compliance**
   - Store user KYC/AML data off-chain (not on-chain)
   - Implement transaction limits per user (if required by jurisdiction)
   - Log all transactions for tax/audit purposes

### Security Best Practices

1. **Key Management**
   - Never hardcode private keys in code
   - Use hardware wallets or key vaults for admin/client wallets
   - Rotate admin key periodically; plan key rotation ceremony

2. **Testing**
   - Test all three state paths (approval, refund, force-release) in staging
   - Verify amount calculations with extreme values (1 stroops, max i128)
   - Test with multiple concurrent escrows (contract supports one per instance)

3. **Upgrade Strategy**
   - Contract is immutable once deployed; plan upgrades carefully
   - Deploy new contract version with improved logic; migrate users through off-chain coordination
   - Do not reuse contract IDs

---

## USDC Amount Reference

| Amount (USDC) | 7-Decimal Representation | Use Case |
|---|---|---|
| 0.0000001 | 1 | Minimum (1 stroops equivalent) |
| 0.01 | 100_000 | Test transactions |
| 1.00 | 10_000_000 | Small commission |
| 100.00 | 1_000_000_000 | Mid-tier commission |
| 500.00 | 5_000_000_000 | Large Filipino art commission (~₱27,500) |
| 1,000.00 | 10_000_000_000 | Professional illustration |
| 9,223,372,036.85 | 9223372036854775807 | Maximum i128 value |


---

## References

- **Soroban SDK:** https://github.com/stellar/rs-soroban-sdk (v22.0.0)
- **Stellar Documentation:** https://developers.stellar.org/docs/
- **Stellar Asset Contract (SAC):** https://developers.stellar.org/docs/learn/smart-contracts/tokens
- **Soroban RPC API:** https://developers.stellar.org/docs/reference/soroban-rpc

---
