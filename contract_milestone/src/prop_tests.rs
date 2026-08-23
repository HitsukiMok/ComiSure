// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ComiSure Milestone Contract — Property-Based Tests
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

extern crate std;

use crate::{MilestoneContract, MilestoneContractClient, MilestoneContractState, MilestoneEntry, MilestoneStatus};
use proptest::prelude::*;
use soroban_sdk::{testutils::Address as _, testutils::Ledger as _, token, Address, Env, Symbol, Vec};
use std::vec::Vec as StdVec;

/// Strategy: generate a valid milestone percentage vector (2–10 entries, each > 0, sum = 100).
///
/// Approach: pick a count in [2, 10], generate `count` random u32 values >= 1,
/// then normalize so they sum to exactly 100 (last entry absorbs the remainder).
fn valid_milestone_percentages() -> impl Strategy<Value = StdVec<u32>> {
    (2usize..=10usize).prop_flat_map(|count| {
        proptest::collection::vec(1u32..=100u32, count).prop_map(|raw| {
            let sum: u64 = raw.iter().map(|&v| v as u64).sum();
            let len = raw.len();

            // Scale each value proportionally, ensuring minimum of 1
            let mut normalized: StdVec<u32> = raw
                .iter()
                .map(|&v| core::cmp::max(1, ((v as u64) * 100 / sum) as u32))
                .collect();

            // Adjust last entry so total sums to exactly 100
            let current_sum: u32 = normalized.iter().sum();
            let last = len - 1;
            if current_sum <= 100 {
                normalized[last] += 100 - current_sum;
            } else {
                let excess = current_sum - 100;
                if normalized[last] > excess + 1 {
                    normalized[last] -= excess;
                } else {
                    // Fallback: even distribution
                    let base = 100 / len as u32;
                    let leftover = 100 - base * len as u32;
                    for i in 0..len {
                        normalized[i] = base + if i == last { leftover } else { 0 };
                    }
                }
            }

            normalized
        })
    })
}

/// Strategy: generate a random permutation of indices [0, count).
fn random_permutation(count: usize) -> impl Strategy<Value = StdVec<u32>> {
    Just((0..count as u32).collect::<StdVec<u32>>()).prop_shuffle()
}

// ── Property 1: Milestone percentages invariant ──────────────────────────────
// **Validates: Requirements 1.2, 1.5**
//
// For any valid milestone configuration (2–10 milestones, each percentage > 0,
// sum = 100), after initialize, get_milestones returns entries with:
//   - length matching input
//   - all percentages summing to exactly 100
//   - all statuses = Pending
//   - each percentage matching what was passed in

proptest! {
    #[test]
    fn prop_milestone_percentages_sum_to_100(percentages in valid_milestone_percentages()) {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_000_000);

        let client = Address::generate(&env);
        let artist = Address::generate(&env);
        let admin = Address::generate(&env);

        let contract_id = env.register(MilestoneContract, ());
        let contract = MilestoneContractClient::new(&env, &contract_id);

        // Build milestone entries from generated percentages
        let mut milestones = Vec::new(&env);
        for (i, pct) in percentages.iter().enumerate() {
            let label_str = std::format!("m{}", i);
            milestones.push_back(MilestoneEntry {
                label: Symbol::new(&env, &label_str),
                percentage: *pct,
                status: MilestoneStatus::Pending,
            });
        }

        let deadline: u64 = 1_000_000 + (14 * 86_400);
        // Use `client` address as the token param — we don't need real token for init-only test
        contract.initialize(&client, &artist, &admin, &client, &deadline, &milestones);

        // Verify: get_milestones returns the correct data
        let stored = contract.get_milestones();

        // Length matches
        prop_assert_eq!(stored.len(), percentages.len() as u32);

        // All percentages sum to 100 and each matches input, all statuses Pending
        let mut sum: u32 = 0;
        for i in 0..stored.len() {
            let entry = stored.get(i).unwrap();
            prop_assert_eq!(entry.percentage, percentages[i as usize]);
            prop_assert_eq!(entry.status, MilestoneStatus::Pending);
            sum += entry.percentage;
        }
        prop_assert_eq!(sum, 100u32);
    }
}


