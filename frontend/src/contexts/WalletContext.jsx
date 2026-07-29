import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit';
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';
import { Networks } from '@stellar/stellar-sdk';

export const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: defaultModules(),
    });
  }, []);

  // Actually connect after consent is given
  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      setShowConsent(false);
      const res = await StellarWalletsKit.authModal();
      setAddress(res.address);
    } catch (error) {
      console.error("Error connecting wallet", error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Show consent modal first — called by UI buttons
  const requestConnect = useCallback(() => {
    setShowConsent(true);
  }, []);

  const closeConsent = useCallback(() => {
    setShowConsent(false);
  }, []);

  const disconnectWallet = async () => {
    setAddress(null);
    try {
      await StellarWalletsKit.disconnect();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <WalletContext.Provider value={{
      address,
      kit: StellarWalletsKit,
      connectWallet,
      requestConnect,
      showConsent,
      closeConsent,
      disconnectWallet,
      isConnecting,
    }}>
      {children}
    </WalletContext.Provider>
  );
};
