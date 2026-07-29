# Deadline and Auto-Refund — Implementation Plan

**Version:** 1.0  
**Date:** 2025-07-29  
**Branch:** `feat/deadline-refund`  
**Status:** Draft

---

## 1. Summary

This plan adds a configurable deadline to each commission escrow. The client sets a deadline (in days) when they create a commission. The smart contract stores the deadline as a Unix timestamp. After the deadline passes, the client can self-refund without admin help. The artist can still deliver before the deadline. The admin can still act at any time.

---

## 2. Problem Statement

The current system has no time limit on commissions. An artist can accept a commission, receive locked funds, and never deliver. The only recourse is admin intervention. This creates a bottleneck and erodes client trust.

---

## 3. Solution Overview

Add a `deadline` parameter to the contract. Store it as a Unix timestamp. Add a new function `client_refund_expired()` that the client can call after the deadline. This function checks the current ledger timestamp against the stored deadline. If expired, it refunds the client directly — no admin needed.

---

## 4. Files to Modify

| # | File | Change Type |
|---|------|-------------|
| 1 | `contract/lib.rs` | Add DataKey::Deadline, modify initialize(), add two new functions |
| 2 | `contract/test.rs` | Add 4 new tests, update setup() |
| 3 | `backend/models.py` | Add deadline_days and deadline_at fields |
| 4 | `backend/main.py` | Validate deadline, compute timestamp, add client-refund endpoint |
| 5 | `backend/stellar_utils.py` | Pass deadline to CLI init command |
| 6 | `frontend/src/services/contract.js` | Add clientRefundExpired() and getContractDeadline() |
| 7 | `frontend/src/services/api.js` | Add clientRefund() method |
| 8 | `frontend/src/pages/Dashboard.jsx` | Deadline input + countdown + refund button |

---

## 5. Smart Contract Changes (`contract/lib.rs`)

### 5.1 Add DataKey::Deadline

Add a new variant to the `DataKey` enum. This stores the Unix timestamp (u64) after which the client can self-refund.

```rust
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Client,
    Artist,
    Admin,
    Token,
    Amount,
    State,
    Deadline, // ← NEW: Unix timestamp (u64) for auto-refund eligibility
}
```

### 5.2 Modify `initialize()` Signature

Add a `deadline: u64` parameter. Store it in the Deadline slot.

```rust
pub fn initialize(
    env: Env,
    client: Address,
    artist: Address,
    admin: Address,
    token: Address,
    deadline: u64,  // ← NEW: Unix timestamp for refund eligibility
) {
    if env.storage().instance().has(&DataKey::State) {
        panic!("ComiSure: contract already initialized");
    }

    // Validate: deadline must be in the future
    let now = env.ledger().timestamp();
    if deadline <= now {
        panic!("ComiSure: deadline must be in the future");
    }

    env.storage().instance().set(&DataKey::Client, &client);
    env.storage().instance().set(&DataKey::Artist, &artist);
    env.storage().instance().set(&DataKey::Admin, &admin);
    env.storage().instance().set(&DataKey::Token, &token);
    env.storage().instance().set(&DataKey::Deadline, &deadline); // ← NEW
    env.storage().instance().set(&DataKey::State, &EscrowState::Pending);
    env.storage().instance().set(&DataKey::Amount, &0i128);
}
```

### 5.3 Add `client_refund_expired()` Function

This function lets the client self-refund after the deadline passes. It checks three conditions:
1. The caller is the registered client.
2. The contract is in Funded state.
3. The current ledger timestamp exceeds the stored deadline.

```rust
/// Called by the client after the deadline expires.
/// Returns locked USDC to the client without admin intervention.
pub fn client_refund_expired(env: Env, caller: Address) {
    caller.require_auth();

    // Authorization: only the registered client can claim an expired refund
    let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
    if caller != client {
        panic!("ComiSure: unauthorized — only the client can claim an expired refund");
    }

    // State guard: refund only valid when funds are locked
    let state: EscrowState = env.storage().instance().get(&DataKey::State).unwrap();
    if state != EscrowState::Funded {
        panic!("ComiSure: expired refund only allowed from Funded state");
    }

    // Deadline check: current ledger time must exceed the stored deadline
    let deadline: u64 = env.storage().instance().get(&DataKey::Deadline).unwrap();
    let now = env.ledger().timestamp();
    if now <= deadline {
        panic!("ComiSure: deadline has not passed yet");
    }

    // Execute refund
    let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
    let amount: i128 = env.storage().instance().get(&DataKey::Amount).unwrap();
    let token_client = token::Client::new(&env, &token_addr);
    token_client.transfer(&env.current_contract_address(), &client, &amount);

    env.storage().instance().set(&DataKey::State, &EscrowState::Refunded);
}
```