// ── Property 3: Partial release conservation ─────────────────────────────────
// **Validates: Requirements 3.1, 3.3**
//
// For any valid milestone configuration, any positive deposit amount, and any
// ordering in which milestones are approved:
//   - The sum of all releases (get_released_total) equals the deposited amount
//   - Contract state is Released
//   - Contract token balance is zero

proptest! {
    #[test]
    fn prop_partial_release_conservation(
        percentages in valid_milestone_percentages(),
        deposit_amount in 1_000i128..1_000_000_000i128,
    ) {
        let count = percentages.len();
        // We generate the permutation inline based on count
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_000_000);

        let client = Address::generate(&env);
        let artist = Address::generate(&env);
        let admin = Address::generate(&env);
        let token_admin = Address::generate(&env);

        // Register a real Stellar asset token and mint enough for the client
        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let asset_admin = token::StellarAssetClient::new(&env, &token_id);
        asset_admin.mint(&client, &(deposit_amount * 2)); // extra headroom

        let contract_id = env.register(MilestoneContract, ());
        let contract = MilestoneContractClient::new(&env, &contract_id);

        // Build milestone entries
        let mut milestones = Vec::new(&env);
        for (i, pct) in percentages.iter().enumerate() {
            let label_str = std::format!("m{}", i);
            milestones.push_back(MilestoneEntry {
                label: Symbol::new(&env, &label_str),
                percentage: *pct,
                status: MilestoneStatus::Pending,
            });
        }

        let deadline: u64 = 1_000_000 + (14 * 86_400);
        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
        contract.deposit_funds(&client, &deposit_amount);

        // Approve all milestones in sequential order (0..count).
        // proptest's prop_shuffle requires a flat_map context; instead we approve
        // sequentially which still validates conservation for any config.
        // The last-milestone remainder logic is the critical path regardless of order.
        for idx in 0..count as u32 {
            contract.approve_milestone(&client, &idx);
        }

        // Assert: released total == deposit amount
        let released = contract.get_released_total();
        prop_assert_eq!(released, deposit_amount, "released total must equal deposit");

        // Assert: contract state == Released
        let state = contract.get_state();
        prop_assert_eq!(state, MilestoneContractState::Released);

        // Assert: contract token balance == 0
        let token_client = token::Client::new(&env, &token_id);
        let contract_balance = token_client.balance(&contract_id);
        prop_assert_eq!(contract_balance, 0i128, "contract balance must be zero");
    }
}

// ── Property 5: State machine progression ────────────────────────────────────
// **Validates: Requirements 3.3, 3.4, 3.7, 4.3, 4.6, 4.8**
//
// For any valid milestone configuration and any random sequence of operations,
// the contract state SHALL only transition through valid paths:
//   Pending → Funded → [PartiallyReleased]* → Released
//   or Funded/PartiallyReleased → Refunded
// No other transitions SHALL occur.

/// Enum representing possible operations to attempt on the contract.
#[derive(Debug, Clone)]
enum ContractOp {
    Deposit,
    ApproveIdx(u32),
    AdminRefund,
    AdminForceRelease,
    ClientRefundExpired,
}

/// Strategy: generate a random sequence of operations (5–20 ops).
fn random_ops(max_index: u32) -> impl Strategy<Value = StdVec<ContractOp>> {
    let op_strategy = prop_oneof![
        1 => Just(ContractOp::Deposit),
        5 => (0..max_index).prop_map(ContractOp::ApproveIdx),
        1 => Just(ContractOp::AdminRefund),
        1 => Just(ContractOp::AdminForceRelease),
        1 => Just(ContractOp::ClientRefundExpired),
    ];
    proptest::collection::vec(op_strategy, 5..=20)
}

/// Check whether a state transition is valid per the state machine spec.
fn is_valid_transition(from: &MilestoneContractState, to: &MilestoneContractState) -> bool {
    use MilestoneContractState::*;
    matches!(
        (from, to),
        (Pending, Funded)
            | (Funded, PartiallyReleased)
            | (Funded, Released)
            | (Funded, Refunded)
            | (PartiallyReleased, PartiallyReleased)
            | (PartiallyReleased, Released)
            | (PartiallyReleased, Refunded)
    )
}

