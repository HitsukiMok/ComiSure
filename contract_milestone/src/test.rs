// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ComiSure Milestone Contract — Unit Tests (Initialization + Deposit)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

#[cfg(test)]
mod tests {
    use crate::{MilestoneContract, MilestoneContractClient, MilestoneContractState, MilestoneEntry, MilestoneStatus};
    use soroban_sdk::{
        testutils::Address as _,
        testutils::Ledger as _,
        token, Address, Env, Symbol, Vec,
    };

    // ── Helpers ───────────────────────────────────────────────────────────────

    /// Build a MilestoneEntry from a str label and percentage.
    fn entry(env: &Env, label: &str, pct: u32) -> MilestoneEntry {
        MilestoneEntry {
            label: Symbol::new(env, label),
            percentage: pct,
            status: MilestoneStatus::Pending,
        }
    }

    /// Standard 2-milestone config (60/40).
    fn milestones_2(env: &Env) -> Vec<MilestoneEntry> {
        let mut v = Vec::new(env);
        v.push_back(entry(env, "sketch", 60));
        v.push_back(entry(env, "final", 40));
        v
    }

    /// Standard 5-milestone config.
    fn milestones_5(env: &Env) -> Vec<MilestoneEntry> {
        let mut v = Vec::new(env);
        v.push_back(entry(env, "sketch", 20));
        v.push_back(entry(env, "lineart", 20));
        v.push_back(entry(env, "color", 20));
        v.push_back(entry(env, "shading", 20));
        v.push_back(entry(env, "final", 20));
        v
    }

    /// Standard 10-milestone config (all 10%).
    fn milestones_10(env: &Env) -> Vec<MilestoneEntry> {
        let mut v = Vec::new(env);
        let labels = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10"];
        for l in labels {
            v.push_back(entry(env, l, 10));
        }
        v
    }

    #[allow(dead_code)]
    struct Setup {
        env: Env,
        contract_id: Address,
        contract: MilestoneContractClient<'static>,
        client: Address,
        artist: Address,
        admin: Address,
        token_id: Address,
    }

    /// Deploy the milestone contract AND initialize with a 2-milestone config.
    /// Returns a fully funded-ready environment.
    fn setup_initialized() -> Setup {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_000_000);

        let client = Address::generate(&env);
        let artist = Address::generate(&env);
        let admin = Address::generate(&env);
        let token_admin = Address::generate(&env);

        // Mock USDC token
        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let asset_admin = token::StellarAssetClient::new(&env, &token_id);
        asset_admin.mint(&client, &100_000_0000000_i128);

        // Deploy milestone contract
        let contract_id = env.register(MilestoneContract, ());
        let contract = MilestoneContractClient::new(&env, &contract_id);

