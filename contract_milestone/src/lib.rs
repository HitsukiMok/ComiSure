#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, token, Address, Env, Symbol, Vec};

// ── Storage keys ─────────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Client,
    Artist,
    Admin,
    Token,
    Amount,      // Total USDC deposited (i128)
    State,       // MilestoneContractState
    Deadline,    // u64 Unix timestamp
    Milestones,  // Vec<MilestoneEntry>
    Released,    // i128 cumulative released amount
}

// ── Data structures ──────────────────────────────────────────────────────────

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum MilestoneStatus {
    Pending,
    Approved,
    Refunded,
}

#[contracttype]
#[derive(Clone, Debug)]
pub struct MilestoneEntry {
    pub label: Symbol,
    pub percentage: u32,
    pub status: MilestoneStatus,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum MilestoneContractState {
    Pending,
    Funded,
    PartiallyReleased,
    Released,
    Refunded,
}

// ── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct MilestoneContract;

#[contractimpl]
impl MilestoneContract {
    /// One-time setup. Validates milestone config, stores participants and state.
    pub fn initialize(
        env: Env,
        client: Address,
        artist: Address,
        admin: Address,
        token: Address,
        deadline: u64,
        milestones: Vec<MilestoneEntry>,
    ) {
        // Guard: block re-initialization
        if env.storage().persistent().has(&DataKey::State) {
            panic!("contract already initialized");
        }

        // Validate milestone count: 2–10
        let count = milestones.len();
        if count < 2 || count > 10 {
            panic!("milestone count must be between 2 and 10");
        }

        // Validate each percentage > 0 and sum = 100
        let mut sum: u32 = 0;
        for i in 0..count {
            let entry = milestones.get(i).unwrap();
            if entry.percentage == 0 {
                panic!("each milestone percentage must be greater than zero");
            }
            sum += entry.percentage;
        }
        if sum != 100 {
            panic!("milestone percentages must sum to 100");
        }

        // Validate deadline is in the future
        let now = env.ledger().timestamp();
        if deadline <= now {
            panic!("deadline must be in the future");
        }

        // Store all data
        env.storage().persistent().set(&DataKey::Client, &client);
        env.storage().persistent().set(&DataKey::Artist, &artist);
        env.storage().persistent().set(&DataKey::Admin, &admin);
        env.storage().persistent().set(&DataKey::Token, &token);
        env.storage().persistent().set(&DataKey::Deadline, &deadline);
        env.storage().persistent().set(&DataKey::Milestones, &milestones);
        env.storage().persistent().set(&DataKey::State, &MilestoneContractState::Pending);
        env.storage().persistent().set(&DataKey::Amount, &0i128);
        env.storage().persistent().set(&DataKey::Released, &0i128);
    }

    /// Called by the client to lock USDC into the milestone escrow.
    pub fn deposit_funds(env: Env, caller: Address, amount: i128) {
        caller.require_auth();

        // Authorization: only the registered client may deposit
        let client: Address = env.storage().persistent().get(&DataKey::Client).unwrap();
        if caller != client {
            panic!("only the registered client can deposit funds");
        }

        // Validate amount
        if amount <= 0 {
            panic!("deposit amount must be greater than zero");
        }

        // State guard: only Pending
        let state: MilestoneContractState =
            env.storage().persistent().get(&DataKey::State).unwrap();
        if state != MilestoneContractState::Pending {
            panic!("deposit only allowed in Pending state");
        }

        // Transfer USDC from client → contract
        let token_addr: Address = env.storage().persistent().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&caller, &env.current_contract_address(), &amount);

        // Persist amount and advance state
        env.storage().persistent().set(&DataKey::Amount, &amount);
        env.storage().persistent().set(&DataKey::State, &MilestoneContractState::Funded);
    }