proptest! {
    #![proptest_config(proptest::test_runner::Config::with_cases(100))]
    #[test]
    fn prop_state_machine_progression(
        percentages in valid_milestone_percentages(),
        deposit_amount in 1_000i128..1_000_000_000i128,
    ) {
        let count = percentages.len() as u32;

        // Generate ops inline using a TestRunner since we can't nest prop_flat_map easily here.
        // Instead, we use a deterministic approach: build a fixed random-ish op sequence
        // from the deposit_amount as a seed for variety.
        let mut ops: StdVec<ContractOp> = StdVec::new();
        // Always start with a deposit to make the test interesting
        ops.push(ContractOp::Deposit);
        // Generate a mix of operations based on deposit_amount bits for variety
        let seed = deposit_amount as u64;
        for i in 0..15u64 {
            let val = (seed.wrapping_mul(6364136223846793005).wrapping_add(i * 7)) % 9;
            let op = match val {
                0 => ContractOp::Deposit,
                1..=5 => ContractOp::ApproveIdx((val as u32 - 1) % count),
                6 => ContractOp::AdminRefund,
                7 => ContractOp::AdminForceRelease,
                8 => ContractOp::ClientRefundExpired,
                _ => ContractOp::Deposit,
            };
            ops.push(op);
        }

        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_000_000);

        let client = Address::generate(&env);
        let artist = Address::generate(&env);
        let admin = Address::generate(&env);
        let token_admin = Address::generate(&env);

        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let asset_admin = token::StellarAssetClient::new(&env, &token_id);
        asset_admin.mint(&client, &(deposit_amount * 2));

        let contract_id = env.register(MilestoneContract, ());
        let contract = MilestoneContractClient::new(&env, &contract_id);

        // Build milestone entries
        let mut milestones = Vec::new(&env);
        for (i, pct) in percentages.iter().enumerate() {
            let label_str = std::format!("m{}", i);
            milestones.push_back(MilestoneEntry {
                label: Symbol::new(&env, &label_str),
                percentage: *pct,
                status: MilestoneStatus::Pending,
            });
        }

        let deadline: u64 = 1_000_000 + (14 * 86_400);
        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);

        // Track state transitions
        let mut prev_state = MilestoneContractState::Pending;

        for op in &ops {
            let result = match op {
                ContractOp::Deposit => {
                    contract.try_deposit_funds(&client, &deposit_amount)
                }
                ContractOp::ApproveIdx(idx) => {
                    contract.try_approve_milestone(&client, idx)
                }
                ContractOp::AdminRefund => {
                    contract.try_admin_refund(&admin)
                }
                ContractOp::AdminForceRelease => {
                    contract.try_admin_force_release(&admin)
                }
                ContractOp::ClientRefundExpired => {
                    // Advance time past deadline for this op
                    env.ledger().set_timestamp(deadline + 1);
                    let r = contract.try_client_refund_expired(&client);
                    // Reset time (doesn't matter for subsequent ops, but keeps things clean)
                    env.ledger().set_timestamp(1_000_000);
                    r
                }
            };

            // If the operation succeeded, verify the state transition is valid
            if result.is_ok() {
                let new_state = contract.get_state();
                if new_state != prev_state {
                    let valid = is_valid_transition(&prev_state, &new_state);
                    prop_assert!(
                        valid,
                        "Invalid state transition: {:?} -> {:?} after {:?}",
                        prev_state, new_state, op
                    );
                    prev_state = new_state;
                }
            }
            // If it failed, state should be unchanged
            else {
                let unchanged_state = contract.get_state();
                prop_assert!(
                    unchanged_state == prev_state,
                    "State changed after failed op {:?}: {:?} -> {:?}",
                    op, prev_state, unchanged_state
                );
            }
        }

        // Final state must be one of the valid states
        let final_state = contract.get_state();
        prop_assert!(
            matches!(
                final_state,
                MilestoneContractState::Pending
                    | MilestoneContractState::Funded
                    | MilestoneContractState::PartiallyReleased
                    | MilestoneContractState::Released
                    | MilestoneContractState::Refunded
            ),
            "Final state {:?} is not a valid contract state",
            final_state
        );
    }
}

// ── Property 5 variant: with truly random op sequences via prop_flat_map ─────

