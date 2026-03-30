import * as StellarSdk from '@stellar/stellar-sdk';
import freighterApi from '@stellar/freighter-api';

// DOM Elements
const connectWalletBtn = document.getElementById('connect-wallet-btn');
const walletAddressDisplay = document.getElementById('wallet-address');
const depositBtn = document.getElementById('deposit-btn');
const approveBtn = document.getElementById('approve-btn');

// App State
let userPublicKey = "";
// The deployed Soroban contract ID (replace after running `soroban contract deploy`)
const CONTRACT_ID = "CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; 
// Testnet Passphrase
const NETWORK_PASSPHRASE = StellarSdk.Networks.TESTNET;
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new StellarSdk.SorobanRpc.Server("https://soroban-testnet.stellar.org");

// --- WALLET CONNECTION ---
async function connectWallet() {
    try {
        if (window.freighterApi && await window.freighterApi.isConnected()) {
            userPublicKey = await window.freighterApi.getPublicKey();
            walletAddressDisplay.innerText = `${userPublicKey.substring(0, 5)}...${userPublicKey.substring(51)}`;
            connectWalletBtn.innerText = "Connected";
            connectWalletBtn.style.backgroundColor = "var(--success)";
        } else {
            alert("Please install the Freighter browser extension.");
        }
    } catch (error) {
        console.error("Wallet connection failed:", error);
    }
}

// --- CONTRACT INTERACTION: DEPOSIT ---
async function depositFunds() {
    if (!userPublicKey) return alert("Connect wallet first!");
    const amountInput = document.getElementById('deposit-amount').value;
    const statusText = document.getElementById('deposit-status');

    if (!amountInput) return alert("Enter a deposit amount.");

    statusText.innerText = "Building transaction...";
    
    try {
        // 1. Fetch the user's account sequence number from the network
        const horizonServer = new StellarSdk.Server(HORIZON_URL);
        const account = await horizonServer.loadAccount(userPublicKey);

        // 2. Prepare the arguments for `deposit_funds(caller: Address, amount: i128)`
        // Convert the UI amount into 7-decimal stroops (e.g., 20 USDC = 200000000)
        const amountInStroops = Math.floor(parseFloat(amountInput) * 10000000);
        
        const contract = new StellarSdk.Contract(CONTRACT_ID);
        const callerScVal = new StellarSdk.Address(userPublicKey).toScVal();
        const amountScVal = StellarSdk.nativeToScVal(amountInStroops, { type: 'i128' });

        // 3. Build the transaction
        let tx = new StellarSdk.TransactionBuilder(account, {
            fee: "10000",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(contract.call("deposit_funds", callerScVal, amountScVal))
        .setTimeout(30)
        .build();

        // 4. Prepare the transaction for Soroban (simulates execution to calculate resources)
        statusText.innerText = "Simulating transaction...";
        const preparedTx = await server.prepareTransaction(tx);

        // 5. Sign with Freighter
        statusText.innerText = "Prompting wallet for signature...";
        const signedXdr = await window.freighterApi.signTransaction(preparedTx.toXDR(), "TESTNET");
        const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

        // 6. Submit to the network
        statusText.innerText = "Submitting to network...";
        const response = await server.sendTransaction(signedTx);
        
        statusText.innerText = `Success! ${amountInput} USDC locked in escrow.`;
        statusText.style.color = "var(--success)";

    } catch (error) {
        console.error(error);
        statusText.innerText = "Transaction failed. Check console.";
        statusText.style.color = "var(--danger)";
    }
}

// --- CONTRACT INTERACTION: APPROVE ---
async function approveRelease() {
    if (!userPublicKey) return alert("Connect wallet first!");
    const statusText = document.getElementById('approve-status');

    statusText.innerText = "Building approval transaction...";

    try {
        const horizonServer = new StellarSdk.Server(HORIZON_URL);
        const account = await horizonServer.loadAccount(userPublicKey);

        // Prepare the argument for `approve_release(caller: Address)`
        const contract = new StellarSdk.Contract(CONTRACT_ID);
        const callerScVal = new StellarSdk.Address(userPublicKey).toScVal();

        let tx = new StellarSdk.TransactionBuilder(account, {
            fee: "10000",
            networkPassphrase: NETWORK_PASSPHRASE,
        })
        .addOperation(contract.call("approve_release", callerScVal))
        .setTimeout(30)
        .build();

        statusText.innerText = "Simulating transaction...";
        const preparedTx = await server.prepareTransaction(tx);

        statusText.innerText = "Prompting wallet for signature...";
        const signedXdr = await window.freighterApi.signTransaction(preparedTx.toXDR(), "TESTNET");
        const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

        statusText.innerText = "Submitting to network...";
        const response = await server.sendTransaction(signedTx);
        
        statusText.innerText = `Escrow approved. Funds released to artist!`;
        statusText.style.color = "var(--success)";

    } catch (error) {
        console.error(error);
        statusText.innerText = "Approval failed. Check console.";
        statusText.style.color = "var(--danger)";
    }
}

connectWalletBtn.addEventListener('click', connectWallet);
depositBtn.addEventListener('click', depositFunds);
approveBtn.addEventListener('click', approveRelease);