### 5.4 Add `get_deadline()` View Function

Read-only helper that returns the stored deadline timestamp.

```rust
/// Returns the deadline Unix timestamp (seconds since epoch).
pub fn get_deadline(env: Env) -> u64 {
    env.storage().instance().get(&DataKey::Deadline).unwrap()
}
```

---

## 6. Test Changes (`contract/test.rs`)

### 6.1 Update `setup()` to Pass Deadline

The setup function must pass a deadline to `initialize()`. Use the ledger timestamp + an offset.

```rust
fn setup() -> (
    Env,
    Address,
    Address,
    Address,
    Address,
    Address,
) {
    let env = Env::default();
    env.mock_all_auths();

    let client_addr = Address::generate(&env);
    let artist_addr = Address::generate(&env);
    let admin_addr = Address::generate(&env);
    let token_admin = Address::generate(&env);

    let token_id = env.register_stellar_asset_contract_v2(token_admin.clone())
        .address();
    let asset_admin_client = token::StellarAssetClient::new(&env, &token_id);
    asset_admin_client.mint(&client_addr, &100_000_0000000_i128);

    let contract_id = env.register(ComiSureContract, ());
    let contract = ComiSureContractClient::new(&env, &contract_id);

    // Set ledger timestamp to a known value for deterministic testing
    env.ledger().set_timestamp(1_000_000);

    // Deadline: 14 days from now (1_000_000 + 14*86400 = 2_209_600)
    let deadline: u64 = 1_000_000 + (14 * 86_400);
    contract.initialize(&client_addr, &artist_addr, &admin_addr, &token_id, &deadline);

    (env, contract_id, client_addr, artist_addr, admin_addr, token_id)
}
```

### 6.2 Test: Client Refund After Deadline

Verify the client can self-refund after the deadline passes.

```rust
#[test]
fn test_client_refund_after_deadline_expires() {
    let (env, contract_id, client, _artist, _admin, token_id) = setup();
    let contract = ComiSureContractClient::new(&env, &contract_id);
    let token = token::Client::new(&env, &token_id);

    let deposit_amount: i128 = 500_0000000;
    contract.deposit_funds(&client, &deposit_amount);

    // Advance ledger time past the deadline
    env.ledger().set_timestamp(3_000_000); // well past 2_209_600

    // Client claims the expired refund
    contract.client_refund_expired(&client);

    // Client should have their funds back
    assert_eq!(token.balance(&contract_id), 0);
    assert_eq!(contract.get_state(), EscrowState::Refunded);
}
```

### 6.3 Test: Client Refund Blocked Before Deadline

Verify the contract rejects a refund attempt before the deadline.

```rust
#[test]
#[should_panic(expected = "deadline has not passed yet")]
fn test_client_refund_blocked_before_deadline() {
    let (env, contract_id, client, _artist, _admin, _token_id) = setup();
    let contract = ComiSureContractClient::new(&env, &contract_id);

    contract.deposit_funds(&client, &500_0000000_i128);

    // Ledger time is still 1_000_000, deadline is 2_209_600
    // Do NOT advance time — this should panic
    contract.client_refund_expired(&client);
}
```

### 6.4 Test: Artist Cannot Claim Expired Refund

Verify that only the client can call `client_refund_expired`.

```rust
#[test]
#[should_panic(expected = "only the client can claim an expired refund")]
fn test_artist_cannot_claim_expired_refund() {
    let (env, contract_id, client, artist, _admin, _token_id) = setup();
    let contract = ComiSureContractClient::new(&env, &contract_id);

    contract.deposit_funds(&client, &500_0000000_i128);

    // Advance past deadline
    env.ledger().set_timestamp(3_000_000);

    // Artist tries to claim — should panic
    contract.client_refund_expired(&artist);
}
```

### 6.5 Test: Approve Release Still Works After Deadline

The client can still approve the release after the deadline. The deadline only enables refund — it does not block release.

