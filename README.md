# ComiSure

**Trustless USDC escrow for freelance digital art commissions on Stellar.**

---

## Problem

Freelance digital artists and their clients in the Philippines face rampant fraud on informal channels:

- **Chargeback scams** — Clients pay via PayPal, receive the artwork, then file a dispute to claw back the payment.
- **Ghost artists** — Artists accept GCash or Maya upfront payments, then disappear without delivering.

Commission sizes of ₱500–₱5,000 are too small for legal recourse and too common to ignore. The creative community needs a trust layer that doesn't depend on either party's goodwill.

## Solution

ComiSure replaces informal payment channels with a Soroban smart contract escrow:

1. The **client** deposits USDC into the contract — funds are locked on-chain, unreachable by either party.
2. The **artist** delivers the finished artwork off-chain (Twitter DM, Google Drive, etc.).
3. The **client** calls `approve_release` — USDC is instantly routed to the artist's wallet.
4. If the artist ghosts, the **admin** calls `admin_refund` → client is made whole.
5. If the client withholds approval maliciously, the **admin** calls `admin_force_release` → artist is paid.

Stellar's sub-cent fees and 5-second settlement make trustless micro-transactions economically viable even for a ₱500 commission.

---

## Stellar Features Used

| Feature | Role in ComiSure |
|---|---|
| **Soroban Smart Contracts** | Core escrow state machine — deposit, release, refund, force-release |
| **Stellar USDC (via SAC)** | Stable payment asset; avoids XLM price volatility for artists |
| **XLM** | Network fee currency for all contract invocations |
| **Trustlines** | Artist wallet must hold a USDC trustline; the token transfer enforces this automatically at the protocol level |

---

## Suggested MVP Timeline (48-Hour Hackathon)

| Hours | Milestone |
|---|---|
| 0 – 6 | Finalize contract logic, compile Wasm, deploy to testnet |
| 6 – 18 | Build minimal Next.js front-end: connect Freighter wallet, call `deposit_funds` and `approve_release` |
| 18 – 30 | Wire up contract reads (`get_state`, `get_amount`) to the UI; show escrow status badge |
| 30 – 40 | End-to-end demo flow with two browser windows (client + artist); record Loom walkthrough |
| 40 – 48 | Polish UI, write pitch deck slides, prepare live demo for judges |

---

## Prerequisites

```bash
# 1. Rust toolchain (stable + wasm32 target)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# 2. Stellar CLI (includes the Soroban subcommands)
#    Minimum required version: stellar-cli 22.0.0
cargo install --locked stellar-cli --features opt

# Verify installation
stellar --version   # should print stellar 22.x.x or higher
```

> **Note:** The Soroban CLI was merged into the Stellar CLI in 2024. All commands below use `stellar contract …`.

---

## Build

```bash
# Compile the contract to an optimised Wasm binary
stellar contract build

# Output: target/wasm32-unknown-unknown/release/comi_sure.wasm
```

---

## Run Tests

```bash
# Run all three unit tests
cargo test

# Run with output printed (useful for debugging)
cargo test -- --nocapture
```

Expected output:

```
running 3 tests
test test::tests::test_happy_path_deposit_and_approve_release ... ok
test test::tests::test_unauthorized_wallet_cannot_call_approve_release ... ok
test test::tests::test_state_and_balance_are_correct_after_deposit ... ok

test result: ok. 3 passed; 0 failed
```

---

## Deploy to Testnet

```bash
# 1. Generate (or import) a testnet identity
stellar keys generate --global alice --network testnet

# 2. Fund the identity via Friendbot
stellar keys fund alice --network testnet

# 3. Deploy the compiled Wasm
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/comi_sure.wasm \
  --source alice \
  --network testnet

# The command prints a Contract ID — save it:
export CONTRACT_ID=<printed_contract_id>
```

---

## Sample CLI Invocations

### `initialize` — Wire up participants after deployment

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source alice \
  --network testnet \
  -- \
  initialize \
  --client  GCLIENTWALLETADDRESSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA \
  --artist  GARTISTWALLETADDRESSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA \
  --admin   GADMINWALLETADDRESSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA \
  --token   GBDC5...USDCTOKENCONTRACTADDRESS
```

---

### `deposit_funds` — Client locks 500 USDC into escrow

```bash
# amount = 500 USDC × 10_000_000 (7-decimal) = 5_000_000_000
stellar contract invoke \
  --id $CONTRACT_ID \
  --source client-key \
  --network testnet \
  -- \
  deposit_funds \
  --caller GCLIENTWALLETADDRESSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA \
  --amount 5000000000
```

Expected output: `null` (void return on success; state transitions to Funded on-chain)

---

### `approve_release` — Client approves after artwork delivery

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source client-key \
  --network testnet \
  -- \
  approve_release \
  --caller GCLIENTWALLETADDRESSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

Expected output: `null` (void return; artist's USDC balance increases within 5 seconds)

---

### `admin_refund` — Admin refunds client (artist ghosted)

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin-key \
  --network testnet \
  -- \
  admin_refund \
  --caller GADMINWALLETADDRESSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

---

### `admin_force_release` — Admin pays artist (client withholding approval)

```bash
stellar contract invoke \
  --id $CONTRACT_ID \
  --source admin-key \
  --network testnet \
  -- \
  admin_force_release \
  --caller GADMINWALLETADDRESSAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
```

---

### Read contract state

```bash
# Check current escrow state
stellar contract invoke --id $CONTRACT_ID --source alice --network testnet \
  -- get_state

# Check locked amount
stellar contract invoke --id $CONTRACT_ID --source alice --network testnet \
  -- get_amount
```

---

## Project Structure

```
comi_sure/
├── Cargo.toml          # Package manifest and dependency pinning
├── README.md           # This file
└── src/
    ├── lib.rs          # Soroban contract: DataKey, EscrowState, all four functions
    └── test.rs         # Three cargo tests: happy path, auth rejection, state check
```

---

## License

MIT License

Copyright (c) 2025 ComiSure Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.