proptest! {
    #![proptest_config(proptest::test_runner::Config::with_cases(100))]
    #[test]
    fn prop_state_machine_progression_random_ops(
        input in valid_milestone_percentages().prop_flat_map(|p| {
            let count = p.len() as u32;
            (Just(p), random_ops(count))
        }),
        deposit_amount in 1_000i128..1_000_000_000i128,
    ) {
        let (percentages, ops) = input;
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_000_000);

        let client = Address::generate(&env);
        let artist = Address::generate(&env);
        let admin = Address::generate(&env);
        let token_admin = Address::generate(&env);

        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let asset_admin = token::StellarAssetClient::new(&env, &token_id);
        asset_admin.mint(&client, &(deposit_amount * 2));

        let contract_id = env.register(MilestoneContract, ());
        let contract = MilestoneContractClient::new(&env, &contract_id);

        let mut milestones = Vec::new(&env);
        for (i, pct) in percentages.iter().enumerate() {
            let label_str = std::format!("m{}", i);
            milestones.push_back(MilestoneEntry {
                label: Symbol::new(&env, &label_str),
                percentage: *pct,
                status: MilestoneStatus::Pending,
            });
        }

        let deadline: u64 = 1_000_000 + (14 * 86_400);
        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);

        let mut prev_state = MilestoneContractState::Pending;

        for op in &ops {
            let result = match op {
                ContractOp::Deposit => {
                    contract.try_deposit_funds(&client, &deposit_amount)
                }
                ContractOp::ApproveIdx(idx) => {
                    contract.try_approve_milestone(&client, idx)
                }
                ContractOp::AdminRefund => {
                    contract.try_admin_refund(&admin)
                }
                ContractOp::AdminForceRelease => {
                    contract.try_admin_force_release(&admin)
                }
                ContractOp::ClientRefundExpired => {
                    env.ledger().set_timestamp(deadline + 1);
                    let r = contract.try_client_refund_expired(&client);
                    env.ledger().set_timestamp(1_000_000);
                    r
                }
            };

            if result.is_ok() {
                let new_state = contract.get_state();
                if new_state != prev_state {
                    let valid = is_valid_transition(&prev_state, &new_state);
                    prop_assert!(
                        valid,
                        "Invalid state transition: {:?} -> {:?} after {:?}",
                        prev_state, new_state, op
                    );
                    prev_state = new_state;
                }
            } else {
                let unchanged_state = contract.get_state();
                prop_assert!(
                    unchanged_state == prev_state,
                    "State changed after failed op {:?}: {:?} -> {:?}",
                    op, prev_state, unchanged_state
                );
            }
        }

        let final_state = contract.get_state();
        prop_assert!(
            matches!(
                final_state,
                MilestoneContractState::Pending
                    | MilestoneContractState::Funded
                    | MilestoneContractState::PartiallyReleased
                    | MilestoneContractState::Released
                    | MilestoneContractState::Refunded
            ),
            "Final state {:?} is not a valid contract state",
            final_state
        );
    }
}

// Property 3 variant: random approval ordering
// This uses prop_flat_map to generate a permutation based on milestone count.
proptest! {
    #[test]
    fn prop_partial_release_conservation_random_order(
        percentages in valid_milestone_percentages().prop_flat_map(|p| {
            let count = p.len();
            (Just(p), random_permutation(count))
        }),
        deposit_amount in 1_000i128..1_000_000_000i128,
    ) {
        let (percentages, order) = percentages;
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_000_000);

        let client = Address::generate(&env);
        let artist = Address::generate(&env);
        let admin = Address::generate(&env);
        let token_admin = Address::generate(&env);

        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let asset_admin = token::StellarAssetClient::new(&env, &token_id);
        asset_admin.mint(&client, &(deposit_amount * 2));

        let contract_id = env.register(MilestoneContract, ());
        let contract = MilestoneContractClient::new(&env, &contract_id);

        let mut milestones = Vec::new(&env);
        for (i, pct) in percentages.iter().enumerate() {
            let label_str = std::format!("m{}", i);
            milestones.push_back(MilestoneEntry {
                label: Symbol::new(&env, &label_str),
                percentage: *pct,
                status: MilestoneStatus::Pending,
            });
        }

        let deadline: u64 = 1_000_000 + (14 * 86_400);
        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
        contract.deposit_funds(&client, &deposit_amount);

        // Approve in random order
        for &idx in order.iter() {
            contract.approve_milestone(&client, &idx);
        }

        // Assert: released total == deposit amount
        let released = contract.get_released_total();
        prop_assert_eq!(released, deposit_amount, "released total must equal deposit");

        // Assert: contract state == Released
        let state = contract.get_state();
        prop_assert_eq!(state, MilestoneContractState::Released);

        // Assert: contract token balance == 0
        let token_client = token::Client::new(&env, &token_id);
        let contract_balance = token_client.balance(&contract_id);
        prop_assert_eq!(contract_balance, 0i128, "contract balance must be zero");
    }
}


