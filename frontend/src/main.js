import StellarSdk from '@stellar/stellar-sdk';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ComiSure Frontend - Barebones Version for Freighter + Stellar Testing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── Network Configuration ───────────────────────────────────────────────────
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const HORIZON_URL = "https://horizon-testnet.stellar.org";

// ─── App State ──────────────────────────────────────────────────────────────
let userPublicKey = "";
let userAccount = null;

// ─── DOM Elements ───────────────────────────────────────────────────────────
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const walletAddressDisplay = document.getElementById('wallet-address');
const walletStatus = document.getElementById('wallet-status');
const connectedAddress = document.getElementById('connected-address');
const featuresSection = document.getElementById('features-section');
const manualAddressInput = document.getElementById('manual-address');
const useManualBtn = document.getElementById('use-manual-btn');

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

// ─── Manual Address Input ──────────────────────────────────────────────────
function setUserAddress(address) {
    if (!address.startsWith('G')) {
        alert('Invalid address: must start with G');
        return;
    }
    userPublicKey = address;
    userAccount = null; // Reset account data
    const displayKey = `${address.substring(0, 10)}...${address.substring(50)}`;
    walletAddressDisplay.innerText = displayKey;
    walletAddressDisplay.style.color = "var(--success)";
    connectedAddress.innerText = address;
    walletStatus.innerText = `✓ Using address: ${displayKey}`;
    walletStatus.style.color = "var(--success)";
    manualAddressInput.value = "";
    console.log("Address set:", address);
}

useManualBtn.addEventListener('click', () => {
    const address = manualAddressInput.value.trim();
    if (address) {
        setUserAddress(address);
    } else {
        alert('Please enter an address');
    }
});

// Debug: Check if Freighter is available
console.log("Freighter API available?", typeof window.freighterApi);
console.log("Window keys:", Object.keys(window).filter(k => k.includes('freighter') || k.includes('Freighter')));

async function connectWallet() {
    try {
        console.log("Connect button clicked");
        console.log("Freighter API:", window.freighterApi);
        
        if (!window.freighterApi) {
            walletStatus.innerText = "⚠️ Freighter not found. Use manual address input above.";
            walletStatus.style.color = "var(--text-muted)";
            return;
        }

        console.log("Requesting public key...");
        userPublicKey = await window.freighterApi.getPublicKey();
        console.log("Got public key:", userPublicKey);
        
        const displayKey = `${userPublicKey.substring(0, 10)}...${userPublicKey.substring(50)}`;
        
        walletAddressDisplay.innerText = displayKey;
        walletAddressDisplay.style.color = "var(--success)";
        connectedAddress.innerText = userPublicKey;
        
        connectWalletBtn.innerText = "✓ Connected";
        connectWalletBtn.disabled = true;
        connectWalletBtn.style.backgroundColor = "var(--success)";
        
        walletStatus.innerText = `✓ Freighter connected: ${displayKey}`;
        walletStatus.style.color = "var(--success)";
        console.log("Freighter wallet connected successfully");
        
    } catch (error) {
        console.error("Wallet error:", error);
        walletStatus.innerText = `❌ Error: ${error.message}`;
        walletStatus.style.color = "var(--danger)";
    }
}

connectWalletBtn.addEventListener('click', connectWallet);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET ACCOUNT BALANCE (via Horizon REST API)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function getBalance() {
    if (!userPublicKey) {
        balanceStatus.innerText = "❌ Enter an address first";
        balanceStatus.style.color = "var(--danger)";
        return;
    }

    balanceStatus.innerText = "⏳ Loading account...";
    balanceStatus.style.color = "var(--text-muted)";

    try {
        // Fetch account info from Horizon REST API
        const response = await fetch(`${HORIZON_URL}/accounts/${userPublicKey}`);
        if (!response.ok) {
            throw new Error(`Account not found: ${response.status}`);
        }
        
        const account = await response.json();
        
        // Find XLM (native) balance
        const nativeBalance = account.balances.find(b => b.asset_type === 'native');
        const xlmBalance = nativeBalance ? nativeBalance.balance : "0";
        
        // Store account for later use
        userAccount = account;
        
        balanceAmount.innerText = `${xlmBalance} XLM`;
        accountSequence.innerText = account.sequence;
        balanceDisplay.style.display = 'block';
        
        balanceStatus.innerText = "✓ Account loaded successfully";
        balanceStatus.style.color = "var(--success)";
        
    } catch (error) {
        console.error(error);
        balanceStatus.innerText = `❌ Error: ${error.message}`;
        balanceStatus.style.color = "var(--danger)";
        balanceDisplay.style.display = 'none';
    }
}

