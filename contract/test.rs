// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ComiSure — Test Suite
// Exactly 3 tests as specified:
//   1. Happy path   — deposit → approve_release → artist receives funds
//   2. Edge case    — unauthorized wallet calls approve_release → rejected
//   3. State check  — storage reflects Funded state and correct amount after deposit
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#[cfg(test)]
mod tests {
    use crate::{ComiSureContract, ComiSureContractClient, EscrowState};
    use soroban_sdk::{
        testutils::Address as _, // gives Address::generate(&env)
        token, Address, Env,
    };

    // ── Shared test scaffold ──────────────────────────────────────────────────
    // Returns a fully initialized environment with:
    //   • A mock USDC token (Stellar Asset Contract) with 10,000 USDC minted to the client
    //   • A deployed ComiSure contract already past the initialize() call
    //   • Individual wallet addresses for client, artist, and admin
    //
    // Using 7-decimal USDC precision throughout:
    //   1 USDC = 1_000_0000 (10_000_000 stroops equivalent)
    fn setup() -> (
        Env,
        Address, // comi_sure contract id
        Address, // client wallet
        Address, // artist wallet
        Address, // admin wallet
        Address, // USDC token contract id
    ) {
        let env = Env::default();

        // mock_all_auths() allows require_auth() to pass for any address in tests.
        // Our explicit `caller != registered_address` guards are what we rely on for
        // access-control assertions (see Test 2), making this safe for most tests.
        env.mock_all_auths();

        // Generate four independent test wallets
        let client_addr = Address::generate(&env);
        let artist_addr = Address::generate(&env);
        let admin_addr = Address::generate(&env);
        let token_admin = Address::generate(&env);

        // Deploy a mock Stellar Asset Contract to simulate USDC on testnet
        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone())
            .address();
        let asset_admin_client = token::StellarAssetClient::new(&env, &token_id);

        // Mint 10,000 USDC (7 decimals) to the client so they can fund commissions
        asset_admin_client.mint(&client_addr, &100_000_0000000_i128);

        // Deploy the ComiSure escrow contract
        let contract_id = env.register(ComiSureContract, ());
        let contract = ComiSureContractClient::new(&env, &contract_id);

        // One-time initialization — wires up participants and the USDC token address
        contract.initialize(&client_addr, &artist_addr, &admin_addr, &token_id);

        (env, contract_id, client_addr, artist_addr, admin_addr, token_id)
    }

    // ── Test 1: Happy Path ────────────────────────────────────────────────────
    /// Simulates the normal commission lifecycle end-to-end:
    ///   client deposits USDC → artist delivers work → client approves → artist receives funds.
    ///
    /// Assertions:
    ///   - Token balance of the contract equals the deposit amount immediately after deposit.
    ///   - Artist balance is 0 before approval (funds are locked, not yet released).
    ///   - After approve_release, artist balance equals the deposit amount exactly.
    ///   - Contract balance drops to 0 after release (no funds retained).
    ///   - Contract state transitions to Released.
    #[test]
    fn test_happy_path_deposit_and_approve_release() {
        let (env, contract_id, client, artist, _admin, token_id) = setup();
        let contract = ComiSureContractClient::new(&env, &contract_id);
        let token = token::Client::new(&env, &token_id);

        // 500 USDC in 7-decimal representation (₱27,500 at ~₱55/USD — well within commission range)
        let deposit_amount: i128 = 500_0000000;

        // ── Phase 1: Deposit ──────────────────────────────────────────────────
        contract.deposit_funds(&client, &deposit_amount);

        // Contract must hold the exact deposit; artist wallet must still be empty
        assert_eq!(
            token.balance(&contract_id),
            deposit_amount,
            "escrow contract should hold the full deposit"
        );
        assert_eq!(
            token.balance(&artist),
            0,
            "artist should not receive funds before approval"
        );

        // ── Phase 2: Approve release (artist delivered the artwork) ───────────
        contract.approve_release(&client);

        // Artist wallet must receive the full amount with no deduction
        assert_eq!(
            token.balance(&artist),
            deposit_amount,
            "artist should receive the full deposited amount after approval"
        );
        // Contract must be drained — no funds retained or lost
        assert_eq!(
            token.balance(&contract_id),
            0,
            "escrow contract should hold zero USDC after release"
        );
        // State must be Released — escrow lifecycle is complete
        assert_eq!(
            contract.get_state(),
            EscrowState::Released,
            "state should be Released after approve_release"
        );
    }

    // ── Test 2: Unauthorized Access ───────────────────────────────────────────
    /// Verifies that a wallet that is NOT the registered client cannot call approve_release.
    ///
    /// Scenario:
    ///   An impatient or malicious artist tries to call approve_release themselves
    ///   to collect payment without client confirmation. The contract must reject this.
    ///
    /// Implementation note:
    ///   env.mock_all_auths() makes require_auth() pass for any address, so our
    ///   security relies on the explicit `caller != client` address comparison inside
    ///   approve_release(). Passing `artist_addr` as the caller triggers that guard.
    ///
    /// Expected outcome: panic with "only the client can approve"
    #[test]
    #[should_panic(expected = "only the client can approve")]
    fn test_unauthorized_wallet_cannot_call_approve_release() {
        let (env, contract_id, client, artist, _admin, _token_id) = setup();
        let contract = ComiSureContractClient::new(&env, &contract_id);

        // First, put the escrow in Funded state (client deposits legitimately)
        contract.deposit_funds(&client, &300_0000000_i128);

        // Artist now attempts to self-approve the release using their own address.
        // This should panic because the contract checks caller == registered_client.
        contract.approve_release(&artist); // ← artist ≠ client → panic expected
    }

    // ── Test 3: State and Balance Verification After Deposit ─────────────────
    /// Confirms that contract storage is correctly updated immediately after deposit_funds:
    ///   - EscrowState transitions from Pending to Funded.
    ///   - The amount recorded in contract storage matches the deposit precisely.
    ///   - The USDC token balance on the contract address matches the deposit.
    ///
    /// This test validates the atomicity of the deposit operation:
    ///   the state flip, the storage write, and the token transfer all happen together
    ///   or not at all (Soroban's transactional execution guarantees this).
    #[test]
    fn test_state_and_balance_are_correct_after_deposit() {
        let (env, contract_id, client, _artist, _admin, token_id) = setup();
        let contract = ComiSureContractClient::new(&env, &contract_id);
        let token = token::Client::new(&env, &token_id);

        // 750 USDC — representative of a mid-tier Filipino art commission
        let deposit_amount: i128 = 750_0000000;

        // Execute the deposit
        contract.deposit_funds(&client, &deposit_amount);

        // ── Storage state check ───────────────────────────────────────────────
        assert_eq!(
            contract.get_state(),
            EscrowState::Funded,
            "state must transition to Funded immediately after deposit"
        );

        // ── Storage amount check ──────────────────────────────────────────────
        assert_eq!(
            contract.get_amount(),
            deposit_amount,
            "contract storage must record the exact deposited amount"
        );

        // ── Token balance check ───────────────────────────────────────────────
        assert_eq!(
            token.balance(&contract_id),
            deposit_amount,
            "USDC token balance on the contract address must equal the deposit"
        );
    }
}