// ── Property 7: Authorization enforcement ────────────────────────────────────
// **Validates: Requirements 2.3, 3.6, 4.7, 5.5**
//
// For any valid milestone configuration and any random attacker address (not
// matching client, artist, or admin), all mutating functions SHALL reject the
// transaction and the contract state SHALL remain unchanged.

proptest! {
    #![proptest_config(proptest::test_runner::Config::with_cases(100))]
    #[test]
    fn prop_auth_enforcement(
        percentages in valid_milestone_percentages(),
        deposit_amount in 1_000i128..1_000_000_000i128,
    ) {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().set_timestamp(1_000_000);

        let client = Address::generate(&env);
        let artist = Address::generate(&env);
        let admin = Address::generate(&env);
        let token_admin = Address::generate(&env);

        let token_id = env.register_stellar_asset_contract_v2(token_admin.clone()).address();
        let asset_admin = token::StellarAssetClient::new(&env, &token_id);
        asset_admin.mint(&client, &(deposit_amount * 2));

        let contract_id = env.register(MilestoneContract, ());
        let contract = MilestoneContractClient::new(&env, &contract_id);

        // Build milestone entries
        let mut milestones = Vec::new(&env);
        for (i, pct) in percentages.iter().enumerate() {
            let label_str = std::format!("m{}", i);
            milestones.push_back(MilestoneEntry {
                label: Symbol::new(&env, &label_str),
                percentage: *pct,
                status: MilestoneStatus::Pending,
            });
        }

        let deadline: u64 = 1_000_000 + (14 * 86_400);
        contract.initialize(&client, &artist, &admin, &token_id, &deadline, &milestones);
        contract.deposit_funds(&client, &deposit_amount);

        // Generate a random attacker address (distinct from client/artist/admin with
        // overwhelming probability since addresses are 32 random bytes)
        let attacker = Address::generate(&env);

        // State after deposit — should be Funded
        let state_before = contract.get_state();
        prop_assert_eq!(state_before, MilestoneContractState::Funded);

        // 1. deposit_funds with attacker (non-client) → should fail
        let result = contract.try_deposit_funds(&attacker, &deposit_amount);
        prop_assert!(result.is_err(), "deposit_funds should reject non-client caller");
        prop_assert_eq!(contract.get_state(), MilestoneContractState::Funded);

        // 2. approve_milestone with attacker (non-client) → should fail
        let result = contract.try_approve_milestone(&attacker, &0u32);
        prop_assert!(result.is_err(), "approve_milestone should reject non-client caller");
        prop_assert_eq!(contract.get_state(), MilestoneContractState::Funded);

        // 3. admin_refund with attacker (non-admin) → should fail
        let result = contract.try_admin_refund(&attacker);
        prop_assert!(result.is_err(), "admin_refund should reject non-admin caller");
        prop_assert_eq!(contract.get_state(), MilestoneContractState::Funded);

        // 4. admin_force_release with attacker (non-admin) → should fail
        let result = contract.try_admin_force_release(&attacker);
        prop_assert!(result.is_err(), "admin_force_release should reject non-admin caller");
        prop_assert_eq!(contract.get_state(), MilestoneContractState::Funded);

        // 5. client_refund_expired with attacker (non-client) → should fail
        //    Advance time past deadline so the only guard that fails is auth, not deadline.
        env.ledger().set_timestamp(deadline + 1);
        let result = contract.try_client_refund_expired(&attacker);
        prop_assert!(result.is_err(), "client_refund_expired should reject non-client caller");
        prop_assert_eq!(contract.get_state(), MilestoneContractState::Funded);

        // Also verify released total is unchanged (no funds leaked)
        let released = contract.get_released_total();
        prop_assert_eq!(released, 0i128, "no funds should have been released");

        // Verify contract token balance is unchanged
        let token_client = token::Client::new(&env, &token_id);
        let contract_balance = token_client.balance(&contract_id);
        prop_assert_eq!(contract_balance, deposit_amount, "contract balance should be unchanged");
    }
}
