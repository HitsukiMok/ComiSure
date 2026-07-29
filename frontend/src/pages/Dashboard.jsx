import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import {
  getContractState,
  getContractAmount,
  getContractDeadline,
  depositFunds,
  approveRelease,
  clientRefundExpired,
  friendlyContractError,
} from '../services/contract';
import { commissionService } from '../services/api';
import { ShieldCheck, Clock, CheckCircle2, XCircle, Loader2, ExternalLink, RefreshCw, Plus, ArrowLeft } from 'lucide-react';

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

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { address } = useWallet();
  const [commissions, setCommissions] = useState([]);
  const [loadingCommissions, setLoadingCommissions] = useState(true);
  
  // Navigation State
  const [activeView, setActiveView] = useState('list'); // 'list' | 'create' | 'escrow'
  const [selectedCommission, setSelectedCommission] = useState(null);

  // Load user's commissions from FastAPI
  const fetchCommissions = useCallback(async () => {
    if (!address) return;
    setLoadingCommissions(true);
    try {
      // By checking client_address, we see commissions where user is paying
      // We can also check artist_address, but since the API requires one at a time we'll do both or just let frontend filter.
      // For simplicity, we fetch all where user is client.
      const clientComms = await commissionService.getAll({ client_address: address });
      const artistComms = await commissionService.getAll({ artist_address: address });
      
      // Deduplicate if user is both somehow
      const all = [...clientComms, ...artistComms];
      const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
      unique.sort((a,b) => b.id - a.id); // newest first
      setCommissions(unique);
    } catch (e) {
      console.error("Failed to load commissions:", e);
    } finally {
      setLoadingCommissions(false);
    }
  }, [address]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  if (!address) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center justify-center text-center">
        <ShieldCheck className="w-16 h-16 text-primary mb-6 opacity-50" />
        <h1 className="text-3xl font-bold mb-3">Connect Your Wallet</h1>
        <p className="text-textmuted max-w-md">
          Connect your Freighter wallet to interact with the ComiSure Escrow platform.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">My Commissions</h1>
          <p className="text-textmuted text-sm font-mono truncate max-w-xs" title={address}>
            {address.slice(0, 10)}...{address.slice(-6)}
          </p>
        </div>
        {activeView === 'list' && (
          <button
            onClick={() => setActiveView('create')}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Commission
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'list' && (
           <motion.div key="list" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
             {loadingCommissions ? (
               <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
             ) : commissions.length === 0 ? (
               <div className="glass-panel p-12 text-center">
                 <h3 className="text-xl font-bold mb-2">No Commissions Found</h3>
                 <p className="text-textmuted mb-6">You don't have any active escrows on the network yet.</p>
                 <button
                    onClick={() => setActiveView('create')}
                    className="px-6 py-2 bg-textmain text-background font-bold rounded-full"
                  >
                    Create Your First Commission
                  </button>
               </div>
             ) : (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {commissions.map(c => (
                   <div 
                     key={c.id} 
                     onClick={() => { setSelectedCommission(c); setActiveView('escrow'); }}
                     className="glass-panel p-6 cursor-pointer hover:border-primary transition-colors flex flex-col h-full"
                   >
                     <div className="flex justify-between items-start mb-4">
                       <h3 className="text-lg font-bold">{c.title}</h3>
                       <span className="text-sm font-bold text-primary">{c.amount_usdc} USDC</span>
                     </div>
                     <p className="text-sm text-textmuted mb-4 line-clamp-2 flex-grow">{c.description}</p>
                     <div className="text-xs font-mono text-textmuted bg-background p-2 rounded-lg truncate">
                       ID: {c.contract_id || "Deploying..."}
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </motion.div>
        )}

        {activeView === 'create' && (
           <motion.div key="create" initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}}>
             <CreateCommissionView 
                address={address} 
                onCancel={() => setActiveView('list')}
                onSuccess={(newComm) => {
                  fetchCommissions(); // Refresh the list
                  setSelectedCommission(newComm);
                  setActiveView('escrow'); // Immediately open panel
                }}
             />
           </motion.div>
        )}

        {activeView === 'escrow' && selectedCommission && (
           <motion.div key="escrow" initial={{opacity: 0, x: 20}} animate={{opacity: 1, x: 0}} exit={{opacity: 0}}>
             <button 
                onClick={() => { setActiveView('list'); setSelectedCommission(null); fetchCommissions(); }}
                className="flex items-center gap-2 text-textmuted hover:text-textmain mb-6 font-semibold"
             >
                <ArrowLeft className="w-4 h-4"/> Back to list
             </button>
             <ActiveEscrowView commission={selectedCommission} walletAddress={address} />
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Create Commission View ───────────────────────────────────────────────────
function CreateCommissionView({ address, onCancel, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    artist_address: '',
    amount_usdc: '10',
    deadline_days: '14'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        client_address: address, // Sender is the client
        artist_address: formData.artist_address,
        amount_usdc: parseInt(formData.amount_usdc, 10),
        deadline_days: parseInt(formData.deadline_days, 10),
      };
      
      // Hits the POST /commissions/ hook, triggering the physical contract deployment under the hood!
      const newCommission = await commissionService.create(payload);
      onSuccess(newCommission);
    } catch (e) {
      alert("Failed to create and deploy contract: " + friendlyContractError(e, { actorLabel: 'The backend deployer' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Escrow 🚀</h2>
      <p className="text-sm text-textmuted mb-8">
        Once submitted, the ComiSure backend will dynamically compile, deploy, and initialize a unique Soroban Smart Contract exclusively for this commission. This may take up to 15 seconds.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2">Title</label>
          <input required type="text" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary outline-none" 
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Cyberpunk Character Portrait" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Description / Requirements</label>
          <textarea required rows={3} className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary outline-none" 
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Provide a link to references..." />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Artist Stellar Address</label>
          <input required type="text" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary outline-none font-mono text-sm" 
            value={formData.artist_address} onChange={e => setFormData({...formData, artist_address: e.target.value})} placeholder="G..." />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Commission Amount (USDC)</label>
          <input required type="number" min="1" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary outline-none" 
            value={formData.amount_usdc} onChange={e => setFormData({...formData, amount_usdc: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-2">Deadline (Days)</label>
          <p className="text-xs text-textmuted mb-2">
            You can self-refund after this many days if the artist does not deliver. Min 1, max 90.
          </p>
          <input required type="number" min="1" max="90" className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary outline-none" 
            value={formData.deadline_days} onChange={e => setFormData({...formData, deadline_days: e.target.value})} />
        </div>
        <div className="pt-6 flex gap-4">
          <button type="button" onClick={onCancel} disabled={loading} className="flex-1 px-4 py-3 border border-border text-center rounded-xl hover:bg-background transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="flex-[2] flex gap-2 justify-center items-center px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-colors">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Deploying On-Chain...</> : "Deploy Contract & Init"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Active Escrow View (Dynamically Loaded) ──────────────────────────────────
function ActiveEscrowView({ commission, walletAddress }) {
  const [contractState, setContractState] = useState(null);
  const [lockedAmount,  setLockedAmount]  = useState(0n);
  const [deadline,      setDeadline]      = useState(null);
  const [timeLeft,      setTimeLeft]      = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [fetching, setFetching] = useState(false);
  const [toast,    setToast]    = useState(null);
  
  const contractId = commission.contract_id;

  const fetchState = useCallback(async () => {
    if (!walletAddress || !contractId) return;
    setFetching(true);
    try {
      const [state, amount, dl] = await Promise.all([
        getContractState(contractId, walletAddress),
        getContractAmount(contractId, walletAddress),
        getContractDeadline(contractId, walletAddress).catch(() => 0n),
      ]);
      setContractState(state);
      setLockedAmount(amount);
      setDeadline(dl);
    } catch (e) {
      console.error('Failed to fetch contract state:', e);
      setContractState('Unknown');
    } finally {
      setFetching(false);
    }
  }, [walletAddress, contractId]);

  useEffect(() => { fetchState(); }, [fetchState]);

  // Countdown timer for deadline
  useEffect(() => {
    if (!deadline || deadline === 0n) return;
    const deadlineMs = Number(deadline) * 1000;

    const tick = () => {
      const diff = deadlineMs - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired');
      } else {
        const days = Math.floor(diff / 86_400_000);
        const hours = Math.floor((diff % 86_400_000) / 3_600_000);
        const mins = Math.floor((diff % 3_600_000) / 60_000);
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      }
    };

    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [deadline]);

  const invoke = async (fn, label) => {
    setLoading(true);
    setToast(null);
    try {
      const result = await fn();
      setToast({ type: 'success', message: `${label} confirmed! ✓`, explorerUrl: result.explorerUrl });
      await fetchState();
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: friendlyContractError(e, { actorLabel: 'The connected wallet' }) });
    } finally {
      setLoading(false);
    }
  };

  const invokeBackendAdmin = async (apiCall, label) => {
    setLoading(true);
    setToast(null);
    try {
      await apiCall();
      setToast({ type: 'success', message: `${label} successful! ✓` });
      await fetchState();
    } catch (e) {
      console.error(e);
      setToast({ type: 'error', message: friendlyContractError(e, { actorLabel: 'The backend service' }) });
    } finally {
      setLoading(false);
    }
  };

  const usdcFormatted = lockedAmount > 0n ? (Number(lockedAmount) / 10_000_000).toFixed(2) : '0.00';
  const displayId = contractId || "PENDING";
  
  return (
    <>
      <TxToast tx={toast} onClose={() => setToast(null)} />
      
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">{commission.title}</h2>
            <div className="mt-2 flex items-center gap-2">
               <p className="text-xs text-textmuted font-mono">ID</p>
               <a href={`https://stellar.expert/explorer/testnet/contract/${displayId}`} target="_blank" rel="noreferrer" className="text-sm font-mono text-primary hover:underline flex items-center gap-1">
                 {displayId.slice(0, 12)}...{displayId.slice(-6)} <ExternalLink className="w-3 h-3" />
               </a>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button onClick={fetchState} disabled={fetching} className="text-xs text-textmuted hover:text-textmain flex items-center gap-1 mb-1">
              <RefreshCw className={`w-3 h-3 ${fetching ? 'animate-spin' : ''}`} /> Refresh
            </button>
            {contractState ? <StateBadge state={contractState} /> : <Loader2 className="w-5 h-5 animate-spin text-textmuted" />}
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
          <div className="p-4 rounded-xl border border-border bg-background sm:col-span-2">
            <p className="text-xs text-textmuted mb-1">Deadline</p>
            <p className={`text-2xl font-bold ${timeLeft === 'Expired' ? 'text-red-400' : ''}`}>
              {timeLeft ?? '—'}
            </p>
            {timeLeft === 'Expired' && (
              <p className="text-xs text-red-400 mt-1">The commission deadline has passed. Client can claim a refund.</p>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deposit Funds */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-1">Deposit Funds</h2>
          <p className="text-textmuted text-sm mb-4">Lock {commission.amount_usdc} USDC into the contract.</p>
          <button
            disabled={loading || contractState !== 'Pending'}
            onClick={() => invoke(() => depositFunds(contractId, walletAddress, commission.amount_usdc), 'Deposit')}
            className="w-full px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Deposit {commission.amount_usdc} USDC
          </button>
        </motion.div>

        {/* Approve Release */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-panel p-6">
          <h2 className="text-xl font-bold mb-1">Approve Release</h2>
          <p className="text-textmuted text-sm mb-4">Release locked funds to <strong>{commission.artist_address.slice(0, 6)}...</strong></p>
          <button
            disabled={loading || contractState !== 'Funded'}
            onClick={() => invoke(() => approveRelease(contractId, walletAddress), 'Approve Release')}
            className="w-full px-4 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Approve & Release
          </button>
        </motion.div>

        {/* Claim Expired Refund — only visible when Funded AND deadline expired */}
        {contractState === 'Funded' && timeLeft === 'Expired' && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-1">Claim Expired Refund</h2>
            <p className="text-textmuted text-sm mb-4">The deadline has passed. You can reclaim your locked USDC without admin help.</p>
            <button
              disabled={loading}
              onClick={() => invoke(() => clientRefundExpired(contractId, walletAddress), 'Expired Refund')}
              className="w-full px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Claim Refund (Deadline Expired)
            </button>
          </motion.div>
        )}

        {/* Admin Bounds */}
        <div className="md:col-span-2 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <button
             disabled={loading || contractState !== 'Funded'}
             onClick={() => invokeBackendAdmin(() => commissionService.adminRefund(commission.id), 'Admin Refund (Backend)')}
             className="px-4 py-3 border border-red-500/30 text-red-500 bg-red-500/5 font-bold text-sm rounded-xl hover:bg-red-500/10 disabled:opacity-40"
           >
             Admin: Refund Client
           </button>
           <button
             disabled={loading || contractState !== 'Funded'}
             onClick={() => invokeBackendAdmin(() => commissionService.adminForceRelease(commission.id), 'Force Release (Backend)')}
             className="px-4 py-3 border border-orange-500/30 text-orange-500 bg-orange-500/5 font-bold text-sm rounded-xl hover:bg-orange-500/10 disabled:opacity-40"
           >
             Admin: Force-Release to Artist
           </button>
        </div>
      </div>
    </>
  );
}
