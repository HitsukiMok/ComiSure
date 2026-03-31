import { Keypair, Asset, TransactionBuilder, Networks, Horizon, Operation } from '@stellar/stellar-sdk';
import fetch from 'node-fetch';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

async function main() {
    const secret = 'SCTAAPR7NLZAU4L7EA2DHYMDS7RL5CZNN4IKS26O277BRY6V4WLU25B5'; 
    const keypair = Keypair.fromSecret(secret);
    const pubKey = keypair.publicKey();
    console.log("Account:", pubKey);
    
    const account = await server.loadAccount(pubKey);
    const usdcAsset = new Asset('USDC', 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

    const hasTrustline = account.balances.some(b => b.asset_code === 'USDC' && b.asset_issuer === 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5');

    if (!hasTrustline) {
        console.log("Adding trustline...");
        const tx = new TransactionBuilder(account, { fee: '1000' , networkPassphrase: Networks.TESTNET})
            .addOperation(Operation.changeTrust({
                asset: usdcAsset,
            }))
            .setTimeout(30)
            .build();
        tx.sign(keypair);
        const res = await server.submitTransaction(tx);
        console.log("Trustline added. Hash:", res.hash);
    } else {
        console.log("Trustline already exists.");
    }

    console.log("Please go back to the Lab to click 'Fund'!");
}

main().catch(console.error);
