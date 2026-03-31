import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import {
  getContractState,
  getContractAmount,
  depositFunds,
  approveRelease,
  adminRefund,
  adminForceRelease,
} from '../services/contract';
import { ShieldCheck, Clock, CheckCircle2, XCircle, Loader2, ExternalLink, RefreshCw } from 'lucide-react';

const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID;

// ─── State Badge ─────────────────────────────────────────────────────────────
const STATE_CONFIG = {
  Pending:  { label: 'Pending Deposit',  color: 'bg-yellow-500/20 text-yellow-500',  icon: Clock },
  Funded:   { label: 'Funds Locked',     color: 'bg-blue-500/20 text-blue-400',      icon: ShieldCheck },
  Released: { label: 'Released to Artist', color: 'bg-green-500/20 text-green-400',  icon: CheckCircle2 },
  Refunded: { label: 'Refunded to Client', color: 'bg-red-500/20 text-red-400',      icon: XCircle },
  Unknown:  { label: 'Unknown',          color: 'bg-textmuted/20 text-textmuted',    icon: Clock },
};

function StateBadge({ state }) {
  const cfg = STATE_CONFIG[state] || STATE_CONFIG.Unknown;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${cfg.color}`}>
      <Icon className="w-4 h-4" />
      {cfg.label}
    </span>
  );
}

// ─── Transaction Toast ────────────────────────────────────────────────────────
function TxToast({ tx, onClose }) {
  if (!tx) return null;
  const isError = tx.type === 'error';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-2xl shadow-2xl border ${
        isError
          ? 'bg-red-500/10 border-red-500/30 text-red-400'
          : 'bg-green-500/10 border-green-500/30 text-green-400'
      }`}
    >
      <div className="font-bold mb-1">{isError ? '❌ Error' : '✅ Success'}</div>
      <div className="text-sm opacity-90 mb-2">{tx.message}</div>
      {tx.explorerUrl && (
        <a
          href={tx.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs flex items-center gap-1 underline opacity-75 hover:opacity-100"
        >
          View on Stellar Expert <ExternalLink className="w-3 h-3" />
        </a>
      )}
      <button onClick={onClose} className="absolute top-2 right-3 text-lg opacity-50 hover:opacity-100">×</button>
    </motion.div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { address } = useWallet();

  const [contractState, setContractState] = useState(null);
  const [lockedAmount,  setLockedAmount]  = useState(0n);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast,    setToast]    = useState(null);
  const [usdcInput, setUsdcInput] = useState('10');

  // ── Fetch contract state ─────────────────────────────────────────────────
  const fetchState = useCallback(async () => {
    if (!address) return;
    setFetching(true);
    try {
      const [state, amount] = await Promise.all([
        getContractState(address),
        getContractAmount(address),
      ]);
      setContractState(state);
      setLockedAmount(amount);
    } catch (e) {
      console.error('Failed to fetch contract state:', e);
      setContractState('Unknown');
    } finally {
      setFetching(false);
    }
  }, [address]);

  useEffect(() => { fetchState(); }, [fetchState]);

  // ── Invoke helper ────────────────────────────────────────────────────────
  const invoke = async (fn, label) => {
    setLoading(true);
    setToast(null);
    try {
      const result = await fn();
      setToast({
        type: 'success',
        message: `${label} confirmed on-chain! ✓`,
        explorerUrl: result.explorerUrl,
      });
      await fetchState(); // Refresh state after transaction
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  };

  const usdcFormatted = lockedAmount > 0n
    ? (Number(lockedAmount) / 10_000_000).toFixed(2)
    : '0.00';

  // ─── Render ─────────────────────────────────────────────────────────────
  if (!address) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
        <ShieldCheck className="w-16 h-16 text-primary mb-6 opacity-50" />
        <h1 className="text-3xl font-bold mb-3">Connect Your Wallet</h1>
        <p className="text-textmuted max-w-md">
          Connect your Freighter wallet (set to Testnet) to interact with the ComiSure escrow contract.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <TxToast tx={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Escrow Dashboard</h1>
          <p className="text-textmuted text-sm font-mono truncate max-w-xs" title={address}>
            {address.slice(0, 10)}...{address.slice(-6)}
          </p>
        </div>
        <button
          onClick={fetchState}
          disabled={fetching}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-textmuted hover:text-textmain transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${fetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Contract Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 mb-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-textmuted mb-1 font-mono">CONTRACT</p>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-mono text-primary hover:underline flex items-center gap-1"
            >
              {CONTRACT_ID?.slice(0, 12)}...{CONTRACT_ID?.slice(-6)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex flex-col items-end gap-2">
            {contractState ? (
              <StateBadge state={contractState} />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin text-textmuted" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border bg-background">
            <p className="text-xs text-textmuted mb-1">Locked Amount</p>
            <p className="text-2xl font-bold">{usdcFormatted} <span className="text-sm text-textmuted">USDC</span></p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-background">
            <p className="text-xs text-textmuted mb-1">Escrow State</p>
            <p className="text-2xl font-bold">{contractState ?? '—'}</p>
          </div>
        </div>
      </motion.div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Deposit Funds */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6"
        >
          <h2 className="text-xl font-bold mb-1">Deposit Funds</h2>
          <p className="text-textmuted text-sm mb-4">
            Lock USDC into the escrow contract. State must be <strong>Pending</strong>.
          </p>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              min="1"
              value={usdcInput}
              onChange={(e) => setUsdcInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-border bg-background text-textmain focus:outline-none focus:border-primary transition-colors"
              placeholder="USDC amount"
            />
            <span className="flex items-center text-sm text-textmuted px-2">USDC</span>
          </div>
          <button
            disabled={loading || contractState !== 'Pending'}
            onClick={() => invoke(() => depositFunds(address, Number(usdcInput)), 'Deposit')}
            className="w-full px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Deposit {usdcInput} USDC
          </button>
          {contractState !== 'Pending' && (
            <p className="text-xs text-textmuted mt-2 text-center">
              Only available when state is <strong>Pending</strong>
            </p>
          )}
        </motion.div>

        {/* Approve Release */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-6"
        >
          <h2 className="text-xl font-bold mb-1">Approve Release</h2>
          <p className="text-textmuted text-sm mb-4">
            Release locked USDC to the artist. State must be <strong>Funded</strong>.
          </p>
          <button
            disabled={loading || contractState !== 'Funded'}
            onClick={() => invoke(() => approveRelease(address), 'Approve Release')}
            className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-10"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Approve & Release Funds
          </button>
          {contractState !== 'Funded' && (
            <p className="text-xs text-textmuted mt-2 text-center">
              Only available when state is <strong>Funded</strong>
            </p>
          )}
        </motion.div>

        {/* Admin Refund */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 border border-red-500/10"
        >
          <h2 className="text-xl font-bold mb-1 text-red-400">Admin Refund</h2>
          <p className="text-textmuted text-sm mb-4">
            Refund the client. Use when the artist ghosts. State must be <strong>Funded</strong>.
          </p>
          <button
            disabled={loading || contractState !== 'Funded'}
            onClick={() => invoke(() => adminRefund(address), 'Admin Refund')}
            className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Refund Client
          </button>
        </motion.div>

        {/* Admin Force Release */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel p-6 border border-orange-500/10"
        >
          <h2 className="text-xl font-bold mb-1 text-orange-400">Force Release</h2>
          <p className="text-textmuted text-sm mb-4">
            Force-pay the artist. Use when the client withholds approval unfairly.
          </p>
          <button
            disabled={loading || contractState !== 'Funded'}
            onClick={() => invoke(() => adminForceRelease(address), 'Force Release')}
            className="w-full px-4 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Force Release to Artist
          </button>
        </motion.div>
      </div>

      {/* Note about USDC */}
      <div className="mt-8 p-4 rounded-xl border border-border bg-background text-sm text-textmuted">
        <strong className="text-textmain">💡 Note:</strong> Depositing USDC requires a USDC trustline and testnet USDC balance on your wallet.
        Get testnet USDC from the{' '}
        <a href="https://lab.stellar.org" target="_blank" rel="noreferrer" className="text-primary underline">
          Stellar Lab
        </a>
        {' '}or contact the testnet USDC issuer.{' '}
        <a
          href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline"
        >
          View contract on Stellar Expert →
        </a>
      </div>
    </div>
  );
}