```rust
#[test]
fn test_approve_release_works_after_deadline() {
    let (env, contract_id, client, artist, _admin, token_id) = setup();
    let contract = ComiSureContractClient::new(&env, &contract_id);
    let token = token::Client::new(&env, &token_id);

    let deposit_amount: i128 = 500_0000000;
    contract.deposit_funds(&client, &deposit_amount);

    // Advance past deadline
    env.ledger().set_timestamp(3_000_000);

    // Client still approves (artist delivered late but client accepts)
    contract.approve_release(&client);

    assert_eq!(token.balance(&artist), deposit_amount);
    assert_eq!(contract.get_state(), EscrowState::Released);
}
```

---

## 7. Backend Model Changes (`backend/models.py`)

### 7.1 Add `deadline_days` to `CommissionBase`

This field represents the number of days from creation until the deadline. Default is 14 days.

```python
class CommissionBase(SQLModel):
    title: str = Field(index=True)
    description: str
    amount_usdc: int
    client_address: str = Field(index=True)
    artist_address: str = Field(index=True)
    status: str = Field(default="Pending")
    deadline_days: int = Field(default=14)  # ← NEW: 1–90 days
```

### 7.2 Add `deadline_at` to `Commission`

This field stores the computed deadline as a UTC datetime. The backend calculates it at creation time.

```python
class Commission(CommissionBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    contract_id: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    deployer_key_version: Optional[str] = Field(default=None)
    deadline_at: Optional[datetime] = Field(default=None)  # ← NEW
```

### 7.3 Update `CommissionRead`

Expose the new fields in the API response.

```python
class CommissionRead(CommissionBase):
    id: int
    contract_id: Optional[str]
    created_at: datetime
    deployer_key_version: Optional[str]
    deadline_at: Optional[datetime]  # ← NEW
```

---

## 8. Backend API Changes (`backend/main.py`)

### 8.1 Validate Deadline in `create_contract()`

Add validation for `deadline_days` (must be 1–90). Compute the Unix timestamp for the contract.

```python
# Inside create_contract(), after existing validations:

# Validate deadline range
if commission.deadline_days < 1 or commission.deadline_days > 90:
    raise HTTPException(
        status_code=400,
        detail="Deadline must be between 1 and 90 days."
    )

# Compute deadline as Unix timestamp for the smart contract
from datetime import timedelta
import time

deadline_dt = datetime.utcnow() + timedelta(days=commission.deadline_days)
deadline_unix = int(deadline_dt.timestamp())

# Store in the database record
db_commission.deadline_at = deadline_dt
```

### 8.2 Pass Deadline to Contract Deployer

Update the `deploy_and_initialize_escrow()` call to include the deadline.

```python
contract_id = stellar_utils.deploy_and_initialize_escrow(
    client_address=db_commission.client_address,
    artist_address=db_commission.artist_address,
    version=active_version,
    deadline_unix=deadline_unix  # ← NEW
)
```

### 8.3 Add `POST /contracts/{contract_id}/client-refund` Endpoint

This endpoint lets the client trigger the on-chain `client_refund_expired` function through the backend.

```python
@app.post("/contracts/{contract_id}/client-refund")
def client_refund_expired(
    contract_id: int,
    request: Request,
    session: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user)
):
    db_commission = session.get(Commission, contract_id)
    if not db_commission or not db_commission.contract_id:
        raise HTTPException(status_code=404, detail="Valid commission contract not found")

    # Only the client can trigger this
    if db_commission.client_address != current_user.wallet_address:
        raise HTTPException(status_code=403, detail="Only the client can claim an expired refund.")

    # Check deadline in the database first (fast fail)
    if db_commission.deadline_at and datetime.utcnow() < db_commission.deadline_at:
        raise HTTPException(status_code=400, detail="Deadline has not passed yet.")

    if db_commission.status == "Refunded":
        return {"status": "success", "detail": "Contract is already refunded."}

    # The actual refund happens on-chain via the client's wallet signature.
    # This endpoint only updates the off-chain status after verifying on-chain state.
    try:
        on_chain_state = stellar_utils.get_contract_state_on_chain(
            db_commission.contract_id,
            version=db_commission.deployer_key_version
        )
        if on_chain_state != "Refunded":
            raise HTTPException(
                status_code=400,
                detail=f"On-chain state is '{on_chain_state}'. Submit client_refund_expired on-chain first."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"On-chain verification failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify on-chain state.")

    db_commission.status = "Refunded"
    session.add(db_commission)
    session.commit()
    return {"status": "success"}
```

