import {
  Contract,
  Networks,
  TransactionBuilder,
  rpc,
  Address,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit';

const CONTRACT_ID  = import.meta.env.VITE_CONTRACT_ID;
const SOROBAN_RPC  = import.meta.env.VITE_SOROBAN_RPC || 'https://soroban-testnet.stellar.org';
const NETWORK      = Networks.TESTNET;

const server = new rpc.Server(SOROBAN_RPC, { allowHttp: false });
const contract = new Contract(CONTRACT_ID);

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Poll until transaction is confirmed or failed. Returns the result. */
async function waitForTransaction(hash, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await server.getTransaction(hash);
    if (result.status !== rpc.Api.GetTransactionStatus.NOT_FOUND) {
      return result;
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Transaction confirmation timed out after 60s.');
}

/** Build, simulate, sign, submit and wait for a contract call. */
async function invokeContract(callerAddress, operation) {
  // 1. Load the caller's on-chain account (gets sequence number)
  const account = await server.getAccount(callerAddress);

  // 2. Build the raw transaction
  const tx = new TransactionBuilder(account, {
    fee: '1000000', // 0.1 XLM max fee — plenty for Soroban
    networkPassphrase: NETWORK,
  })
    .addOperation(operation)
    .setTimeout(60)
    .build();

  // 3. Simulate & attach Soroban footprint (prepareTransaction does both)
  const preparedTx = await server.prepareTransaction(tx);

  // 4. Sign with the connected wallet via Stellar Wallets Kit
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(
    preparedTx.toXDR(),
    { networkPassphrase: NETWORK }
  );

  // 5. Submit the signed transaction
  const submitResult = await server.sendTransaction(
    TransactionBuilder.fromXDR(signedTxXdr, NETWORK)
  );

  if (submitResult.status === 'ERROR') {
    throw new Error(`Submission failed: ${JSON.stringify(submitResult.errorResult)}`);
  }

  // 6. Poll for the final result
  const confirmed = await waitForTransaction(submitResult.hash);

  if (confirmed.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(`Transaction failed on-chain: ${confirmed.resultXdr}`);
  }

  return {
    hash: submitResult.hash,
    explorerUrl: `https://stellar.expert/explorer/testnet/tx/${submitResult.hash}`,
    result: confirmed,
  };
}

/** Read-only simulation — no signing or fees needed. */
async function simulateReadOnly(callerAddress, operation) {
  const account = await server.getAccount(callerAddress);
  const tx = new TransactionBuilder(account, {
    fee: '100',
    networkPassphrase: NETWORK,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation error: ${sim.error}`);
  }
  // Extract the return value
  return sim.result?.retval;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Read the current escrow state: 'Pending' | 'Funded' | 'Released' | 'Refunded'
 */
export async function getContractState(callerAddress) {
  const scVal = await simulateReadOnly(callerAddress, contract.call('get_state'));
  if (!scVal) return 'Unknown';
  const raw = scValToNative(scVal);
  return String(raw);
}

/**
 * Read the total amount locked in escrow (in USDC stroops — divide by 10_000_000 for USDC).
 */
export async function getContractAmount(callerAddress) {
  const scVal = await simulateReadOnly(callerAddress, contract.call('get_amount'));
  if (!scVal) return 0n;
  return BigInt(scValToNative(scVal));
}

/**
 * Client deposits USDC into escrow.
 * @param {string} callerAddress  - Stellar G... address of the client
 * @param {number} usdcAmount     - USDC amount (e.g. 10 for 10 USDC)
 */
export async function depositFunds(callerAddress, usdcAmount) {
  const amountStroops = BigInt(Math.round(usdcAmount * 10_000_000));

  const op = contract.call(
    'deposit_funds',
    new Address(callerAddress).toScVal(),
    nativeToScVal(amountStroops, { type: 'i128' })
  );

  return invokeContract(callerAddress, op);
}

/**
 * Client approves the artwork and releases USDC to the artist.
 */
export async function approveRelease(callerAddress) {
  const op = contract.call(
    'approve_release',
    new Address(callerAddress).toScVal()
  );
  return invokeContract(callerAddress, op);
}

/**
 * Admin refunds the client (artist ghosted).
 */
export async function adminRefund(adminAddress) {
  const op = contract.call(
    'admin_refund',
    new Address(adminAddress).toScVal()
  );
  return invokeContract(adminAddress, op);
}

/**
 * Admin force-releases funds to the artist (client withholding approval).
 */
export async function adminForceRelease(adminAddress) {
  const op = contract.call(
    'admin_force_release',
    new Address(adminAddress).toScVal()
  );
  return invokeContract(adminAddress, op);
}
