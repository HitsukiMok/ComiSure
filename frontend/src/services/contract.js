import { Contract, Networks, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit';

// The actual deployed contract ID will go here
const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

export class ComiSureContract {
  constructor(kitInstance, networkPassphrase = Networks.TESTNET) {
    this.kit = kitInstance;
    this.networkPassphrase = networkPassphrase;
    this.contract = new Contract(CONTRACT_ID);
  }

  async depositFunds(address, amountInStroops) {
    // Invoke deposit_funds
    const tx = new TransactionBuilder(
        // In a real app, you would fetch the account sequence here from Horizon/Soroban RPC
        { accountId: () => address, sequenceNumber: () => "0" },
        { fee: "100", networkPassphrase: this.networkPassphrase }
    )
    .addOperation(this.contract.call("deposit_funds", 
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccountId(address)),
        xdr.ScVal.scvI128(new xdr.Int128Parts({
            // amountInStroops is i128
            hi: new xdr.Int64(0,0),
            lo: new xdr.Int64(Math.floor(amountInStroops/(2**32)), amountInStroops >>> 0)
        }))
    ))
    .setTimeout(30)
    .build();

    const signedTxXdr = await this.kit.signTransaction(tx.toXDR(), { 
        networkPassphrase: this.networkPassphrase, 
        address 
    });
    
    // Submit to Soroban RPC here...
    return signedTxXdr;
  }

  async approveRelease(address) {
    // Invoke approve_release
    const tx = new TransactionBuilder(
        { accountId: () => address, sequenceNumber: () => "0" },
        { fee: "100", networkPassphrase: this.networkPassphrase }
    )
    .addOperation(this.contract.call("approve_release",
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccountId(address))
    ))
    .setTimeout(30)
    .build();

    const signedTxXdr = await this.kit.signTransaction(tx.toXDR(), { 
        networkPassphrase: this.networkPassphrase, 
        address 
    });
    
    // Submit to Soroban RPC here...
    return signedTxXdr;
  }
}
