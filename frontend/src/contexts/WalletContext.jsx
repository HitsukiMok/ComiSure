import React, { createContext, useContext, useState, useEffect } from 'react';
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit';
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';
import { Networks } from '@stellar/stellar-sdk';

export const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Initialize the Stellar Wallets Kit statically
    StellarWalletsKit.init({
        network: Networks.TESTNET,
        modules: defaultModules(),
    });
  }, []);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      const res = await StellarWalletsKit.authModal();
      setAddress(res.address);
    } catch (error) {
      console.error("Error connecting wallet", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    setAddress(null);
    try {
        await StellarWalletsKit.disconnect();
    } catch(e) {
        console.error(e);
    }
  };

  return (
    <WalletContext.Provider value={{ address, kit: StellarWalletsKit, connectWallet, disconnectWallet, isConnecting }}>
      {children}
    </WalletContext.Provider>
  );
};