---

## 9. Backend Stellar Utils Changes (`backend/stellar_utils.py`)

### 9.1 Add `deadline_unix` Parameter

Update `deploy_and_initialize_escrow()` to accept and pass the deadline.

```python
def deploy_and_initialize_escrow(
    client_address: str,
    artist_address: str,
    version: str = None,
    deadline_unix: int = None  # ← NEW
) -> str:
```

### 9.2 Add `--deadline` to the Init CLI Command

Append the deadline argument to the `stellar contract invoke` command.

```python
# Inside deploy_and_initialize_escrow(), update init_cmd:
init_cmd = [
    "stellar", "contract", "invoke",
    "--id", contract_id,
    "--source", source_arg,
    "--network", NETWORK,
    "--", "initialize",
    "--client", client_address,
    "--artist", artist_address,
    "--admin", admin_address,
    "--token", USDC_TOKEN,
    "--deadline", str(deadline_unix)  # ← NEW
]
```

---

## 10. Frontend Contract Service Changes (`frontend/src/services/contract.js`)

### 10.1 Add `clientRefundExpired()` Export

This function invokes the new `client_refund_expired` function on-chain.

```javascript
/**
 * Client claims a refund after the commission deadline has expired.
 * Only callable by the registered client wallet.
 */
export async function clientRefundExpired(contractId, callerAddress) {
  const contract = new Contract(contractId);
  const op = contract.call(
    'client_refund_expired',
    new Address(callerAddress).toScVal()
  );
  return invokeContract(callerAddress, op, {
    actorLabel: 'The client wallet',
    operation: 'client_refund_expired',
  });
}
```

### 10.2 Add `getContractDeadline()` Export

This function reads the deadline timestamp from the contract (read-only).

```javascript
/**
 * Read the deadline Unix timestamp from the contract.
 * Returns a BigInt representing seconds since epoch.
 */
export async function getContractDeadline(contractId, callerAddress) {
  const contract = new Contract(contractId);
  const scVal = await simulateReadOnly(callerAddress, contract.call('get_deadline'));
  if (!scVal) return 0n;
  return BigInt(scValToNative(scVal));
}
```

### 10.3 Add Friendly Error for Deadline

Add a new case to `friendlyContractError()`:

```javascript
if (lower.includes('deadline has not passed yet')) {
  return 'The commission deadline has not expired yet. You cannot claim a refund until the deadline passes.';
}
```

---

## 11. Frontend API Service Changes (`frontend/src/services/api.js`)

### 11.1 Add `clientRefund()` Method

This calls the backend endpoint to sync the off-chain status after the on-chain refund.

```javascript
export const commissionService = {
  // ... existing methods ...
  clientRefund: (id) => api.post(`/contracts/${id}/client-refund`).then(res => res.data),
};
```

---

## 12. Frontend Dashboard Changes (`frontend/src/pages/Dashboard.jsx`)

### 12.1 Add Deadline Input to `CreateCommissionView`

Add a numeric input field for `deadline_days` with a default of 14, min 1, max 90.

```jsx
// In formData state:
const [formData, setFormData] = useState({
  title: '',
  description: '',
  artist_address: '',
  amount_usdc: '10',
  deadline_days: '14'  // ← NEW
});

// In the form JSX (after the amount field):
<div>
  <label className="block text-sm font-bold mb-2">Deadline (Days)</label>
  <p className="text-xs text-textmuted mb-2">
    The client can self-refund after this many days if the artist does not deliver.
  </p>
  <input
    required
    type="number"
    min="1"
    max="90"
    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary outline-none"
    value={formData.deadline_days}
    onChange={e => setFormData({...formData, deadline_days: e.target.value})}
  />
</div>

// In handleSubmit payload:
const payload = {
  // ... existing fields ...
  deadline_days: parseInt(formData.deadline_days, 10),  // ← NEW
};
```

### 12.2 Add Countdown Display in `ActiveEscrowView`

Show a countdown timer that displays time remaining until the deadline.

