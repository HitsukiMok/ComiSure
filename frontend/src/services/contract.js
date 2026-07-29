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

const SOROBAN_RPC  = import.meta.env.VITE_SOROBAN_RPC || 'https://soroban-testnet.stellar.org';
const NETWORK      = Networks.TESTNET;

const server = new rpc.Server(SOROBAN_RPC, { allowHttp: false });

function extractErrorText(error) {
  if (!error) return 'Unknown contract error.';

  if (typeof error === 'string') return error;

  if (typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  }

  if (error.response?.data?.detail) return String(error.response.data.detail);
  if (error.message) return String(error.message);
  if (error.resultXdr) return String(error.resultXdr);
  return String(error);
}

function friendlyContractError(error, context = {}) {
  const raw = extractErrorText(error);
  const lower = raw.toLowerCase();

  if (lower.includes('trustline entry is missing for account')) {
    const actor = context.actorLabel || 'This wallet';
    const target = context.operation === 'approve_release'
      ? 'the artist wallet'
      : context.operation === 'deposit_funds'
        ? 'the client wallet'
        : 'the target wallet';
    return `${actor} does not have a USDC trustline. The failing account is likely ${target}. Open that wallet and add/enable a USDC trustline, then try again.`;
  }

  if (lower.includes('insufficient balance')) {
    const actor = context.actorLabel || 'the wallet';
    return `${actor} does not have enough USDC balance for this action.`;
  }

  if (lower.includes('only the client can approve')) {
    return 'Only the registered client wallet can approve the release.';
  }

  if (lower.includes('only the registered client can deposit')) {
    return 'Only the registered client wallet can deposit funds.';
  }

  if (lower.includes('only the admin can')) {
    return 'Only the admin wallet can perform this action.';
  }

  if (lower.includes('deadline has not passed yet')) {
    return 'The commission deadline has not expired yet. You cannot claim a refund until the deadline passes.';
  }

  if (lower.includes('only the client can claim an expired refund')) {
    return 'Only the registered client wallet can claim an expired refund.';
  }

  if (lower.includes('hosterror') || lower.includes('error(contract')) {
    return `On-chain contract error: ${raw}`;
  }

  return raw;
}

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
async function invokeContract(callerAddress, operation, context = {}) {
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
    throw new Error(friendlyContractError(submitResult.errorResult, context));
  }

  // 6. Poll for the final result
  const confirmed = await waitForTransaction(submitResult.hash);

  if (confirmed.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(friendlyContractError(confirmed.resultXdr, context));
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
    throw new Error(friendlyContractError(sim.error, context));
  }
  // Extract the return value
  return sim.result?.retval;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Read the current escrow state: 'Pending' | 'Funded' | 'Released' | 'Refunded'
 */
export async function getContractState(contractId, callerAddress) {
  const contract = new Contract(contractId);
  const scVal = await simulateReadOnly(callerAddress, contract.call('get_state'));
  if (!scVal) return 'Unknown';
  const raw = scValToNative(scVal);
  return String(raw);
}

/**
 * Read the total amount locked in escrow (in USDC stroops — divide by 10_000_000 for USDC).
 */
export async function getContractAmount(contractId, callerAddress) {
  const contract = new Contract(contractId);
  const scVal = await simulateReadOnly(callerAddress, contract.call('get_amount'));
  if (!scVal) return 0n;
  return BigInt(scValToNative(scVal));
}

/**
 * Client deposits USDC into escrow.
 * @param {string} contractId     - Dynamically generated Soroban Contract ID
 * @param {string} callerAddress  - Stellar G... address of the client
 * @param {number} usdcAmount     - USDC amount (e.g. 10 for 10 USDC)
 */
export async function depositFunds(contractId, callerAddress, usdcAmount) {
  const contract = new Contract(contractId);
  const amountStroops = BigInt(Math.round(usdcAmount * 10_000_000));

  const op = contract.call(
    'deposit_funds',
    new Address(callerAddress).toScVal(),
    nativeToScVal(amountStroops, { type: 'i128' })
  );

  return invokeContract(callerAddress, op, {
    actorLabel: 'The client wallet',
    operation: 'deposit_funds',
  });
}

/**
 * Client approves the artwork and releases USDC to the artist.
 */
export async function approveRelease(contractId, callerAddress) {
  const contract = new Contract(contractId);
  const op = contract.call(
    'approve_release',
    new Address(callerAddress).toScVal()
  );
  return invokeContract(callerAddress, op, {
    actorLabel: 'The connected wallet',
    operation: 'approve_release',
  });
}

/**
 * Admin refunds the client (artist ghosted).
 */
export async function adminRefund(contractId, adminAddress) {
  const contract = new Contract(contractId);
  const op = contract.call(
    'admin_refund',
    new Address(adminAddress).toScVal()
  );
  return invokeContract(adminAddress, op, {
    actorLabel: 'The admin wallet',
    operation: 'admin_refund',
  });
}

/**
 * Admin force-releases funds to the artist (client withholding approval).
 */
export async function adminForceRelease(contractId, adminAddress) {
  const contract = new Contract(contractId);
  const op = contract.call(
    'admin_force_release',
    new Address(adminAddress).toScVal()
  );
  return invokeContract(adminAddress, op, {
    actorLabel: 'The admin wallet',
    operation: 'admin_force_release',
  });
}

/**
 * Client claims a refund after the commission deadline has expired.
 * Only callable by the registered client wallet after the on-chain deadline passes.
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

/**
 * Read the deadline Unix timestamp from the contract (read-only, no signing).
 * Returns a BigInt representing seconds since epoch.
 */
export async function getContractDeadline(contractId, callerAddress) {
  const contract = new Contract(contractId);
  const scVal = await simulateReadOnly(callerAddress, contract.call('get_deadline'));
  if (!scVal) return 0n;
  return BigInt(scValToNative(scVal));
}

export { friendlyContractError };
