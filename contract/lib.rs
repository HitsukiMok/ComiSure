// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ComiSure — Trustless Escrow for Digital Art Commissions
// Soroban Smart Contract (Rust)
//
// Flow:
//   1. Admin deploys and calls initialize() with participant addresses.
//   2. Client calls deposit_funds() → USDC locked, state = Funded.
//   3a. Client calls approve_release() after artwork delivery → Artist paid.
//   3b. Admin calls admin_refund() if artist ghosts → Client refunded.
//   3c. Admin calls admin_force_release() if client withholds approval → Artist paid.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env};

// ── Storage key enum ──────────────────────────────────────────────────────────
// Each variant maps to a unique slot in the contract's persistent instance storage.
// Using an enum (rather than raw strings) ensures type-safe, collision-free keys.
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Client, // Address of the commissioner (pays for the artwork)
    Artist, // Address of the freelance illustrator (receives payment)
    Admin,  // Trusted dispute-resolution address (ComiSure platform wallet)
    Token,  // USDC token contract address (Circle's Stellar-native USDC)
    Amount, // i128 amount of USDC locked in escrow (7-decimal precision)
    State,  // Current EscrowState — drives all business logic guards
}

// ── Escrow state machine ──────────────────────────────────────────────────────
// Only valid transitions:
//   Pending → Funded (via deposit_funds)
//   Funded  → Released (via approve_release or admin_force_release)
//   Funded  → Refunded (via admin_refund)
// All other transitions are rejected to prevent double-spend or replay attacks.
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum EscrowState {
    Pending,  // Initialized but no funds deposited yet
    Funded,   // USDC locked inside the contract; awaiting client approval
    Released, // Funds successfully transferred to the artist
    Refunded, // Funds returned to the client after a failed commission
}

// ── Contract entry point ──────────────────────────────────────────────────────
#[contract]
pub struct ComiSureContract;

