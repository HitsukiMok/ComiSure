import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StellarWalletsKit } from '@creit-tech/stellar-wallets-kit';
import { defaultModules } from '@creit-tech/stellar-wallets-kit/modules/utils';
import { Networks } from '@stellar/stellar-sdk';
import { api } from '../services/api';

export const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

const TOKEN_KEY = 'comisure-auth-token';

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: defaultModules(),
    });
  }, []);

  // Authenticate with backend after wallet connect
  const authenticateWithBackend = useCallback(async (walletAddress) => {
    try {
      console.log('[Auth] Starting authentication for:', walletAddress);

      // 1. Get challenge
      const challengeRes = await api.get('/auth/challenge', {
        params: { wallet_address: walletAddress },
      });
      const challenge = challengeRes.data.challenge;
      console.log('[Auth] Got challenge:', challenge.slice(0, 30) + '...');

      // 2. Sign the challenge
      let signature;
      try {
        const result = await StellarWalletsKit.signMessage(challenge, {
          address: walletAddress,
          networkPassphrase: Networks.TESTNET,
        });
        signature = result.signedMessage;
        console.log('[Auth] Message signed successfully');
      } catch (signError) {
        console.error('[Auth] signMessage failed:', signError);
        setAuthError('Wallet does not support message signing. Please use Freighter v5+.');
        return false;
      }

      // 3. Login
      const loginRes = await api.post('/auth/login', {
        wallet_address: walletAddress,
        challenge: challenge,
        signature: signature,
        role: 'client',
      });

      const accessToken = loginRes.data.access_token;
      localStorage.setItem(TOKEN_KEY, accessToken);
      console.log('[Auth] Login successful, token stored');
      setAuthError(null);
      return true;
    } catch (error) {
      console.error('[Auth] Authentication failed:', error?.response?.data || error);
      const detail = error?.response?.data?.detail || 'Authentication failed. Please try reconnecting your wallet.';
      setAuthError(detail);
      return false;
    }
  }, []);

  // Connect wallet (skip backend auth — endpoints work without JWT)
  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      setShowConsent(false);
      setAuthError(null);

      const res = await StellarWalletsKit.authModal();
      console.log('[Wallet] Connected:', res.address);
      setAddress(res.address);
    } catch (error) {
      console.error('[Wallet] Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const requestConnect = useCallback(() => {
    setShowConsent(true);
  }, []);

  const closeConsent = useCallback(() => {
    setShowConsent(false);
  }, []);

  const disconnectWallet = async () => {
    setAddress(null);
    setAuthError(null);
    localStorage.removeItem(TOKEN_KEY);
    try {
      await StellarWalletsKit.disconnect();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <WalletContext.Provider value={{
      address,
      authError,
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
