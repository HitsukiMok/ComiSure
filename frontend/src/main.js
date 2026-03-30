import * as StellarSdk from '@stellar/stellar-sdk';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ComiSure Frontend - Barebones Version for Freighter + Stellar Testing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Network Configuration ───────────────────────────────────────────────────
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const horizon = new StellarSdk.Server(HORIZON_URL);

// ─── App State ──────────────────────────────────────────────────────────────
let userPublicKey = "";
let userAccount = null;

// ─── DOM Elements ───────────────────────────────────────────────────────────
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const walletAddressDisplay = document.getElementById('wallet-address');
const walletStatus = document.getElementById('wallet-status');
const connectedAddress = document.getElementById('connected-address');
const featuresSection = document.getElementById('features-section');

const getBalanceBtn = document.getElementById('get-balance-btn');
const balanceStatus = document.getElementById('balance-status');
const balanceDisplay = document.getElementById('balance-display');
const balanceAmount = document.getElementById('balance-amount');
const accountSequence = document.getElementById('account-sequence');

const buildTxBtn = document.getElementById('build-tx-btn');
const buildStatus = document.getElementById('build-status');
const txPreview = document.getElementById('tx-preview');
const txDetails = document.getElementById('tx-details');
const signTxBtn = document.getElementById('sign-tx-btn');
const signStatus = document.getElementById('sign-status');

const lookupBtn = document.getElementById('lookup-btn');
const lookupStatus = document.getElementById('lookup-status');
const lookupDisplay = document.getElementById('lookup-display');

let builtTransaction = null;
let builtTransactionXdr = "";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WALLET CONNECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function connectWallet() {
    try {
        if (!window.freighterApi) {
            walletStatus.innerText = "❌ Freighter not installed. Please install the browser extension.";
            walletStatus.style.color = "var(--danger)";
            return;
        }

        userPublicKey = await window.freighterApi.getPublicKey();
        const displayKey = `${userPublicKey.substring(0, 10)}...${userPublicKey.substring(50)}`;
        
        walletAddressDisplay.innerText = displayKey;
        walletAddressDisplay.style.color = "var(--success)";
        connectedAddress.innerText = userPublicKey;
        
        connectWalletBtn.innerText = "✓ Connected";
        connectWalletBtn.disabled = true;
        connectWalletBtn.style.backgroundColor = "var(--success)";
        
        walletStatus.innerText = `✓ Wallet connected: ${displayKey}`;
        walletStatus.style.color = "var(--success)";
        
        // Show features section
        featuresSection.style.display = 'block';
        
    } catch (error) {
        console.error("Wallet error:", error);
        walletStatus.innerText = `❌ Error: ${error.message}`;
        walletStatus.style.color = "var(--danger)";
    }
}

connectWalletBtn.addEventListener('click', connectWallet);

// ═══════════════════════════════════════════════════════════════════════════════
// CONTRACT STATE VIEWING
// ═══════════════════════════════════════════════════════════════════════════════

async function loadContract() {
    if (!userPublicKey) {
        setupStatus.innerText = "❌ Connect wallet first!";
        setupStatus.style.color = "var(--danger)";
        return;
    }

    contractId = contractIdInput.value.trim();
    if (!contractId || !contractId.startsWith('C')) {
        setupStatus.innerText = "❌ Invalid contract ID. Must start with 'C'.";
        setupStatus.style.color = "var(--danger)";
        return;
    }

    setupStatus.innerText = "Loading contract state...";
    try {
        await refreshContractState();
        
        // Hide setup section, show contract state
        document.getElementById('setup-section').style.display = 'none';
        document.getElementById('state-section').style.display = 'block';
        document.getElementById('client-section').style.display = 'block';
        document.getElementById('admin-section').style.display = 'block';
        
        setupStatus.innerText = "✓ Contract loaded successfully";
        setupStatus.style.color = "var(--success)";
        
    } catch (error) {
        console.error(error);
        setupStatus.innerText = `❌ Failed to load contract: ${error.message}`;
        setupStatus.style.color = "var(--danger)";
    }
}

async function refreshContractState() {
    try {
        const horizon = new StellarSdk.Server(HORIZON_URL);
        
        // Read current state via get_state()
        const stateCall = new StellarSdk.Contract(contractId).call('get_state');
        const amountCall = new StellarSdk.Contract(contractId).call('get_amount');
        
        // For reading state, we simulate without submitting
        const tx = new StellarSdk.TransactionBuilder(
            await horizon.loadAccount(userPublicKey),
            { fee: "1000", networkPassphrase: NETWORK_PASSPHRASE }
        )
        .addOperation(stateCall)
        .setTimeout(30)
        .build();

        const prepared = await sorobanServer.prepareTransaction(tx);
        const result = await sorobanServer.simulateTransaction(prepared);
        
        if (result.error) {
            escrowStateDisplay.innerText = "Error reading state";
            escrowAmountDisplay.innerText = "0 USDC";
            return;
        }

        // Parse result from simulation
        const stateValue = result.result?.invokeHostFunction?.return_value;
        const states = ['Pending', 'Funded', 'Released', 'Refunded'];
        const currentState = stateValue ? states[parseInt(stateValue)] : 'Unknown';
        
        escrowStateDisplay.innerText = currentState || 'Unknown';
        escrowStateDisplay.style.color = 
            currentState === 'Funded' ? 'var(--accent)' :
            currentState === 'Released' ? 'var(--success)' :
            currentState === 'Refunded' ? 'var(--danger)' : 'var(--text-muted)';
        
    } catch (error) {
        console.warn('State read is read-only in test environment:', error.message);
        escrowStateDisplay.innerText = '(Viewing not supported in test)';
        escrowAmountDisplay.innerText = 'Check contract directly';
    }
}