```jsx
// Import the new function:
import { getContractDeadline, clientRefundExpired } from '../services/contract';

// In ActiveEscrowView, add deadline state:
const [deadline, setDeadline] = useState(null);
const [timeLeft, setTimeLeft] = useState(null);

// Fetch deadline alongside state:
const fetchState = useCallback(async () => {
  if (!walletAddress || !contractId) return;
  setFetching(true);
  try {
    const [state, amount, dl] = await Promise.all([
      getContractState(contractId, walletAddress),
      getContractAmount(contractId, walletAddress),
      getContractDeadline(contractId, walletAddress),  // ← NEW
    ]);
    setContractState(state);
    setLockedAmount(amount);
    setDeadline(dl);  // ← NEW
  } catch (e) {
    console.error('Failed to fetch contract state:', e);
    setContractState('Unknown');
  } finally {
    setFetching(false);
  }
}, [walletAddress, contractId]);

// Countdown timer effect:
useEffect(() => {
  if (!deadline || deadline === 0n) return;
  const deadlineMs = Number(deadline) * 1000;

  const tick = () => {
    const diff = deadlineMs - Date.now();
    if (diff <= 0) {
      setTimeLeft('Expired');
    } else {
      const days = Math.floor(diff / 86_400_000);
      const hours = Math.floor((diff % 86_400_000) / 3_600_000);
      const mins = Math.floor((diff % 3_600_000) / 60_000);
      setTimeLeft(`${days}d ${hours}h ${mins}m`);
    }
  };

  tick();
  const interval = setInterval(tick, 60_000); // update every minute
  return () => clearInterval(interval);
}, [deadline]);
```

### 12.3 Add Countdown Display in the Info Grid

Add a card that shows the deadline countdown.

```jsx
// After the "Escrow State" card in the grid:
<div className="p-4 rounded-xl border border-border bg-background">
  <p className="text-xs text-textmuted mb-1">Deadline</p>
  <p className={`text-2xl font-bold ${timeLeft === 'Expired' ? 'text-red-400' : ''}`}>
    {timeLeft ?? '—'}
  </p>
</div>
```

### 12.4 Add "Claim Expired Refund" Button

Show this button only when the contract is Funded AND the deadline has expired.

```jsx
// After the "Approve Release" card:
{contractState === 'Funded' && timeLeft === 'Expired' && (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="glass-panel p-6"
  >
    <h2 className="text-xl font-bold mb-1">Claim Expired Refund</h2>
    <p className="text-textmuted text-sm mb-4">
      The deadline has passed. You can reclaim your locked USDC.
    </p>
    <button
      disabled={loading}
      onClick={() => invoke(
        () => clientRefundExpired(contractId, walletAddress),
        'Expired Refund'
      )}
      className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
      Claim Refund (Deadline Expired)
    </button>
  </motion.div>
)}
```

---

## 13. Implementation Order

| Step | File | Task | Depends On |
|------|------|------|------------|
| 1 | `contract/lib.rs` | Add `DataKey::Deadline` variant to the enum | — |
| 2 | `contract/lib.rs` | Add `deadline: u64` param to `initialize()`, store it | Step 1 |
| 3 | `contract/lib.rs` | Add `client_refund_expired()` function | Steps 1–2 |
| 4 | `contract/lib.rs` | Add `get_deadline()` view function | Step 1 |
| 5 | `contract/test.rs` | Update `setup()` to set ledger timestamp and pass deadline | Steps 1–2 |
| 6 | `contract/test.rs` | Add 4 new test functions | Steps 3–5 |
| 7 | `backend/models.py` | Add `deadline_days` and `deadline_at` fields | — |
| 8 | `backend/stellar_utils.py` | Add `deadline_unix` param, pass `--deadline` to CLI | Steps 1–2 |
| 9 | `backend/main.py` | Validate deadline, compute timestamp, pass to deployer | Steps 7–8 |
| 10 | `backend/main.py` | Add `POST /contracts/{id}/client-refund` endpoint | Step 9 |
| 11 | `frontend/src/services/contract.js` | Add `clientRefundExpired()` and `getContractDeadline()` | Steps 3–4 |
| 12 | `frontend/src/services/api.js` | Add `clientRefund()` method | Step 10 |
| 13 | `frontend/src/pages/Dashboard.jsx` | Add deadline input, countdown, refund button | Steps 11–12 |

---

## 14. Edge Cases