getBalanceBtn.addEventListener('click', getBalance);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUILD & SIGN TRANSACTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function buildTransaction() {
    if (!userPublicKey) {
        buildStatus.innerText = "❌ Enter an address first";
        buildStatus.style.color = "var(--danger)"
        return;
    }

    const recipient = document.getElementById('recipient-address').value.trim();
    const amount = document.getElementById('send-amount').value.trim();

    if (!recipient || !amount) {
        buildStatus.innerText = "❌ Enter recipient and amount";
        buildStatus.style.color = "var(--danger)";
        return;
    }

    if (!recipient.startsWith('G')) {
        buildStatus.innerText = "❌ Invalid recipient address (must start with G)";
        buildStatus.style.color = "var(--danger)";
        return;
    }

    buildStatus.innerText = "⏳ Building transaction...";
    buildStatus.style.color = "var(--text-muted)";

    try {
        if (!userAccount) {
            // Fetch account info from Horizon
            const response = await fetch(`${HORIZON_URL}/accounts/${userPublicKey}`);
            if (!response.ok) {
                throw new Error("Account not found on network");
            }
            userAccount = await response.json();
        }

        const tx = new StellarSdk.TransactionBuilder(userAccount, {
            fee: "100",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(
            StellarSdk.Operation.payment({
                destination: recipient,
                asset: StellarSdk.Asset.native(),
                amount: amount,
            })
        )
        .setTimeout(300)
        .build();

        builtTransaction = tx;
        builtTransactionXdr = tx.toXDR();

        txDetails.innerText = `${tx.operations.length} operation(s) | Fee: ${parseFloat(tx.fee) / 1000000} XLM | Seq: ${tx.sequence}`;

        txPreview.style.display = 'block';
        buildStatus.innerText = "✓ Transaction ready to sign";
        buildStatus.style.color = "var(--success)";

    } catch (error) {
        console.error(error);
        buildStatus.innerText = `❌ Error: ${error.message}`;
        buildStatus.style.color = "var(--danger)";
        txPreview.style.display = 'none';
    }
}

async function signTransaction() {
    if (!builtTransactionXdr) {
        signStatus.innerText = "❌ Build transaction first";
        signStatus.style.color = "var(--danger)";
        return;
    }

    signStatus.innerText = "⏳ Requesting signature from Freighter...";
    signStatus.style.color = "var(--text-muted)";

    try {
        const signedXdr = await window.freighterApi.signTransaction(
            builtTransactionXdr,
            NETWORK_PASSPHRASE
        );

        const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

        signStatus.innerText = `✓ Transaction signed! Hash: ${signedTx.hash().toString('hex').substring(0, 16)}...`;
        signStatus.style.color = "var(--success)";
        signTxBtn.disabled = true;
        signTxBtn.innerText = "✓ Signed";

    } catch (error) {
        console.error(error);
        signStatus.innerText = `❌ Signing failed: ${error.message}`;
        signStatus.style.color = "var(--danger)";
    }
}

buildTxBtn.addEventListener('click', buildTransaction);
signTxBtn.addEventListener('click', signTransaction);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ADDRESS LOOKUP (via Horizon REST API)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function lookupAddress() {
    const address = document.getElementById('lookup-address').value.trim();

    if (!address || !address.startsWith('G')) {
        lookupStatus.innerText = "❌ Enter valid Stellar address";
        lookupStatus.style.color = "var(--danger)";
        lookupDisplay.style.display = 'none';
        return;
    }

    lookupStatus.innerText = "⏳ Looking up address...";
    lookupStatus.style.color = "var(--text-muted)";

    try {
        // Fetch account info from Horizon
        const response = await fetch(`${HORIZON_URL}/accounts/${address}`);
        if (!response.ok) {
            throw new Error(`Account not found`);
        }
        
        const account = await response.json();
        const nativeBalance = account.balances.find(b => b.asset_type === 'native');

        document.getElementById('lookup-account-id').innerText = account.id;
        document.getElementById('lookup-balance').innerText = nativeBalance ? nativeBalance.balance : "0";
        document.getElementById('lookup-sequence').innerText = account.sequence;

        lookupDisplay.style.display = 'block';
        lookupStatus.innerText = "✓ Account found";
        lookupStatus.style.color = "var(--success)";

    } catch (error) {
        console.error(error);
        lookupStatus.innerText = `❌ Not found: ${error.message}`;
        lookupStatus.style.color = "var(--danger)";
        lookupDisplay.style.display = 'none';
    }
}

lookupBtn.addEventListener('click', lookupAddress);