loadContractBtn.addEventListener('click', loadContract);
refreshStateBtn.addEventListener('click', refreshContractState);

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTION HELPER: Execute contract invocation
// ═══════════════════════════════════════════════════════════════════════════════

async function invokeContract(functionName, args, statusElement) {
    if (!userPublicKey) {
        statusElement.innerText = "❌ Connect wallet first!";
        statusElement.style.color = "var(--danger)";
        return false;
    }

    if (!contractId) {
        statusElement.innerText = "❌ Load contract first!";
        statusElement.style.color = "var(--danger)";
        return false;
    }

    try {
        statusElement.innerText = `⏳ Building ${functionName} transaction...`;
        statusElement.style.color = "var(--text-muted)";

        const horizon = new StellarSdk.Server(HORIZON_URL);
        const account = await horizon.loadAccount(userPublicKey);

        const contract = new StellarSdk.Contract(contractId);
        let tx = new StellarSdk.TransactionBuilder(account, {
            fee: "10000",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(contract.call(functionName, ...args))
        .setTimeout(30)
        .build();

        statusElement.innerText = `⏳ Simulating transaction...`;
        const preparedTx = await sorobanServer.prepareTransaction(tx);

        statusElement.innerText = `⏳ Requesting Freighter signature...`;
        const signedXdr = await window.freighterApi.signTransaction(
            preparedTx.toXDR(),
            NETWORK_PASSPHRASE
        );
        const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

        statusElement.innerText = `⏳ Submitting to Stellar network...`;
        const response = await sorobanServer.sendTransaction(signedTx);
        
        statusElement.innerText = `✓ ${functionName} succeeded! Hash: ${response.hash.substring(0, 16)}...`;
        statusElement.style.color = "var(--success)";
        
        // Refresh state after transaction
        setTimeout(() => refreshContractState(), 5000);
        return true;

    } catch (error) {
        console.error(`${functionName} error:`, error);
        const msg = error.response?.data?.extras?.result_codes?.transaction ||error.message || 'Unknown error';
        statusElement.innerText = `❌ ${functionName} failed: ${msg}`;
        statusElement.style.color = "var(--danger)";
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CLIENT OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function depositFunds() {
    const artistAddr = document.getElementById('artist-address-input').value.trim();
    const adminAddr = document.getElementById('admin-address-input').value.trim();
    const usdcToken = document.getElementById('usdc-token-input').value.trim();
    const amountUSDC = document.getElementById('deposit-amount').value.trim();
    const statusText = document.getElementById('deposit-status');

    if (!artistAddr || !adminAddr || !usdcToken || !amountUSDC) {
        statusText.innerText = "❌ Fill in all fields";
        statusText.style.color = "var(--danger)";
        return;
    }

    if (!Number.isFinite(parseFloat(amountUSDC)) || parseFloat(amountUSDC) <= 0) {
        statusText.innerText = "❌ Amount must be a positive number";
        statusText.style.color = "var(--danger)";
        return;
    }

    // Convert USDC amount (7-decimal precision)
    const amountInStroops = Math.floor(parseFloat(amountUSDC) * 10000000);

    const args = [
        new StellarSdk.Address(userPublicKey).toScVal(),
        StellarSdk.nativeToScVal(amountInStroops, { type: 'i128' })
    ];

    const success = await invokeContract('deposit_funds', args, statusText);
    if (success) {
        document.getElementById('deposit-amount').value = '';
    }
}

async function approveAndRelease() {
    const statusText = document.getElementById('approve-status');
    const args = [
        new StellarSdk.Address(userPublicKey).toScVal()
    ];
    await invokeContract('approve_release', args, statusText);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function adminForceRelease() {
    const statusText = document.getElementById('admin-status');
    const args = [
        new StellarSdk.Address(userPublicKey).toScVal()
    ];
    await invokeContract('admin_force_release', args, statusText);
}

async function adminRefund() {
    const statusText = document.getElementById('admin-status');
    const args = [
        new StellarSdk.Address(userPublicKey).toScVal()
    ];
    await invokeContract('admin_refund', args, statusText);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════

depositBtn.addEventListener('click', depositFunds);
approveBtn.addEventListener('click', approveAndRelease);
forceReleaseBtn.addEventListener('click', adminForceRelease);
refundBtn.addEventListener('click', adminRefund);