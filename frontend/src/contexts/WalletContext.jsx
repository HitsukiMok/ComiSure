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
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    StellarWalletsKit.init({
      network: Networks.TESTNET,
      modules: defaultModules(),
    });
  }, []);

  // Attach JWT token to all API requests
  useEffect(() => {
    const interceptor = api.interceptors.request.use((config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => api.interceptors.request.eject(interceptor);
  }, [token]);

  // Authenticate with backend after wallet connect
  const authenticateWithBackend = useCallback(async (walletAddress) => {
    try {
      // 1. Get challenge from backend
      const challengeRes = await api.get('/auth/challenge', {
        params: { wallet_address: walletAddress },
      });
      const challenge = challengeRes.data.challenge;

      // 2. Sign the challenge with the wallet
      const { signedMessage } = await StellarWalletsKit.signMessage(challenge);

      // 3. Login with signed challenge
      const loginRes = await api.post('/auth/login', {
        wallet_address: walletAddress,
        challenge: challenge,
        signature: signedMessage,
        role: 'client',
      });

      const accessToken = loginRes.data.access_token;
      setToken(accessToken);
      localStorage.setItem(TOKEN_KEY, accessToken);
      setAuthError(null);
      return true;
    } catch (error) {
      console.error('Backend authentication failed:', error);
      setAuthError('Authentication failed. You can still browse but cannot create commissions.');
      // Still allow wallet connection even if backend auth fails
      return false;
    }
  }, []);

  // Connect wallet + authenticate
  const connectWallet = useCallback(async () => {
    try {
      setIsConnecting(true);
      setShowConsent(false);
      setAuthError(null);

      // Connect wallet via Stellar Wallets Kit
      const res = await StellarWalletsKit.authModal();
      setAddress(res.address);

      // Authenticate with backend
      await authenticateWithBackend(res.address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [authenticateWithBackend]);

  // Show consent modal first
  const requestConnect = useCallback(() => {
    setShowConsent(true);
  }, []);

  const closeConsent = useCallback(() => {
    setShowConsent(false);
  }, []);

  const disconnectWallet = async () => {
    setAddress(null);
    setToken(null);
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
      token,
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