        let deadline: u64 = 1_000_000 + (14 * 86_400);
        let milestones = milestones_2(&env);

        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);

        Setup { env, contract_id, contract, client, artist, admin, token_id }
    }

    /// Deploy the milestone contract WITHOUT initializing — for initialization tests.
    fn setup_bare() -> (Env, Address, MilestoneContractClient<'static>, Address, Address, Address, Address) {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_000_000);

        let client = Address::generate(&env);
        let artist = Address::generate(&env);
        let admin = Address::generate(&env);
        let token_admin = Address::generate(&env);

        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let asset_admin = token::StellarAssetClient::new(&env, &token_id);
        asset_admin.mint(&client, &100_000_0000000_i128);

        let contract_id = env.register(MilestoneContract, ());
        let contract = MilestoneContractClient::new(&env, &contract_id);

        (env, contract_id, contract, client, artist, admin, token_id)
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // INITIALIZATION TESTS (Requirements 1.1–1.8)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    #[test]
    fn test_init_valid_2_milestones() {
        let (env, _id, contract, client, artist, admin, token_id) = setup_bare();
        let deadline: u64 = 1_000_000 + (14 * 86_400);
        let milestones = milestones_2(&env);

        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);

        assert_eq!(contract.get_state(), MilestoneContractState::Pending);
        let stored = contract.get_milestones();
        assert_eq!(stored.len(), 2);
        assert_eq!(stored.get(0).unwrap().percentage, 60);
        assert_eq!(stored.get(1).unwrap().percentage, 40);
        assert_eq!(stored.get(0).unwrap().status, MilestoneStatus::Pending);
        assert_eq!(stored.get(1).unwrap().status, MilestoneStatus::Pending);
    }

    #[test]
    fn test_init_valid_5_milestones() {
        let (env, _id, contract, client, artist, admin, token_id) = setup_bare();
        let deadline: u64 = 1_000_000 + (14 * 86_400);
        let milestones = milestones_5(&env);

        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);

        assert_eq!(contract.get_state(), MilestoneContractState::Pending);
        assert_eq!(contract.get_milestones().len(), 5);
    }

    #[test]
    fn test_init_valid_10_milestones() {
        let (env, _id, contract, client, artist, admin, token_id) = setup_bare();
        let deadline: u64 = 1_000_000 + (14 * 86_400);
        let milestones = milestones_10(&env);

        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);

        assert_eq!(contract.get_state(), MilestoneContractState::Pending);
        assert_eq!(contract.get_milestones().len(), 10);
    }

    #[test]
    #[should_panic(expected = "milestone count must be between 2 and 10")]
    fn test_init_reject_1_milestone() {
        let (env, _id, contract, client, artist, admin, token_id) = setup_bare();
        let deadline: u64 = 1_000_000 + (14 * 86_400);
        let mut milestones = Vec::new(&env);
        milestones.push_back(entry(&env, "only", 100));

        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
    }

    #[test]
    #[should_panic(expected = "milestone count must be between 2 and 10")]
    fn test_init_reject_11_milestones() {
        let (env, _id, contract, client, artist, admin, token_id) = setup_bare();
        let deadline: u64 = 1_000_000 + (14 * 86_400);
        let mut milestones = Vec::new(&env);
        let labels = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
        for (i, l) in labels.iter().enumerate() {
            milestones.push_back(MilestoneEntry {
                label: Symbol::new(&env, l),
                percentage: if i < 10 { 9 } else { 10 },
                status: MilestoneStatus::Pending,
            });
        }

        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
    }

    #[test]
    #[should_panic(expected = "milestone percentages must sum to 100")]
    fn test_init_reject_sum_not_100() {
        let (env, _id, contract, client, artist, admin, token_id) = setup_bare();
        let deadline: u64 = 1_000_000 + (14 * 86_400);
        let mut milestones = Vec::new(&env);
        milestones.push_back(entry(&env, "sketch", 60));
        milestones.push_back(entry(&env, "final", 30)); // sum = 90, not 100

        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
    }

    #[test]
    #[should_panic(expected = "each milestone percentage must be greater than zero")]
    fn test_init_reject_zero_percentage() {
        let (env, _id, contract, client, artist, admin, token_id) = setup_bare();
        let deadline: u64 = 1_000_000 + (14 * 86_400);
        let mut milestones = Vec::new(&env);
        milestones.push_back(entry(&env, "sketch", 0));
        milestones.push_back(entry(&env, "final", 100));

        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
    }

    #[test]
    #[should_panic(expected = "deadline must be in the future")]
    fn test_init_reject_past_deadline() {
        let (env, _id, contract, client, artist, admin, token_id) = setup_bare();
        // Deadline in the past (ledger is at 1_000_000)
        let deadline: u64 = 999_999;
        let milestones = milestones_2(&env);

        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
    }

    #[test]
    #[should_panic(expected = "contract already initialized")]
    fn test_init_reject_reinit() {
        let (env, _id, contract, client, artist, admin, token_id) = setup_bare();
        let deadline: u64 = 1_000_000 + (14 * 86_400);
        let milestones = milestones_2(&env);

        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
        // Second call should panic
        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // DEPOSIT TESTS (Requirements 2.1–2.5)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    #[test]
    fn test_deposit_valid() {
        let s = setup_initialized();
        let token = token::Client::new(&s.env, &s.token_id);
        let deposit: i128 = 500_0000000;

        s.contract.deposit_funds(&s.client, &deposit);

        assert_eq!(s.contract.get_state(), MilestoneContractState::Funded);
        assert_eq!(s.contract.get_amount(), deposit);
        assert_eq!(token.balance(&s.contract_id), deposit);
    }

    #[test]
    #[should_panic(expected = "only the registered client can deposit funds")]
    fn test_deposit_wrong_caller() {
        let s = setup_initialized();
        // Artist tries to deposit — should panic
        s.contract.deposit_funds(&s.artist, &500_0000000_i128);
    }

    #[test]
    #[should_panic(expected = "deposit only allowed in Pending state")]
    fn test_deposit_wrong_state() {
        let s = setup_initialized();
        // First deposit succeeds
        s.contract.deposit_funds(&s.client, &500_0000000_i128);
        // Second deposit should panic (state is now Funded)
        s.contract.deposit_funds(&s.client, &100_0000000_i128);
    }

    #[test]
    #[should_panic(expected = "deposit amount must be greater than zero")]
    fn test_deposit_zero_amount() {
        let s = setup_initialized();
        s.contract.deposit_funds(&s.client, &0_i128);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // APPROVE MILESTONE TESTS (Requirements 3.1–3.8)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    /// Helper: initialized + funded (2-milestone 60/40, 500 USDC deposit).
    fn setup_funded() -> Setup {
        let s = setup_initialized();
        s.contract.deposit_funds(&s.client, &500_0000000_i128);
        s
    }

    #[test]
    fn test_approve_first_milestone() {
        let s = setup_funded();
        let token = token::Client::new(&s.env, &s.token_id);
        let artist_balance_before = token.balance(&s.artist);

        s.contract.approve_milestone(&s.client, &0);

        // State should be PartiallyReleased (one milestone left)
        assert_eq!(s.contract.get_state(), MilestoneContractState::PartiallyReleased);
        // Released total = 60% of 500_0000000 = 300_0000000
        assert_eq!(s.contract.get_released_total(), 300_0000000_i128);
        // Artist received 300_0000000
        assert_eq!(token.balance(&s.artist), artist_balance_before + 300_0000000_i128);
        // Milestone 0 status is Approved
        let milestones = s.contract.get_milestones();
        assert_eq!(milestones.get(0).unwrap().status, MilestoneStatus::Approved);
        assert_eq!(milestones.get(1).unwrap().status, MilestoneStatus::Pending);
    }

    #[test]
    fn test_approve_all_milestones_released() {
        let s = setup_funded();
        let token = token::Client::new(&s.env, &s.token_id);
        let deposit: i128 = 500_0000000;

        s.contract.approve_milestone(&s.client, &0);
        s.contract.approve_milestone(&s.client, &1);

        // State should be Released
        assert_eq!(s.contract.get_state(), MilestoneContractState::Released);
        // All funds released
        assert_eq!(s.contract.get_released_total(), deposit);
        // Contract balance is zero
        assert_eq!(token.balance(&s.contract_id), 0_i128);
        // Both milestones Approved
        let milestones = s.contract.get_milestones();
        assert_eq!(milestones.get(0).unwrap().status, MilestoneStatus::Approved);
        assert_eq!(milestones.get(1).unwrap().status, MilestoneStatus::Approved);
    }

    #[test]
    fn test_approve_last_milestone_gets_remainder() {
        // Use a 3-milestone config (33/33/34) with amount=1000 to test rounding
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_000_000);

        let client = Address::generate(&env);
        let artist = Address::generate(&env);
        let admin = Address::generate(&env);
        let token_admin = Address::generate(&env);

        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let asset_admin = token::StellarAssetClient::new(&env, &token_id);
        asset_admin.mint(&client, &100_000_i128);

        let contract_id = env.register(MilestoneContract, ());
        let contract = MilestoneContractClient::new(&env, &contract_id);

        let mut milestones = Vec::new(&env);
        milestones.push_back(entry(&env, "sketch", 33));
        milestones.push_back(entry(&env, "color", 33));
        milestones.push_back(entry(&env, "final", 34));

        let deadline: u64 = 1_000_000 + (14 * 86_400);
        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
        contract.deposit_funds(&client, &1000_i128);

        let token_client = token::Client::new(&env, &token_id);

        // Approve first two (non-last) — each gets (1000 * 33) / 100 = 330
        contract.approve_milestone(&client, &0);
        assert_eq!(contract.get_released_total(), 330_i128);

        contract.approve_milestone(&client, &1);
        assert_eq!(contract.get_released_total(), 660_i128);

        // Approve last — should get remainder: 1000 - 660 = 340 (not 34% = 340, but via remainder logic)
        contract.approve_milestone(&client, &2);
        assert_eq!(contract.get_released_total(), 1000_i128);
        assert_eq!(token_client.balance(&contract_id), 0_i128);
        assert_eq!(contract.get_state(), MilestoneContractState::Released);
    }

    #[test]
    #[should_panic(expected = "only the client can approve milestones")]
    fn test_approve_wrong_caller() {
        let s = setup_funded();
        // Artist tries to approve — should panic
        s.contract.approve_milestone(&s.artist, &0);
    }

    #[test]
    #[should_panic(expected = "approve only allowed in Funded or PartiallyReleased state")]
    fn test_approve_wrong_state() {
        // Contract is initialized but NOT funded (state = Pending)
        let s = setup_initialized();
        s.contract.approve_milestone(&s.client, &0);
    }

    #[test]
    #[should_panic(expected = "milestone index out of range")]
    fn test_approve_invalid_index() {
        let s = setup_funded();
        // Only 2 milestones (indices 0, 1), try index 5
        s.contract.approve_milestone(&s.client, &5);
    }

    #[test]
    #[should_panic(expected = "milestone already approved")]
    fn test_approve_already_approved() {
        let s = setup_funded();
        s.contract.approve_milestone(&s.client, &0);
        // Approve same index again — should panic
        s.contract.approve_milestone(&s.client, &0);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ADMIN REFUND TESTS (Requirements 4.1–4.3, 4.7–4.8)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    #[test]
    fn test_admin_refund_funded() {
        let s = setup_funded();
        let token = token::Client::new(&s.env, &s.token_id);
        let client_balance_before = token.balance(&s.client);

        s.contract.admin_refund(&s.admin);

        // Client gets full deposit back
        assert_eq!(token.balance(&s.client), client_balance_before + 500_0000000_i128);
        // Contract balance is zero
        assert_eq!(token.balance(&s.contract_id), 0_i128);
        // State is Refunded
        assert_eq!(s.contract.get_state(), MilestoneContractState::Refunded);
        // All milestones are Refunded
        let milestones = s.contract.get_milestones();
        assert_eq!(milestones.get(0).unwrap().status, MilestoneStatus::Refunded);
        assert_eq!(milestones.get(1).unwrap().status, MilestoneStatus::Refunded);
    }

    #[test]
    fn test_admin_refund_partially_released() {
        let s = setup_funded();
        let token = token::Client::new(&s.env, &s.token_id);

        // Approve milestone 0 (60%) — releases 300_0000000 to artist
        s.contract.approve_milestone(&s.client, &0);
        let client_balance_before = token.balance(&s.client);

        s.contract.admin_refund(&s.admin);

        // Client gets unreleased portion (40% = 200_0000000)
        assert_eq!(token.balance(&s.client), client_balance_before + 200_0000000_i128);
        // Contract balance is zero
        assert_eq!(token.balance(&s.contract_id), 0_i128);
        // State is Refunded
        assert_eq!(s.contract.get_state(), MilestoneContractState::Refunded);
        // Milestone 0 stays Approved, milestone 1 is Refunded
        let milestones = s.contract.get_milestones();
        assert_eq!(milestones.get(0).unwrap().status, MilestoneStatus::Approved);
        assert_eq!(milestones.get(1).unwrap().status, MilestoneStatus::Refunded);
    }

    #[test]
    #[should_panic(expected = "only the admin can perform this action")]
    fn test_admin_refund_wrong_caller() {
        let s = setup_funded();
        // Client tries admin_refund — should panic
        s.contract.admin_refund(&s.client);
    }

    #[test]
    #[should_panic(expected = "action only allowed in Funded or PartiallyReleased state")]
    fn test_admin_refund_wrong_state() {
        // Contract is initialized but NOT funded (state = Pending)
        let s = setup_initialized();
        s.contract.admin_refund(&s.admin);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ADMIN FORCE RELEASE TESTS (Requirements 4.4–4.6, 4.7–4.8)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    #[test]
    fn test_admin_force_release_funded() {
        let s = setup_funded();
        let token = token::Client::new(&s.env, &s.token_id);
        let artist_balance_before = token.balance(&s.artist);

        s.contract.admin_force_release(&s.admin);

        // Artist gets full deposit
        assert_eq!(token.balance(&s.artist), artist_balance_before + 500_0000000_i128);
        // Contract balance is zero
        assert_eq!(token.balance(&s.contract_id), 0_i128);
        // State is Released
        assert_eq!(s.contract.get_state(), MilestoneContractState::Released);
        // All milestones are Approved
        let milestones = s.contract.get_milestones();
        assert_eq!(milestones.get(0).unwrap().status, MilestoneStatus::Approved);
        assert_eq!(milestones.get(1).unwrap().status, MilestoneStatus::Approved);
        // Released total equals full deposit
        assert_eq!(s.contract.get_released_total(), 500_0000000_i128);
    }

    #[test]
    fn test_admin_force_release_partially_released() {
        let s = setup_funded();
        let token = token::Client::new(&s.env, &s.token_id);

        // Approve milestone 0 (60%) — releases 300_0000000 to artist
        s.contract.approve_milestone(&s.client, &0);
        let artist_balance_before = token.balance(&s.artist);

        s.contract.admin_force_release(&s.admin);

        // Artist gets unreleased portion (40% = 200_0000000)
        assert_eq!(token.balance(&s.artist), artist_balance_before + 200_0000000_i128);
        // Contract balance is zero
        assert_eq!(token.balance(&s.contract_id), 0_i128);
        // State is Released
        assert_eq!(s.contract.get_state(), MilestoneContractState::Released);
        // Both milestones are Approved
        let milestones = s.contract.get_milestones();
        assert_eq!(milestones.get(0).unwrap().status, MilestoneStatus::Approved);
        assert_eq!(milestones.get(1).unwrap().status, MilestoneStatus::Approved);
        // Released total equals full deposit
        assert_eq!(s.contract.get_released_total(), 500_0000000_i128);
    }

    #[test]
    #[should_panic(expected = "only the admin can perform this action")]
    fn test_admin_force_release_wrong_caller() {
        let s = setup_funded();
        // Client tries admin_force_release — should panic
        s.contract.admin_force_release(&s.client);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CLIENT REFUND EXPIRED TESTS (Requirements 5.1–5.6)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    #[test]
    fn test_client_refund_after_deadline() {
        let s = setup_funded();
        let token = token::Client::new(&s.env, &s.token_id);
        let client_balance_before = token.balance(&s.client);

        // Advance timestamp past the deadline (deadline = 1_000_000 + 14*86_400 = 2_209_600)
        s.env.ledger().set_timestamp(2_209_601);

        s.contract.client_refund_expired(&s.client);

        // Client gets full deposit back
        assert_eq!(token.balance(&s.client), client_balance_before + 500_0000000_i128);
        // Contract balance is zero
        assert_eq!(token.balance(&s.contract_id), 0_i128);
        // State is Refunded
        assert_eq!(s.contract.get_state(), MilestoneContractState::Refunded);
        // All milestones are Refunded
        let milestones = s.contract.get_milestones();
        assert_eq!(milestones.get(0).unwrap().status, MilestoneStatus::Refunded);
        assert_eq!(milestones.get(1).unwrap().status, MilestoneStatus::Refunded);
    }

    #[test]
    #[should_panic(expected = "deadline has not passed yet")]
    fn test_client_refund_before_deadline() {
        let s = setup_funded();
        // Timestamp is still 1_000_000, deadline is 2_209_600 — not expired
        s.contract.client_refund_expired(&s.client);
    }

    #[test]
    #[should_panic(expected = "only the client can claim an expired refund")]
    fn test_client_refund_wrong_caller() {
        let s = setup_funded();
        s.env.ledger().set_timestamp(2_209_601);
        // Artist tries to claim expired refund — should panic
        s.contract.client_refund_expired(&s.artist);
    }
}