| # | Scenario | Expected Behavior |
|---|----------|-------------------|
| 1 | Client sets deadline to 0 days | Backend rejects with 400: "Deadline must be between 1 and 90 days." |
| 2 | Client sets deadline to 91 days | Backend rejects with 400: "Deadline must be between 1 and 90 days." |
| 3 | Client calls `client_refund_expired` before deadline | Contract panics: "deadline has not passed yet" |
| 4 | Artist calls `client_refund_expired` after deadline | Contract panics: "only the client can claim an expired refund" |
| 5 | Client calls `client_refund_expired` when state is Pending | Contract panics: "expired refund only allowed from Funded state" |
| 6 | Client calls `client_refund_expired` when state is Released | Contract panics: "expired refund only allowed from Funded state" |
| 7 | Client approves release after deadline passes | Succeeds — deadline does NOT block approve_release |
| 8 | Admin refunds before deadline | Succeeds — admin_refund has no deadline check |
| 9 | Admin force-releases after deadline | Succeeds — admin actions are not gated by deadline |
| 10 | Deadline timestamp equals current ledger time exactly | Refund blocked — the check requires `now > deadline`, not `>=` |
| 11 | Contract initialized with past deadline | Contract panics: "deadline must be in the future" |
| 12 | Network clock skew (ledger time vs real time) | Acceptable risk — Stellar ledger timestamps are within seconds of real time |

---

## 15. Security Considerations

| # | Risk | Mitigation |
|---|------|------------|
| 1 | Deadline manipulation by attacker | Deadline is set once at initialization and stored immutably in contract storage. No function modifies it. |
| 2 | Front-running the deadline | The client can only refund after the deadline. There is no benefit to front-running because the client already owns the funds. |
| 3 | Admin override after deadline | Admin can still refund or force-release at any time. This is by design — admin is the dispute resolver. |
| 4 | Clock manipulation | Soroban uses the consensus ledger timestamp. Individual validators cannot forge timestamps. |
| 5 | Re-entrancy on refund | Soroban does not support re-entrant calls. The state is set to Refunded before any external call could theoretically re-enter. |
| 6 | Integer overflow on deadline | `u64` max is ~584 billion years from epoch. No realistic overflow risk. |
| 7 | Missing deadline field on old contracts | Old contracts deployed before this feature will not have a Deadline key. The `get_deadline()` function will panic on old contracts. Frontend must handle this gracefully. |

---

## 16. Acceptance Criteria

All of these conditions must pass before the feature is merged:

1. The smart contract compiles with `cargo build --target wasm32-unknown-unknown --release`.
2. All 7 contract tests pass with `cargo test` (3 existing + 4 new).
3. The backend starts without errors and the new endpoint responds correctly.
4. A new commission created via the API includes `deadline_days` and `deadline_at` in the response.
5. The `POST /contracts/{id}/client-refund` endpoint returns 400 if the deadline has not passed.
6. The `POST /contracts/{id}/client-refund` endpoint returns 200 after verifying on-chain Refunded state.
7. The frontend create form shows a deadline input field with default 14, min 1, max 90.
8. The frontend escrow viewer shows a countdown timer.
9. The "Claim Expired Refund" button appears only when state is Funded AND the deadline has expired.
10. The "Claim Expired Refund" button triggers the on-chain `client_refund_expired` transaction.
11. Existing tests (happy path, unauthorized, state check) still pass with the updated `setup()`.
12. The `approve_release` function still works after the deadline passes (no regression).

---

## 17. Migration Notes

- Existing commissions in the database will have `deadline_days = 14` (field default) and `deadline_at = NULL`.
- Existing deployed contracts do NOT have a Deadline key. The frontend must catch errors from `getContractDeadline()` on old contracts and hide the deadline UI gracefully.
- No database migration script is needed. SQLModel/SQLite will auto-create the new column on restart. For PostgreSQL, run `ALTER TABLE commission ADD COLUMN deadline_days INTEGER DEFAULT 14; ALTER TABLE commission ADD COLUMN deadline_at TIMESTAMP;`.

---

## 18. Future Enhancements (Out of Scope)

These items are related but not included in this implementation:

- **Auto-refund via cron/watcher:** A background job that automatically calls `client_refund_expired` on behalf of the client when the deadline passes. Requires server-side signing with the client's key (not feasible) or a keeper bot pattern.
- **Deadline extension:** Allow the client to extend the deadline on-chain (requires a new contract function).
- **Artist delivery confirmation:** Pause the deadline countdown when the artist marks delivery as complete.
- **Partial deadline refund:** Refund a percentage if the artist delivered partial work.