    /// Called by the client to approve a milestone and release its share to the artist.
    pub fn approve_milestone(env: Env, caller: Address, index: u32) {
        caller.require_auth();

        // Authorization: only the client
        let client: Address = env.storage().persistent().get(&DataKey::Client).unwrap();
        if caller != client {
            panic!("only the client can approve milestones");
        }

        // State guard: Funded or PartiallyReleased
        let state: MilestoneContractState =
            env.storage().persistent().get(&DataKey::State).unwrap();
        if state != MilestoneContractState::Funded
            && state != MilestoneContractState::PartiallyReleased
        {
            panic!("approve only allowed in Funded or PartiallyReleased state");
        }

        // Validate index
        let mut milestones: Vec<MilestoneEntry> =
            env.storage().persistent().get(&DataKey::Milestones).unwrap();
        if index >= milestones.len() {
            panic!("milestone index out of range");
        }

        // Check milestone not already approved
        let entry = milestones.get(index).unwrap();
        if entry.status == MilestoneStatus::Approved {
            panic!("milestone already approved");
        }

        // Determine if this is the last Pending milestone
        let mut pending_count: u32 = 0;
        for i in 0..milestones.len() {
            if milestones.get(i).unwrap().status == MilestoneStatus::Pending {
                pending_count += 1;
            }
        }
        let is_last_pending = pending_count == 1;

        // Compute release amount
        let total: i128 = env.storage().persistent().get(&DataKey::Amount).unwrap();
        let already_released: i128 = env.storage().persistent().get(&DataKey::Released).unwrap();
        let release_amount = if is_last_pending {
            total - already_released
        } else {
            (total * entry.percentage as i128) / 100
        };

        // Transfer to artist
        let artist: Address = env.storage().persistent().get(&DataKey::Artist).unwrap();
        let token_addr: Address = env.storage().persistent().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &artist, &release_amount);

        // Update milestone status
        let updated_entry = MilestoneEntry {
            label: entry.label,
            percentage: entry.percentage,
            status: MilestoneStatus::Approved,
        };
        milestones.set(index, updated_entry);
        env.storage().persistent().set(&DataKey::Milestones, &milestones);

        // Update released total
        let new_released = already_released + release_amount;
        env.storage().persistent().set(&DataKey::Released, &new_released);

        // Advance state: check if all milestones are now Approved
        let mut all_approved = true;
        for i in 0..milestones.len() {
            if milestones.get(i).unwrap().status != MilestoneStatus::Approved {
                all_approved = false;
                break;
            }
        }