#[contractimpl]
impl ComiSureContract {
    // ── initialize ────────────────────────────────────────────────────────────
    /// One-time setup called immediately after deployment.
    /// Stores all participant addresses and the USDC token contract address,
    /// then sets the initial state to Pending.
    /// Panics if called a second time to prevent participant substitution attacks.
    pub fn initialize(
        env: Env,
        client: Address, // Commissioner's wallet address
        artist: Address, // Artist's wallet address (must have a USDC trustline)
        admin: Address,  // ComiSure dispute-resolution wallet
        token: Address,  // Stellar USDC token contract (or any SAC-compatible asset)
    ) {
        // Guard: block re-initialization — if State already exists, contract is live
        if env.storage().instance().has(&DataKey::State) {
            panic!("ComiSure: contract already initialized");
        }

        env.storage().instance().set(&DataKey::Client, &client);
        env.storage().instance().set(&DataKey::Artist, &artist);
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::State, &EscrowState::Pending);
        env.storage().instance().set(&DataKey::Amount, &0i128);
    }

    // ── deposit_funds ─────────────────────────────────────────────────────────
    /// Called by the client to lock USDC into the escrow contract.
    ///
    /// Why this design:
    ///   - `caller.require_auth()` ensures the transaction was signed by `caller`.
    ///   - The explicit `caller != client` comparison rejects any other wallet, even
    ///     if auth is mocked in a test environment, providing a second security layer.
    ///   - The token.transfer() call will fail at the protocol level if the client
    ///     lacks a USDC trustline or insufficient balance, validating both in one step.
    ///   - Stellar's sub-cent fees make locking even ₱500 (~$9 USDC) economically sane.
    pub fn deposit_funds(env: Env, caller: Address, amount: i128) {
        // Step 1: Authenticate — caller must have signed this invocation
        caller.require_auth();

        // Step 2: Authorization — only the registered client wallet may deposit
        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        if caller != client {
            panic!("ComiSure: unauthorized — only the registered client can deposit funds");
        }

        // Step 3: Validate amount — prevents zero-value or negative escrows
        if amount <= 0 {
            panic!("ComiSure: deposit amount must be greater than zero");
        }

        // Step 4: State guard — can only deposit when the contract is in Pending state
        let state: EscrowState = env.storage().instance().get(&DataKey::State).unwrap();
        if state != EscrowState::Pending {
            panic!("ComiSure: deposit only allowed in Pending state");
        }

        // Step 5: Transfer USDC from client wallet → this contract address
        //   The Soroban token interface handles trustline verification automatically;
        //   if the client's wallet lacks USDC or the trustline is missing, this panics.
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&caller, &env.current_contract_address(), &amount);

        // Step 6: Persist the locked amount and advance state to Funded
        env.storage().instance().set(&DataKey::Amount, &amount);
        env.storage().instance().set(&DataKey::State, &EscrowState::Funded);
    }

    // ── approve_release ───────────────────────────────────────────────────────
    /// Called exclusively by the client after the artist delivers the finished artwork.
    ///
    /// Why this design:
    ///   - Giving release control to the client mirrors real-world commission workflows
    ///     (client reviews → approves → artist is paid) without introducing trust in a
    ///     third-party platform to hold or manage funds at any intermediate step.
    ///   - Stellar's 5-second settlement means the artist sees USDC within one ledger
    ///     close — no waiting days for wire transfers or PayPal settlement windows.
    pub fn approve_release(env: Env, caller: Address) {
        // Authenticate the caller
        caller.require_auth();

        // Authorization: only the registered client may trigger a release
        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        if caller != client {
            panic!("ComiSure: unauthorized — only the client can approve the release");
        }

        // State guard: release is only valid when funds are locked (Funded)
        let state: EscrowState = env.storage().instance().get(&DataKey::State).unwrap();
        if state != EscrowState::Funded {
            panic!("ComiSure: release only allowed from Funded state");
        }

        let artist: Address = env.storage().instance().get(&DataKey::Artist).unwrap();
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let amount: i128 = env.storage().instance().get(&DataKey::Amount).unwrap();

        // Transfer the locked USDC from this contract to the artist's wallet.
        // The contract itself is the sender here — no external auth required for its own balance.
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &artist, &amount);

        // Advance to Released — escrow lifecycle complete
        env.storage().instance().set(&DataKey::State, &EscrowState::Released);
    }

    // ── admin_refund ──────────────────────────────────────────────────────────
    /// Called exclusively by the admin to return funds to the client.
    ///
    /// Why this exists:
    ///   - Protects commissioners against artist ghosting after receiving nothing —
    ///     the most common fraud vector in Philippine freelance communities (e.g., Twitter/X
    ///     art Twitter scams where artists take commission slots and disappear).
    ///   - The admin wallet is the ComiSure platform key, not an arbitrary third party;
    ///     its use is logged on-chain and auditable by both parties.
    pub fn admin_refund(env: Env, caller: Address) {
        caller.require_auth();

        // Authorization: only the designated admin may initiate a refund
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if caller != admin {
            panic!("ComiSure: unauthorized — only the admin can issue a refund");
        }

        // State guard: a refund only makes sense when funds are actively locked
        let state: EscrowState = env.storage().instance().get(&DataKey::State).unwrap();
        if state != EscrowState::Funded {
            panic!("ComiSure: refund only allowed from Funded state");
        }

        let client: Address = env.storage().instance().get(&DataKey::Client).unwrap();
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let amount: i128 = env.storage().instance().get(&DataKey::Amount).unwrap();

        // Return the full locked amount back to the client's wallet
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &client, &amount);

        // Mark as Refunded — no further operations allowed on this escrow
        env.storage().instance().set(&DataKey::State, &EscrowState::Refunded);
    }

    // ── admin_force_release ───────────────────────────────────────────────────
    /// Called exclusively by the admin to force payment to the artist when the
    /// client maliciously withholds approval after confirmed delivery.
    ///
    /// Why this exists:
    ///   - Mirrors PayPal chargeback fraud in reverse: a bad-faith client might refuse
    ///     to call approve_release while keeping the delivered artwork, effectively
    ///     stealing the artist's labor. This admin escape hatch prevents that.
    ///   - Requires the admin to adjudicate (review delivery proof off-chain) before
    ///     calling — the contract assumes admin governance is honest and accountable.
    pub fn admin_force_release(env: Env, caller: Address) {
        caller.require_auth();

        // Authorization: only the admin may override a client's withheld approval
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if caller != admin {
            panic!("ComiSure: unauthorized — only the admin can force a release");
        }

        // State guard: force release only valid when funds are locked
        let state: EscrowState = env.storage().instance().get(&DataKey::State).unwrap();
        if state != EscrowState::Funded {
            panic!("ComiSure: force release only allowed from Funded state");
        }

        let artist: Address = env.storage().instance().get(&DataKey::Artist).unwrap();
        let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
        let amount: i128 = env.storage().instance().get(&DataKey::Amount).unwrap();

        // Force-transfer USDC to the artist, bypassing the client's approval gate
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &artist, &amount);

        // Outcome is Released — identical final state to a voluntary approve_release
        env.storage().instance().set(&DataKey::State, &EscrowState::Released);
    }

    // ── View helpers ──────────────────────────────────────────────────────────

    /// Returns the current escrow state (Pending / Funded / Released / Refunded).
    /// Read-only; does not mutate storage.
    pub fn get_state(env: Env) -> EscrowState {
        env.storage().instance().get(&DataKey::State).unwrap()
    }

    /// Returns the USDC amount recorded at deposit time (7-decimal integer).
    /// Remains set even after release/refund so the history is preserved on-chain.
    pub fn get_amount(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Amount).unwrap()
    }
}

// Include the test module only when running `cargo test`
#[cfg(test)]
mod test;