        if all_approved {
            env.storage().persistent().set(&DataKey::State, &MilestoneContractState::Released);
        } else {
            env.storage()
                .persistent()
                .set(&DataKey::State, &MilestoneContractState::PartiallyReleased);
        }
    }

    /// Called by the admin to refund all unreleased funds to the client.
    pub fn admin_refund(env: Env, caller: Address) {
        caller.require_auth();

        let admin: Address = env.storage().persistent().get(&DataKey::Admin).unwrap();
        if caller != admin {
            panic!("only the admin can perform this action");
        }

        let state: MilestoneContractState =
            env.storage().persistent().get(&DataKey::State).unwrap();
        if state != MilestoneContractState::Funded
            && state != MilestoneContractState::PartiallyReleased
        {
            panic!("action only allowed in Funded or PartiallyReleased state");
        }

        let total: i128 = env.storage().persistent().get(&DataKey::Amount).unwrap();
        let released: i128 = env.storage().persistent().get(&DataKey::Released).unwrap();
        let unreleased = total - released;

        // Transfer unreleased to client
        let client: Address = env.storage().persistent().get(&DataKey::Client).unwrap();
        let token_addr: Address = env.storage().persistent().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &client, &unreleased);

        // Mark all Pending milestones as Refunded
        let mut milestones: Vec<MilestoneEntry> =
            env.storage().persistent().get(&DataKey::Milestones).unwrap();
        for i in 0..milestones.len() {
            let entry = milestones.get(i).unwrap();
            if entry.status == MilestoneStatus::Pending {
                milestones.set(
                    i,
                    MilestoneEntry {
                        label: entry.label,
                        percentage: entry.percentage,
                        status: MilestoneStatus::Refunded,
                    },
                );
            }
        }
        env.storage().persistent().set(&DataKey::Milestones, &milestones);
        env.storage().persistent().set(&DataKey::State, &MilestoneContractState::Refunded);
    }

    /// Called by the admin to force-release all unreleased funds to the artist.
    pub fn admin_force_release(env: Env, caller: Address) {
        caller.require_auth();

        let admin: Address = env.storage().persistent().get(&DataKey::Admin).unwrap();
        if caller != admin {
            panic!("only the admin can perform this action");
        }

        let state: MilestoneContractState =
            env.storage().persistent().get(&DataKey::State).unwrap();
        if state != MilestoneContractState::Funded
            && state != MilestoneContractState::PartiallyReleased
        {
            panic!("action only allowed in Funded or PartiallyReleased state");
        }

        let total: i128 = env.storage().persistent().get(&DataKey::Amount).unwrap();
        let released: i128 = env.storage().persistent().get(&DataKey::Released).unwrap();
        let unreleased = total - released;

        // Transfer unreleased to artist
        let artist: Address = env.storage().persistent().get(&DataKey::Artist).unwrap();
        let token_addr: Address = env.storage().persistent().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &artist, &unreleased);

        // Mark all Pending milestones as Approved
        let mut milestones: Vec<MilestoneEntry> =
            env.storage().persistent().get(&DataKey::Milestones).unwrap();
        for i in 0..milestones.len() {
            let entry = milestones.get(i).unwrap();
            if entry.status == MilestoneStatus::Pending {
                milestones.set(
                    i,
                    MilestoneEntry {
                        label: entry.label,
                        percentage: entry.percentage,
                        status: MilestoneStatus::Approved,
                    },
                );
            }
        }
        env.storage().persistent().set(&DataKey::Milestones, &milestones);

        // Update released total and state
        env.storage().persistent().set(&DataKey::Released, &total);
        env.storage().persistent().set(&DataKey::State, &MilestoneContractState::Released);
    }

    /// Called by the client to refund unreleased funds after the deadline has passed.
    pub fn client_refund_expired(env: Env, caller: Address) {
        caller.require_auth();

        let client: Address = env.storage().persistent().get(&DataKey::Client).unwrap();
        if caller != client {
            panic!("only the client can claim an expired refund");
        }

        let state: MilestoneContractState =
            env.storage().persistent().get(&DataKey::State).unwrap();
        if state != MilestoneContractState::Funded
            && state != MilestoneContractState::PartiallyReleased
        {
            panic!("action only allowed in Funded or PartiallyReleased state");
        }

        let deadline: u64 = env.storage().persistent().get(&DataKey::Deadline).unwrap();
        let now = env.ledger().timestamp();
        if now <= deadline {
            panic!("deadline has not passed yet");
        }

        let total: i128 = env.storage().persistent().get(&DataKey::Amount).unwrap();
        let released: i128 = env.storage().persistent().get(&DataKey::Released).unwrap();
        let unreleased = total - released;

        // Transfer unreleased to client
        let token_addr: Address = env.storage().persistent().get(&DataKey::Token).unwrap();
        let token_client = token::Client::new(&env, &token_addr);
        token_client.transfer(&env.current_contract_address(), &client, &unreleased);

        // Mark all Pending milestones as Refunded
        let mut milestones: Vec<MilestoneEntry> =
            env.storage().persistent().get(&DataKey::Milestones).unwrap();
        for i in 0..milestones.len() {
            let entry = milestones.get(i).unwrap();
            if entry.status == MilestoneStatus::Pending {
                milestones.set(
                    i,
                    MilestoneEntry {
                        label: entry.label,
                        percentage: entry.percentage,
                        status: MilestoneStatus::Refunded,
                    },
                );
            }
        }
        env.storage().persistent().set(&DataKey::Milestones, &milestones);
        env.storage().persistent().set(&DataKey::State, &MilestoneContractState::Refunded);
    }

    // ── Read-only queries ────────────────────────────────────────────────────

    pub fn get_state(env: Env) -> MilestoneContractState {
        env.storage().persistent().get(&DataKey::State).unwrap()
    }

    pub fn get_amount(env: Env) -> i128 {
        env.storage().persistent().get(&DataKey::Amount).unwrap()
    }

    pub fn get_milestones(env: Env) -> Vec<MilestoneEntry> {
        env.storage().persistent().get(&DataKey::Milestones).unwrap()
    }

    pub fn get_deadline(env: Env) -> u64 {
        env.storage().persistent().get(&DataKey::Deadline).unwrap()
    }

    pub fn get_released_total(env: Env) -> i128 {
        env.storage().persistent().get(&DataKey::Released).unwrap()
    }
}

#[cfg(test)]
mod test;

#[cfg(test)]
mod prop_tests;
